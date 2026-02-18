-- PID-X 초기 스키마
-- PRD v1.1 섹션 5.1 ERD + 5.2 Enum 기반

-- ============================================================
-- 1. Enum 타입 생성
-- ============================================================
CREATE TYPE test_medium AS ENUM ('H', 'V', 'P', 'S');
CREATE TYPE package_status AS ENUM ('draft', 'ready', 'in_progress', 'completed', 'approved');
CREATE TYPE golden_joint_status AS ENUM ('identified', 'welding', 'nde', 'pwht', 'approved');
CREATE TYPE parse_status AS ENUM ('pending', 'processing', 'completed', 'failed');
CREATE TYPE project_role AS ENUM ('admin', 'editor', 'viewer');
CREATE TYPE line_status AS ENUM ('extracted', 'verified', 'modified');

-- ============================================================
-- 2. profiles (auth.users 확장)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- auth.users INSERT 시 profiles 자동 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 3. projects
-- ============================================================
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  client VARCHAR(200),
  description TEXT,
  owner_id UUID NOT NULL REFERENCES profiles(id),
  is_deleted BOOLEAN DEFAULT FALSE NOT NULL,
  deleted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_projects_owner ON projects(owner_id) WHERE is_deleted = FALSE;

-- updated_at 자동 갱신 트리거
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================================
-- 4. project_members
-- ============================================================
CREATE TABLE project_members (
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role project_role DEFAULT 'viewer' NOT NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (user_id, project_id)
);

CREATE INDEX idx_members_project ON project_members(project_id);

-- ============================================================
-- 5. units
-- ============================================================
CREATE TABLE units (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  code VARCHAR(10) NOT NULL,
  name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(project_id, code)
);

-- ============================================================
-- 6. drawings
-- ============================================================
CREATE TABLE drawings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  unit_id UUID NOT NULL REFERENCES units(id) ON DELETE CASCADE,
  drawing_no VARCHAR(100) NOT NULL,
  title TEXT,
  revision VARCHAR(20),
  rev_date VARCHAR(20),
  page_start INT,
  page_end INT
);

CREATE INDEX idx_drawings_unit ON drawings(unit_id);

-- ============================================================
-- 7. pdf_uploads
-- ============================================================
CREATE TABLE pdf_uploads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  filename VARCHAR(500) NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT NOT NULL,
  total_pages INT,
  parse_status parse_status DEFAULT 'pending' NOT NULL,
  progress INT DEFAULT 0 NOT NULL,
  revision VARCHAR(20),
  error_message TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  uploaded_by UUID NOT NULL REFERENCES profiles(id)
);

CREATE INDEX idx_uploads_project ON pdf_uploads(project_id);

-- ============================================================
-- 8. page_texts
-- ============================================================
CREATE TABLE page_texts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  upload_id UUID NOT NULL REFERENCES pdf_uploads(id) ON DELETE CASCADE,
  page_number INT NOT NULL,
  raw_text TEXT NOT NULL DEFAULT '',
  drawing_id UUID REFERENCES drawings(id),
  extracted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_page_texts_upload ON page_texts(upload_id, page_number);

-- ============================================================
-- 9. pipe_lines
-- ============================================================
CREATE TABLE pipe_lines (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  line_number VARCHAR(100) NOT NULL,
  nominal_size VARCHAR(10),
  service_code VARCHAR(10),
  spec_class VARCHAR(20),
  unit_id UUID REFERENCES units(id),
  source_pages JSONB DEFAULT '[]'::jsonb,
  status line_status DEFAULT 'extracted' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(project_id, line_number)
);

CREATE INDEX idx_lines_project_size ON pipe_lines(project_id, nominal_size);
CREATE INDEX idx_lines_project_service ON pipe_lines(project_id, service_code);

-- ============================================================
-- 10. equipment
-- ============================================================
CREATE TABLE equipment (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_no VARCHAR(50) NOT NULL,
  equip_type VARCHAR(30),
  unit_id UUID REFERENCES units(id),
  source_pages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(project_id, tag_no)
);

CREATE INDEX idx_equipment_project_type ON equipment(project_id, equip_type);

-- ============================================================
-- 11. instruments
-- ============================================================
CREATE TABLE instruments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  tag_no VARCHAR(50) NOT NULL,
  function_type VARCHAR(10),
  unit_id UUID REFERENCES units(id),
  source_pages JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 12. test_packages
-- ============================================================
CREATE TABLE test_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  package_no VARCHAR(50) NOT NULL,
  system_code VARCHAR(10),
  test_pressure VARCHAR(30),
  test_medium test_medium NOT NULL,
  source_page INT,
  status package_status DEFAULT 'draft' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_packages_project_system ON test_packages(project_id, system_code);

-- ============================================================
-- 13. golden_joints
-- ============================================================
CREATE TABLE golden_joints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  test_package_id UUID REFERENCES test_packages(id),
  source_page INT,
  related_lines JSONB DEFAULT '[]'::jsonb,
  status golden_joint_status DEFAULT 'identified' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- 14. pkg_line_map (M:N)
-- ============================================================
CREATE TABLE pkg_line_map (
  package_id UUID NOT NULL REFERENCES test_packages(id) ON DELETE CASCADE,
  pipeline_id UUID NOT NULL REFERENCES pipe_lines(id) ON DELETE CASCADE,
  PRIMARY KEY (package_id, pipeline_id)
);

-- ============================================================
-- 15. audit_logs
-- ============================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id UUID,
  old_value JSONB,
  new_value JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_audit_project_time ON audit_logs(project_id, created_at DESC);
