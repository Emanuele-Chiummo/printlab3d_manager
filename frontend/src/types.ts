export type Role = 'ADMIN' | 'OPERATORE' | 'COMMERCIALE' | 'VIEWER'

export interface User {
  id: number
  email: string
  full_name: string
  role: Role
  is_active: boolean
  must_reset_password?: boolean
}
