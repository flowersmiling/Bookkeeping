/* eslint-disable no-else-return */
import axios from 'axios'
import User from '../types/User'
import { storage } from './utils'

export interface AuthResponse {
  user: User
  jwt: string
}

export async function handleApiResponse(response: Response) {
  const data = await response.json()

  if (response.ok) {
    return data
  } else {
    console.error(JSON.stringify(data, null, 2))
    return Promise.reject(data)
  }
}

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
  headers: {
    'Content-type': 'application/json'
  }
})

export const getUserProfile = async () => {
  const response = await apiClient.get<User>('/me', {
    headers: {
      Content_type: 'application/json',
      Authorization: `Bearer ${storage.getToken()}`
    }
  })
  return response
}

export const getUsers = async () => {
  const response = await apiClient.get<User[]>('/users', {
    headers: {
      Content_type: 'application/json',
      Authorization: `Bearer ${storage.getToken()}`
    }
  })
  return response
}

export const loginWithEmailAndPassword = async (data: any) => {
  const response = await apiClient.post('/login', data)
  return response
}

export const registerUser = async (data: any) => {
  const response = await apiClient.post('/register', data)
  return response
}

export const logout = () => {
  localStorage.removeItem('token')

  window.location.reload()
  alert('you were logout!')
}
