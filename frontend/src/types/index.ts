export interface User {
  id: string
  email: string
  fullName: string
  phoneNumber?: string | null
  createdAt?: string
}

export interface Patient {
  id: string
  fullName: string
  phoneNumber: string
  timezone: string
  language: string
  createdAt: string
}