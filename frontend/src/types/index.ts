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

export const MEDICATION_UNITS = ['mg', 'ml', 'pill', 'drop', 'sachet', 'puff'] as const
export type MedicationUnit = (typeof MEDICATION_UNITS)[number]

export const MEDICATION_FORMS = ['syrup', 'tablet', 'drops', 'inhaler', 'capsule'] as const
export type MedicationForm = (typeof MEDICATION_FORMS)[number]

export interface Medication {
  id: string
  patientId: string
  name: string
  amount: string
  unit: MedicationUnit
  form: MedicationForm | null
  instructions: string | null
  active: boolean
  createdAt: string
}