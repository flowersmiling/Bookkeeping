/* eslint-disable no-underscore-dangle */
// External Dependencies
import express, { Request, Response, Router } from 'express'
import { Int32, ObjectId } from 'mongodb'
import Property from '../models/Property'
import { collections } from '../services/database.service'

// Global Config
export const propertyRouter: Router = express.Router()
propertyRouter.use(express.json())

// GET
propertyRouter.get('/', async (req: Request, res: Response) => {
  try {
    const properties = (await collections.property
      ?.find({})
      .toArray()) as Property[]
    res.status(200).send(properties)
  } catch (error) {
    res.status(500).send(error)
  }
})

// Note: the router will be conflict with '/manager'
// propertyRouter.get('/:id', async (req: Request, res: Response) => {
//   const { id } = req.params
//   try {
//     const query = { _id: new ObjectId(id) }
//     const property = (await collections.property?.findOne(query)) as Property

//     if (property) {
//       res.status(200).send(property)
//     }
//   } catch (error) {
//     res
//       .status(404)
//       .send(`Unable to find matching document with id: ${req.params.id}`)
//   }
// })

// specific manager and all status
propertyRouter.get('/manager/', async (req: any, res: Response) => {
  // the req shares the req value of the global middleware "protect"
  const id: ObjectId = req.user._id

  try {
    const query = { manager: id }
    const properties = await collections.property
      ?.aggregate([
        { $match: query },
        {
          $project: {
            landlord: 1,
            email: 1,
            account: 1,
            manager: 1,
            status: 1,
            address_line1: 1,
            address_line2: 1,
            city: 1,
            province: 1,
            postcode: 1,
            fulladdress: {
              $concat: [
                '$address_line1',
                ',',
                '$city',
                ',',
                '$province',
                ',',
                '$postcode'
              ]
            }
          }
        },
        {
          $sort: { landlord: 1 }
        }
      ])
      .toArray()

    res.status(200).send(properties)
  } catch (error) {
    res.status(500).send(error)
  }
})

// specific manager and specific status
propertyRouter.get(
  '/manager/:status/:year?/:month?',
  async (req: any, res: Response) => {
    // the req shares the req value of the global middleware "protect"
    const id: ObjectId = req.user._id
    const { status } = req.params
    let propertyStatus
    let firstOfMonth
    let lastOfMonth

    if (parseInt(status) === 200) {
      propertyStatus = { $ne: 100 }
    }

    if (req.params.year && req.params.month) {
      const year = parseInt(req.params.year)
      const month = parseInt(req.params.month)
      firstOfMonth = new Date(Date.UTC(year, month - 1, 1)) // create a Date-object from a specific UTC time that includes the current time zone
      lastOfMonth = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)) // get the last moment (23:59:59:999) of the last day of the month in UTC
    } else {
      const now = new Date()
      firstOfMonth = new Date(Date.UTC(now.getFullYear(), now.getMonth(), 1))
      lastOfMonth = new Date(
        Date.UTC(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      )
    }

    // console.log(firstOfMonth)
    // console.log(firstOfMonth.toLocaleDateString())

    try {
      const query = { manager: id, status: propertyStatus }
      const properties = await collections.property
        ?.aggregate([
          { $match: query },
          {
            $lookup: {
              // left join Maintenance to calculate the maintenance total
              from: 'Maintenance',
              localField: '_id',
              foreignField: 'property',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $gte: ['$maintenance_date', firstOfMonth]
                        },
                        {
                          $lte: ['$maintenance_date', lastOfMonth]
                        }
                      ]
                    }
                  }
                },
                {
                  $project: { _id: 1, amount: 1 }
                }
              ],
              as: 'maintenance_docs'
            }
          },
          {
            $project: {
              maintenance_total: { $sum: '$maintenance_docs.amount' },
              landlord: 1,
              // maintenance_docs: 1,
              fulladdress: {
                $concat: [
                  '$address_line1',
                  ',',
                  '$city',
                  ',',
                  '$province',
                  ',',
                  '$postcode'
                ]
              }
            }
          },
          {
            $sort: { landlord: 1 }
          }
        ])
        .toArray()

      res.status(200).send(properties)
    } catch (error) {
      res.status(500).send(error)
    }
  }
)

// POST
propertyRouter.post('/', async (req: any, res: Response) => {
  // the req shares the req value of the global middleware "protect"
  const id: ObjectId = req.user._id
  try {
    const newProperty = {
      landlord: req.body.landlord,
      email: req.body.email,
      account: req.body.account,
      manager: id,
      status: new Int32(req.body.status),
      address_line1: req.body.address_line1,
      address_line2: req.body.address_line2,
      city: req.body.city,
      province: req.body.province,
      postcode: req.body.postcode
    } as Property
    const result = await collections.property?.insertOne(newProperty)

    result
      ? res.status(201).send(result)
      : res.status(500).send(`Failed to create a new Property.`)
  } catch (error) {
    console.error(error)
    res.status(400).send(error)
  }
})

// PUT
propertyRouter.put('/:id', async (req: Request, res: Response) => {
  const id = req?.params?.id

  try {
    // const updatedProperty: Property = req.body as Property
    const query = { _id: new ObjectId(id) }

    const result = await collections.property?.updateOne(query, {
      // $set: updatedProperty
      $set: {
        landlord: req.body.landlord,
        email: req.body.email,
        account: req.body.account,
        status: new Int32(req.body.status),
        address_line1: req.body.address_line1,
        address_line2: req.body.address_line2,
        city: req.body.city,
        province: req.body.province,
        postcode: req.body.postcode
      }
    })

    result
      ? res.status(200).send(result)
      : res.status(304).send(`Property with id: ${id} not updated`)
  } catch (error) {
    console.error(error)
    res.status(400).send(error)
  }
})

// DELETE
propertyRouter.delete('/:id', async (req: Request, res: Response) => {
  const id = req?.params?.id

  try {
    const query = { _id: new ObjectId(id) }
    const result = await collections.property?.deleteOne(query)

    if (result && result.deletedCount) {
      res.status(202).send(`Successfully removed Property with id ${id}`)
    } else if (!result) {
      res.status(400).send(`Failed to remove Property with id ${id}`)
    } else if (!result.deletedCount) {
      res.status(404).send(`Property with id ${id} does not exist`)
    }
  } catch (error) {
    console.error(error)
    res.status(400).send(error)
  }
})
