/* eslint-disable @typescript-eslint/no-unused-vars */
import axios from 'axios'
import User from '../types/User'
import { storage } from '../lib/utils'

const apiClient = axios.create({
  baseURL: `${process.env.NEXT_PUBLIC_API_URL}/api/users`,
  headers: {
    Content_type: 'application/json',
    Authorization: `Bearer ${storage.getToken()}`
  }
})

export const findAllUser = async () => {
  const response = await apiClient.get<User[]>('/users')
  return response.data
}

export const findById = async (id: any) => {
  const response = await apiClient.get<User>(`/${id}`)
  return response.data
}

export const registerUser = async ({
  first_name,
  last_name,
  email,
  password,
  mobile,
  address
}: any) => {
  const response = await apiClient.post<any>('/', {
    first_name,
    last_name,
    email,
    password,
    mobile,
    address
  })
  return response.data
}

export const login = async ({ email, password }: any) => {
  const response = await apiClient.post<any>('/login', {
    email,
    password
  })

  localStorage.setItem('userInfo', JSON.stringify(response.data))
  return response.data
}

export const updateUser = async ({
  _id,
  first_name,
  last_name,
  email,
  new_password,
  old_password,
  mobile,
  address
}: any) => {
  const response = await apiClient.put<any>('/update', {
    _id,
    first_name,
    last_name,
    email,
    new_password,
    old_password,
    mobile,
    address
  })
  return response.data
}

export const updateUserRole = async ({ _id, role, status }: any) => {
  const response = await apiClient.post<any>('/users', {
    _id,
    role,
    status
  })
  return response.data
}

export const resetPassword = async (id: any) => {
  const response = await apiClient.post<any>('/reset', {
    _id: id
  })
  return response.data
}

export const deleteUser = async (_id: string) => {
  const response = await apiClient.delete<any>('/delete', { data: { _id } })
}
