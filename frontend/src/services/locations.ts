import api from '../api/client'
import { Location } from '../api/types'

export const loadLocations = async (): Promise<Location[]> => {
  const res = await api.get('/api/v1/locations/')
  return res.data
}

export const createLocation = async (data: Partial<Location>): Promise<Location> => {
  const res = await api.post('/api/v1/locations/', data)
  return res.data
}


export const updateLocation = async (id: number, data: Partial<Location>): Promise<Location> => {
  const res = await api.put(`/api/v1/locations/${id}/`, data)
  return res.data
}

export const deleteLocation = async (id: number): Promise<any> => {
  const res = await api.delete(`/api/v1/locations/${id}/`)
  return res.data
}
