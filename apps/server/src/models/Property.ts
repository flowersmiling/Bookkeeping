// External dependencies
import { Int32, ObjectId } from 'mongodb'

// Class Implementation
export default class Property {
  constructor(
    public landlord: string,
    public email: string,
    public account: string,
    public manager: ObjectId,
    public status: Int32,
    public address_line1: string,
    public address_line2: string,
    public city: string,
    public province: string,
    public postcode: string,
    public _id?: ObjectId
  ) {}
}
