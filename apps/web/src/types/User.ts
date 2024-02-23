export default interface User {
  _id: string
  email: string
  password: string
  first_name: string
  last_name: string
  role: number
  status: string
  mobile?: string
  telephone?: string
  address?: string
}
