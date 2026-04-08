// ─── Core Entities ────────────────────────────────────────────────────────────

export interface User {
  id: number
  email: string
  full_name: string
  role: 'admin' | 'analyst' | 'viewer'
  is_active: boolean
  created_at: string
}

export interface University {
  id: number
  name: string
  country: string
  region: string
  type: 'public' | 'private' | 'research'
  student_count: number
  created_at: string
}

export interface Program {
  id: number
  university_id: number
  name: string
  field: string
  degree_level: 'bachelor' | 'master' | 'phd' | 'associate'
  enrolled_students: number
  graduation_rate: number
  status: 'active' | 'inactive' | 'under_review'
  created_at: string
}

export interface JobMarketData {
  id: number
  specialization: string
  region: string
  job_openings: number
  avg_salary: number
  demand_score: number
  growth_rate: number
  top_skills: string[]
  data_date: string
  source: string
}

export interface StudentData {
  id: number
  university_id: number
  program_id: number
  year: number
  applications: number
  enrolled: number
  graduated: number
  employment_rate: number
  avg_starting_salary: number
}

export interface Recommendation {
  id: number
  university_id: number
  program_id: number
  action: 'expand' | 'open' | 'monitor' | 'reduce' | 'close'
  score: number
  confidence: number
  explanation: string
  factors: string[]
  generated_at: string
}

export interface IndustryForecast {
  id: number
  industry: string
  region: string
  forecast_year: number
  growth_prediction: number
  confidence_level: number
  emerging_skills: string[]
  source: string
}

// ─── Analytics / Dashboard Types ──────────────────────────────────────────────

export interface DashboardKPIs {
  total_programs: number
  avg_employment_rate: number
  top_growing_field: string
  programs_needing_attention: number
}

export interface DemandSupplyData {
  specialization: string
  demand_score: number
  supply_score: number
  gap: number
}

export interface SkillGapData {
  skill: string
  demand: number
  supply: number
  gap: number
}

export interface TrendData {
  date: string
  value: number
  specialization: string
}

export interface RegionalData {
  region: string
  programs: number
  employment_rate: number
  demand_score: number
}

// ─── Auth Types ───────────────────────────────────────────────────────────────

export interface AuthToken {
  access_token: string
  token_type: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface ApiError {
  detail: string
}

export interface TokenData {
  sub: string
  exp: number
  role?: string
}

// ─── UI / Filter Types ────────────────────────────────────────────────────────

export interface FilterState {
  region?: string
  timePeriod: string
  industry?: string
  university_id?: number
}

export interface Column<T = Record<string, unknown>> {
  key: keyof T | string
  label: string
  sortable?: boolean
  render?: (value: unknown, row: T) => React.ReactNode
}
