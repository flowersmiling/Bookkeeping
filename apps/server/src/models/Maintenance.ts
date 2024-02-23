// External dependencies
import { Double, ObjectId } from 'mongodb'

// Class Implementation
export default class Maintenance {
  constructor(
    public property: ObjectId,
    public item: string,
    public maintenance_date: Date,
    public amount: Double,
    public _id?: ObjectId
  ) {}
}
