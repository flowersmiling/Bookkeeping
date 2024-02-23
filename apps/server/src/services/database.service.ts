// External Dependencies
import * as mongoDB from 'mongodb'
import * as dotenv from 'dotenv'

// Global Variables
export const collections: {
  property?: mongoDB.Collection
  rent?: mongoDB.Collection
  maintenance?: mongoDB.Collection
  user?: mongoDB.Collection
  document?: mongoDB.Collection
} = {}

// Initialize Connection
export async function connectToDatabase() {
  dotenv.config()
  const client: mongoDB.MongoClient = new mongoDB.MongoClient(
    "mongodb://XXXXXXXXXX" as string
  )
  await client.connect()
  const db: mongoDB.Db = client.db('homecare')

  const propertyCollection: mongoDB.Collection = db.collection('Property')
  const maintenanceCollection: mongoDB.Collection = db.collection('Maintenance')
  const rentCollection: mongoDB.Collection = db.collection('Rent')
  const userCollection: mongoDB.Collection = db.collection('User')
  const documentCollection: mongoDB.Collection = db.collection('Document')
  collections.property = propertyCollection
  collections.maintenance = maintenanceCollection
  collections.rent = rentCollection
  collections.user = userCollection
  collections.document = documentCollection
}
