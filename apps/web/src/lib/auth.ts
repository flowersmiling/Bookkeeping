import { configureAuth } from './configureAuth'
import {
  getUserProfile,
  loginWithEmailAndPassword,
  logout,
  registerUser
} from './api'
import { storage } from './utils'

export type LoginCredentials = {
  email: string
  password: string
}

export type RegisterCredentials = {
  email: string
  name: string
  password: string
}

async function handleUserResponse(data: any) {
  storage.setToken(data.data.token)
  return data.data
}

async function userFn() {
  const { data } = await getUserProfile()
  return data ?? null
}

async function loginFn(data: LoginCredentials) {
  const response = await loginWithEmailAndPassword(data)
  const user = await handleUserResponse(response)
  // window.location.reload()
  return user
}

async function registerFn(data: RegisterCredentials) {
  const response = await registerUser(data)
  const user = await handleUserResponse(response)
  return user
}

async function logoutFn() {
  logout()
  // window.location.reload()
}

export const { useUser, useLogin, useRegister, useLogout, AuthLoader } =
  configureAuth({
    userFn,
    loginFn,
    registerFn,
    logoutFn
  })
