// Supabase CLI로 자동 생성 예정 (npx supabase gen types typescript)
// 아래는 수동 placeholder — 마이그레이션 적용 후 CLI로 덮어쓰기

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: { id: string; name: string | null; avatar_url: string | null; created_at: string };
        Insert: { id: string; name?: string | null; avatar_url?: string | null };
        Update: { name?: string | null; avatar_url?: string | null };
        Relationships: [];
      };
      projects: {
        Row: {
          id: string; name: string; client: string | null; description: string | null;
          owner_id: string; is_deleted: boolean; deleted_at: string | null;
          created_at: string; updated_at: string;
        };
        Insert: { name: string; client?: string | null; description?: string | null; owner_id: string };
        Update: { name?: string; client?: string | null; description?: string | null; is_deleted?: boolean; deleted_at?: string | null };
        Relationships: [];
      };
      project_members: {
        Row: { user_id: string; project_id: string; role: ProjectRole; invited_at: string };
        Insert: { user_id: string; project_id: string; role?: ProjectRole };
        Update: { role?: ProjectRole };
        Relationships: [];
      };
      units: {
        Row: { id: string; project_id: string; code: string; name: string | null; created_at: string };
        Insert: { project_id: string; code: string; name?: string | null };
        Update: { code?: string; name?: string | null };
        Relationships: [];
      };
      drawings: {
        Row: {
          id: string; unit_id: string; drawing_no: string; title: string | null;
          revision: string | null; rev_date: string | null;
          page_start: number | null; page_end: number | null;
        };
        Insert: { unit_id: string; drawing_no: string; title?: string | null; revision?: string | null; rev_date?: string | null; page_start?: number | null; page_end?: number | null };
        Update: { title?: string | null; revision?: string | null; rev_date?: string | null };
        Relationships: [];
      };
      pdf_uploads: {
        Row: {
          id: string; project_id: string; filename: string; file_size: number;
          storage_path: string; total_pages: number | null;
          parse_status: ParseStatus; progress: number;
          revision: string | null; error_message: string | null;
          uploaded_at: string; uploaded_by: string;
        };
        Insert: {
          id?: string; project_id: string; filename: string; file_size: number;
          storage_path: string; total_pages?: number | null;
          parse_status?: ParseStatus; revision?: string | null;
          uploaded_by: string;
        };
        Update: {
          total_pages?: number | null; parse_status?: ParseStatus;
          progress?: number; error_message?: string | null;
        };
        Relationships: [];
      };
      page_texts: {
        Row: { id: string; upload_id: string; page_number: number; raw_text: string; drawing_id: string | null; extracted_at: string };
        Insert: { upload_id: string; page_number: number; raw_text: string; drawing_id?: string | null };
        Update: { drawing_id?: string | null };
        Relationships: [];
      };
      pipe_lines: {
        Row: {
          id: string; project_id: string; line_number: string; nominal_size: string | null;
          service_code: string | null; spec_class: string | null;
          unit_id: string | null; source_pages: Json; status: LineStatus; created_at: string;
        };
        Insert: {
          project_id: string; line_number: string; nominal_size?: string | null;
          service_code?: string | null; spec_class?: string | null;
          unit_id?: string | null; source_pages?: Json; status?: LineStatus;
        };
        Update: {
          nominal_size?: string | null; service_code?: string | null;
          spec_class?: string | null; status?: LineStatus;
        };
        Relationships: [];
      };
      equipment: {
        Row: {
          id: string; project_id: string; tag_no: string; equip_type: string | null;
          unit_id: string | null; source_pages: Json; created_at: string;
        };
        Insert: { project_id: string; tag_no: string; equip_type?: string | null; unit_id?: string | null; source_pages?: Json };
        Update: { equip_type?: string | null };
        Relationships: [];
      };
      instruments: {
        Row: {
          id: string; project_id: string; tag_no: string; function_type: string | null;
          unit_id: string | null; source_pages: Json; created_at: string;
        };
        Insert: { project_id: string; tag_no: string; function_type?: string | null; unit_id?: string | null; source_pages?: Json };
        Update: { function_type?: string | null };
        Relationships: [];
      };
      test_packages: {
        Row: {
          id: string; project_id: string; package_no: string; system_code: string | null;
          test_pressure: string | null; test_medium: TestMedium;
          source_page: number | null; status: PackageStatus; created_at: string;
        };
        Insert: {
          project_id: string; package_no: string; system_code?: string | null;
          test_pressure?: string | null; test_medium: TestMedium;
          source_page?: number | null; status?: PackageStatus;
        };
        Update: { status?: PackageStatus };
        Relationships: [];
      };
      golden_joints: {
        Row: {
          id: string; project_id: string; test_package_id: string | null;
          source_page: number | null; related_lines: Json;
          status: GoldenJointStatus; created_at: string;
        };
        Insert: {
          project_id: string; test_package_id?: string | null;
          source_page?: number | null; related_lines?: Json;
          status?: GoldenJointStatus;
        };
        Update: { status?: GoldenJointStatus; test_package_id?: string | null };
        Relationships: [];
      };
      pkg_line_map: {
        Row: { package_id: string; pipeline_id: string };
        Insert: { package_id: string; pipeline_id: string };
        Update: never;
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string; user_id: string | null; project_id: string;
          action: string; entity_type: string; entity_id: string | null;
          old_value: Json; new_value: Json; created_at: string;
        };
        Insert: {
          user_id?: string | null; project_id: string;
          action: string; entity_type: string; entity_id?: string | null;
          old_value?: Json; new_value?: Json;
        };
        Update: never;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: {
      test_medium: TestMedium;
      package_status: PackageStatus;
      golden_joint_status: GoldenJointStatus;
      parse_status: ParseStatus;
      project_role: ProjectRole;
      line_status: LineStatus;
    };
    CompositeTypes: Record<string, never>;
  };
};

export type TestMedium = 'H' | 'V' | 'P' | 'S';
export type PackageStatus = 'draft' | 'ready' | 'in_progress' | 'completed' | 'approved';
export type GoldenJointStatus = 'identified' | 'welding' | 'nde' | 'pwht' | 'approved';
export type ParseStatus = 'pending' | 'processing' | 'completed' | 'failed';
export type ProjectRole = 'admin' | 'editor' | 'viewer';
export type LineStatus = 'extracted' | 'verified' | 'modified';

// 편의 타입
export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Insertable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updatable<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
