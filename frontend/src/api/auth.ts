import api from './client'

export async function login(email: string, password: string) {
  const form = new URLSearchParams()
  form.append('username', email)
  form.append('password', password)
  const res = await api.post('/api/v1/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  })
  return res.data as { access_token: string; token_type: string }
}

export async function me() {
  const res = await api.get('/api/v1/auth/me')
  return res.data as { id: number; email: string; full_name: string; role: string }
}
