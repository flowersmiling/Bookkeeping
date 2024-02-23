/* eslint-disable no-underscore-dangle */
import bcrypt from 'bcryptjs'
import { ObjectId } from 'mongodb'
import jwt from 'jsonwebtoken'

export default class User {
  constructor(
    public email: string,
    public password: string,
    public first_name: string,
    public last_name: string,
    public role: number,
    public status: number,
    public mobile?: string,
    public telephone?: string,
    public address?: string,
    public _id?: ObjectId
  ) {}

  // Method to compare passwore
  matchPassword(enteredPassword: string) {
    return bcrypt.compare(enteredPassword, this.password)
  }

  // Method to hash password
  async hashPassword() {
    const salt = await bcrypt.genSalt(10)
    this.password = await bcrypt.hash(this.password, salt)
  }

  // Method to generate token
  generateToken() {
    return jwt.sign(
      { id: this._id },
      '36D678C0CC35C6F98A20414A77B3112514567B17F0D3E4B8099B9F01DC876A93' as string,
      {
        expiresIn: '30d'
      }
    )
  }
}
