// External dependencies
import { Int32, ObjectId } from 'mongodb'

// Class Implementation
export default class Document {
  constructor(
    public creator: ObjectId,
    public upload_date: Date,
    public filename: string,
    public mimetype: string,
    public size: Int32,
    public filepath: string,
    public _id?: ObjectId
  ) {}
}
