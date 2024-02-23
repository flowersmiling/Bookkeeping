// External dependencies
import { Double, ObjectId } from 'mongodb'

// Class Implementation
export default class Rent {
  constructor(
    public property: ObjectId,
    public agent: ObjectId,
    public tenant: string,
    public tenant_amount: Double,
    public maintenance: Double,
    public landlord_amount: Double,
    public agent_amount: Double,
    public company_amount: Double,
    public cra: Double,
    public rental_start: Date,
    public rental_end: Date,
    public rent_date: Date,
    public grant: boolean,
    public note: string,
    public _id?: ObjectId
  ) {}
}
