export interface User {
  id: string
  name: string
  email: string
  role: string
  gender?: string
  age?: number
  weight?: number
  height?: number
  bodyMeasurements?: {
    chest?: number
    waist?: number
    hips?: number
    arms?: number
    legs?: number
  }
  createdAt?: Date
  updatedAt?: Date
}
