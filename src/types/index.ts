import type { Tables } from './database';

// 프로젝트 (통계 포함)
export interface ProjectWithStats extends Tables<'projects'> {
  line_count: number;
  equipment_count: number;
  package_count: number;
}

// 대시보드 통계
export interface DashboardStats {
  total_lines: number;
  total_equipment: number;
  total_packages: number;
  total_instruments: number;
  total_drawings: number;
  total_units: number;
  size_distribution: { name: string; count: number }[];
  service_distribution: { name: string; count: number }[];
  unit_distribution: { unit: string; name: string | null; lines: number; equipment: number }[];
  medium_distribution: { name: string; count: number }[];
  package_status_distribution: { name: string; count: number }[];
}

// 페이지네이션
export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

// Line List 필터
export interface LineListFilter {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
  size?: string[];
  service?: string[];
  unit?: string[];
  spec?: string;
  search?: string;
}
