-- PID-X RLS (Row Level Security) 정책
-- PRD v1.1 섹션 4.3 보안

-- ============================================================
-- 헬퍼 함수
-- ============================================================

-- 프로젝트 멤버 여부 확인 (owner 포함)
CREATE OR REPLACE FUNCTION is_project_member(p_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = p_id AND user_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM projects
    WHERE id = p_id AND owner_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- 프로젝트 내 특정 역할 이상 확인
CREATE OR REPLACE FUNCTION has_project_role(p_id UUID, min_role project_role)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM projects WHERE id = p_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM project_members
    WHERE project_id = p_id AND user_id = auth.uid()
    AND (
      CASE
        WHEN min_role = 'viewer' THEN role IN ('viewer', 'editor', 'admin')
        WHEN min_role = 'editor' THEN role IN ('editor', 'admin')
        WHEN min_role = 'admin' THEN role = 'admin'
      END
    )
  );
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- profiles
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select" ON profiles
  FOR SELECT TO authenticated
  USING (true);

CREATE POLICY "profiles_update_own" ON profiles
  FOR UPDATE TO authenticated
  USING (id = auth.uid());

-- ============================================================
-- projects
-- ============================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "projects_select" ON projects
  FOR SELECT TO authenticated
  USING (is_project_member(id) AND is_deleted = FALSE);

CREATE POLICY "projects_insert" ON projects
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "projects_update" ON projects
  FOR UPDATE TO authenticated
  USING (has_project_role(id, 'admin'));

CREATE POLICY "projects_delete" ON projects
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- ============================================================
-- project_members
-- ============================================================
ALTER TABLE project_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "members_select" ON project_members
  FOR SELECT TO authenticated
  USING (is_project_member(project_id));

CREATE POLICY "members_insert" ON project_members
  FOR INSERT TO authenticated
  WITH CHECK (has_project_role(project_id, 'admin'));

CREATE POLICY "members_update" ON project_members
  FOR UPDATE TO authenticated
  USING (has_project_role(project_id, 'admin'));

CREATE POLICY "members_delete" ON project_members
  FOR DELETE TO authenticated
  USING (has_project_role(project_id, 'admin'));

-- ============================================================
-- units
-- ============================================================
ALTER TABLE units ENABLE ROW LEVEL SECURITY;

CREATE POLICY "units_select" ON units
  FOR SELECT TO authenticated
  USING (is_project_member(project_id));

CREATE POLICY "units_insert" ON units
  FOR INSERT TO authenticated
  WITH CHECK (has_project_role(project_id, 'editor'));

CREATE POLICY "units_update" ON units
  FOR UPDATE TO authenticated
  USING (has_project_role(project_id, 'editor'));

-- ============================================================
-- drawings
-- ============================================================
ALTER TABLE drawings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "drawings_select" ON drawings
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM units u WHERE u.id = drawings.unit_id AND is_project_member(u.project_id)
    )
  );

CREATE POLICY "drawings_insert" ON drawings
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM units u WHERE u.id = unit_id AND has_project_role(u.project_id, 'editor')
    )
  );

-- ============================================================
-- pdf_uploads
-- ============================================================
ALTER TABLE pdf_uploads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "uploads_select" ON pdf_uploads
  FOR SELECT TO authenticated
  USING (is_project_member(project_id));

CREATE POLICY "uploads_insert" ON pdf_uploads
  FOR INSERT TO authenticated
  WITH CHECK (is_project_member(project_id) AND uploaded_by = auth.uid());

CREATE POLICY "uploads_update" ON pdf_uploads
  FOR UPDATE TO authenticated
  USING (has_project_role(project_id, 'editor'));

-- ============================================================
-- page_texts
-- ============================================================
ALTER TABLE page_texts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "page_texts_select" ON page_texts
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM pdf_uploads u WHERE u.id = page_texts.upload_id AND is_project_member(u.project_id)
    )
  );

-- page_texts INSERT는 service_role 전용 (파서)
-- authenticated 유저는 직접 INSERT 불가

-- ============================================================
-- pipe_lines
-- ============================================================
ALTER TABLE pipe_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "lines_select" ON pipe_lines
  FOR SELECT TO authenticated
  USING (is_project_member(project_id));

CREATE POLICY "lines_update" ON pipe_lines
  FOR UPDATE TO authenticated
  USING (has_project_role(project_id, 'editor'));

-- pipe_lines INSERT는 service_role 전용 (파서)

-- ============================================================
-- equipment
-- ============================================================
ALTER TABLE equipment ENABLE ROW LEVEL SECURITY;

CREATE POLICY "equipment_select" ON equipment
  FOR SELECT TO authenticated
  USING (is_project_member(project_id));

CREATE POLICY "equipment_update" ON equipment
  FOR UPDATE TO authenticated
  USING (has_project_role(project_id, 'editor'));

-- ============================================================
-- instruments
-- ============================================================
ALTER TABLE instruments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "instruments_select" ON instruments
  FOR SELECT TO authenticated
  USING (is_project_member(project_id));

-- ============================================================
-- test_packages
-- ============================================================
ALTER TABLE test_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "packages_select" ON test_packages
  FOR SELECT TO authenticated
  USING (is_project_member(project_id));

CREATE POLICY "packages_update" ON test_packages
  FOR UPDATE TO authenticated
  USING (has_project_role(project_id, 'editor'));

-- ============================================================
-- golden_joints
-- ============================================================
ALTER TABLE golden_joints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gj_select" ON golden_joints
  FOR SELECT TO authenticated
  USING (is_project_member(project_id));

CREATE POLICY "gj_update" ON golden_joints
  FOR UPDATE TO authenticated
  USING (has_project_role(project_id, 'editor'));

-- ============================================================
-- pkg_line_map
-- ============================================================
ALTER TABLE pkg_line_map ENABLE ROW LEVEL SECURITY;

CREATE POLICY "pkg_line_map_select" ON pkg_line_map
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM test_packages tp WHERE tp.id = pkg_line_map.package_id AND is_project_member(tp.project_id)
    )
  );

-- ============================================================
-- audit_logs
-- ============================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "audit_select" ON audit_logs
  FOR SELECT TO authenticated
  USING (has_project_role(project_id, 'admin'));

-- audit_logs INSERT는 service_role 전용

-- ============================================================
-- Supabase Storage 정책
-- ============================================================
-- pdf-uploads 버킷과 reports 버킷은 Supabase Dashboard에서 생성
-- 아래는 Storage RLS 정책 (SQL로 관리하려면 storage.objects 테이블 사용)

-- INSERT: 인증 사용자
INSERT INTO storage.buckets (id, name, public) VALUES ('pdf-uploads', 'pdf-uploads', false) ON CONFLICT DO NOTHING;
INSERT INTO storage.buckets (id, name, public) VALUES ('reports', 'reports', false) ON CONFLICT DO NOTHING;

CREATE POLICY "storage_pdf_upload" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'pdf-uploads');

CREATE POLICY "storage_pdf_select" ON storage.objects
  FOR SELECT TO authenticated
  USING (bucket_id IN ('pdf-uploads', 'reports'));

CREATE POLICY "storage_report_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'reports');
