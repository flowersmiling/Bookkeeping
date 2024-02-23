import { Double, ObjectId } from 'mongodb'

// Class Implementation
export default class Adminreport {
  constructor(
    public address: string,
    public landlord: string,
    public account: number,
    public tenant: string,
    public tenant_amount: Double,
    public landlord_amount: Double,
    public agent_amount: Double,
    public cra: Double,
    public company_amount: Double,
    public maintenance: Double,
    public total: Double,
    public _id?: ObjectId
  ) {}
}
