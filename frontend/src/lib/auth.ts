import type { TokenData } from '@/types'

const TOKEN_KEY = 'udl_token'

export function saveToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token)
  }
}

export function getToken(): string | null {
  if (typeof window === 'undefined') return null
  return localStorage.getItem(TOKEN_KEY)
}

export function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY)
  }
}

export function isAuthenticated(): boolean {
  const token = getToken()
  if (!token) return false
  const payload = getTokenPayload()
  if (!payload) return false
  // Check expiry
  return payload.exp * 1000 > Date.now()
}

export function getTokenPayload(): TokenData | null {
  const token = getToken()
  if (!token) return null
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    const payload = JSON.parse(atob(parts[1])) as TokenData
    return payload
  } catch {
    return null
  }
}

export function isAdmin(): boolean {
  const payload = getTokenPayload()
  return payload?.role === 'admin'
}
