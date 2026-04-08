import axios from 'axios'
import { getToken } from './auth'
import type {
  AuthToken,
  University,
  Program,
  JobMarketData,
  DashboardKPIs,
  DemandSupplyData,
  SkillGapData,
  TrendData,
  RegionalData,
  Recommendation,
  User,
} from '@/types'

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const authApi = {
  login: async (email: string, password: string): Promise<AuthToken> => {
    const params = new URLSearchParams({ username: email, password })
    const { data } = await api.post<AuthToken>('/auth/login', params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    })
    return data
  },

  register: async (payload: {
    email: string
    password: string
    full_name: string
    role?: string
  }): Promise<User> => {
    const { data } = await api.post<User>('/auth/register', payload)
    return data
  },

  getMe: async (): Promise<User> => {
    const { data } = await api.get<User>('/auth/me')
    return data
  },
}

// ─── Universities ─────────────────────────────────────────────────────────────

export const universitiesApi = {
  getUniversities: async (params?: Record<string, unknown>): Promise<University[]> => {
    const { data } = await api.get<University[]>('/universities', { params })
    return data
  },

  getUniversity: async (id: number): Promise<University> => {
    const { data } = await api.get<University>(`/universities/${id}`)
    return data
  },

  createUniversity: async (payload: Omit<University, 'id' | 'created_at'>): Promise<University> => {
    const { data } = await api.post<University>('/universities', payload)
    return data
  },

  updateUniversity: async (
    id: number,
    payload: Partial<Omit<University, 'id' | 'created_at'>>
  ): Promise<University> => {
    const { data } = await api.put<University>(`/universities/${id}`, payload)
    return data
  },
}

// ─── Programs ─────────────────────────────────────────────────────────────────

export const programsApi = {
  getPrograms: async (params?: Record<string, unknown>): Promise<Program[]> => {
    const { data } = await api.get<Program[]>('/programs', { params })
    return data
  },

  getProgram: async (id: number): Promise<Program> => {
    const { data } = await api.get<Program>(`/programs/${id}`)
    return data
  },

  createProgram: async (payload: Omit<Program, 'id' | 'created_at'>): Promise<Program> => {
    const { data } = await api.post<Program>('/programs', payload)
    return data
  },

  updateProgram: async (
    id: number,
    payload: Partial<Omit<Program, 'id' | 'created_at'>>
  ): Promise<Program> => {
    const { data } = await api.put<Program>(`/programs/${id}`, payload)
    return data
  },
}

// ─── Job Market ───────────────────────────────────────────────────────────────

export const jobMarketApi = {
  getJobMarket: async (params?: Record<string, unknown>): Promise<JobMarketData[]> => {
    const { data } = await api.get<JobMarketData[]>('/job-market', { params })
    return data
  },

  getJobMarketTrends: async (): Promise<TrendData[]> => {
    const { data } = await api.get<TrendData[]>('/job-market/trends')
    return data
  },

  ingestJobMarket: async (payload: Omit<JobMarketData, 'id'>): Promise<JobMarketData> => {
    const { data } = await api.post<JobMarketData>('/job-market/ingest', payload)
    return data
  },
}

// ─── Analytics ────────────────────────────────────────────────────────────────

export const analyticsApi = {
  getDashboard: async (): Promise<DashboardKPIs> => {
    const { data } = await api.get<DashboardKPIs>('/analytics/dashboard')
    return data
  },

  getDemandSupply: async (): Promise<DemandSupplyData[]> => {
    const { data } = await api.get<DemandSupplyData[]>('/analytics/demand-supply')
    return data
  },

  getSkillGaps: async (): Promise<SkillGapData[]> => {
    const { data } = await api.get<SkillGapData[]>('/analytics/skill-gaps')
    return data
  },

  getTrends: async (specialization?: string): Promise<TrendData[]> => {
    const { data } = await api.get<TrendData[]>('/analytics/trends', {
      params: specialization ? { specialization } : undefined,
    })
    return data
  },

  getRegional: async (): Promise<RegionalData[]> => {
    const { data } = await api.get<RegionalData[]>('/analytics/regional')
    return data
  },
}

// ─── Recommendations ──────────────────────────────────────────────────────────

export const recommendationsApi = {
  getRecommendations: async (params?: Record<string, unknown>): Promise<Recommendation[]> => {
    const { data } = await api.get<Recommendation[]>('/recommendations', { params })
    return data
  },

  getRecommendationsForUniversity: async (id: number): Promise<Recommendation[]> => {
    const { data } = await api.get<Recommendation[]>(`/recommendations/university/${id}`)
    return data
  },

  generateRecommendations: async (university_id?: number): Promise<{ message: string }> => {
    const { data } = await api.post<{ message: string }>('/recommendations/generate', {
      university_id,
    })
    return data
  },
}

// ─── Reports ──────────────────────────────────────────────────────────────────

export const reportsApi = {
  exportCSV: async (): Promise<Blob> => {
    const { data } = await api.get('/reports/export/csv', { responseType: 'blob' })
    return data
  },

  exportPDF: async (): Promise<Blob> => {
    const { data } = await api.get('/reports/export/pdf', { responseType: 'blob' })
    return data
  },
}

// ─── Users ────────────────────────────────────────────────────────────────────

export const usersApi = {
  getUsers: async (): Promise<User[]> => {
    const { data } = await api.get<User[]>('/users')
    return data
  },
}

export default api
