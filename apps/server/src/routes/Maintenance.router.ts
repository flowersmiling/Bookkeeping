/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
// External Dependencies
import express, { Request, Response, Router } from 'express'
import { Double, ObjectId } from 'mongodb'
import Maintenance from '../models/Maintenance'
import { collections } from '../services/database.service'

// Global Config
export const maintenanceRouter: Router = express.Router()

maintenanceRouter.use(express.json())

// GET
maintenanceRouter.get('/', async (req: Request, res: Response) => {
  try {
    const maintenances = (await collections.maintenance
      ?.find({})
      .toArray()) as Maintenance[]
    res.status(200).send(maintenances)
  } catch (error) {
    res.status(500).send(error)
  }
})

maintenanceRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const query = { _id: new ObjectId(id) }
    const maintenance = (await collections.maintenance?.findOne(
      query
    )) as Maintenance

    if (maintenance) {
      res.status(200).send(maintenance)
    }
  } catch (error) {
    res
      .status(404)
      .send(`Unable to find matching document with id: ${req.params.id}`)
  }
})

// specific property
maintenanceRouter.get('/property/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const query = { property: new ObjectId(id) }
    const maintenances = (await collections.maintenance
      ?.aggregate([
        {
          $match: query
        },
        {
          $project: {
            property: 1,
            item: 1,
            maintenance_date: {
              $dateAdd: {
                startDate: '$maintenance_date',
                unit: 'day',
                amount: 1
              }
            },
            amount: 1
          }
        }
      ])
      .toArray()) as Maintenance[]
    res.status(200).send(maintenances)
  } catch (error) {
    res.status(500).send(error)
  }
})

// specific property and maintenance date(year or month)
maintenanceRouter.get(
  '/property/:id/:year/:month?',
  async (req: Request, res: Response) => {
    const { id } = req.params
    const year = parseInt(req.params.year)
    const strMonth = req.params.month
    let query

    try {
      if (strMonth) {
        query = {
          property: new ObjectId(id),
          maintenance_date: {
            $gte: new Date(Date.UTC(year, parseInt(strMonth) - 1, 1)), // create a Date-object from a specific UTC time that includes the current time zone
            $lte: new Date(
              Date.UTC(year, parseInt(strMonth), 0, 23, 59, 59, 999)
            ) // Feb has just 28 days
          }
        }
      } else {
        query = {
          property: new ObjectId(id),
          maintenance_date: {
            $gte: new Date(Date.UTC(year, 0, 1)),
            $lte: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)) // get the last moment (23:59:59:999) of the last day of the month in UTC
          }
        }
      }
      const maintenances = (await collections.maintenance
        ?.aggregate([
          {
            $match: query
          },
          {
            $project: {
              property: 1,
              item: 1,
              maintenance_date: {
                $dateAdd: {
                  startDate: '$maintenance_date',
                  unit: 'day',
                  amount: 1
                }
              },
              amount: 1
            }
          }
        ])
        .toArray()) as Maintenance[]

      res.status(200).send(maintenances)
    } catch (error) {
      res.status(500).send(error)
    }
  }
)

// specific agent and maintenance date(year or month)
maintenanceRouter.get(
  '/agent/:year/:month?',
  async (req: any, res: Response) => {
    // the req shares the req value of the global middleware "protect"
    const id: ObjectId = req.user._id
    const year = parseInt(req.params.year)
    const strMonth = req.params.month
    let query

    try {
      if (strMonth) {
        query = {
          'maintenance_docs.maintenance_date': {
            $gte: new Date(Date.UTC(year, parseInt(strMonth) - 1, 1)), // create a Date-object from a specific UTC time that includes the current time zone
            $lte: new Date(
              Date.UTC(year, parseInt(strMonth), 0, 23, 59, 59, 999)
            ) // Feb has just 28 days
          }
        }
      } else {
        query = {
          'maintenance_docs.maintenance_date': {
            $gte: new Date(Date.UTC(year, 0, 1)),
            $lte: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))
          }
        }
      }

      // use Property document
      const maintenances = await collections.property
        ?.aggregate([
          {
            $match: { manager: id }
          },
          {
            // left join select
            $lookup: {
              from: 'Maintenance',
              localField: '_id',
              foreignField: 'property',
              as: 'maintenance_docs'
            }
          },
          {
            // Deconstructs an array field from the input documents to output a document for each element
            $unwind: {
              path: '$maintenance_docs',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $match: query
          },
          {
            $project: {
              _id: '$maintenance_docs._id', // this _id is not the _id of Property document
              property: '$maintenance_docs.property',
              item: '$maintenance_docs.item',
              maintenance_date: '$maintenance_docs.maintenance_date',
              amount: '$maintenance_docs.amount'
            }
          }
        ])
        .toArray()

      res.status(200).send(maintenances)
    } catch (error) {
      res.status(500).send(error)
    }
  }
)

// specific property maintenance aggregation
maintenanceRouter.get(
  '/propertyAggregation/:id/:year/:month?',
  async (req: Request, res: Response) => {
    const { id } = req.params
    const year = parseInt(req.params.year)
    const strMonth = req.params.month
    let query

    try {
      if (strMonth) {
        query = {
          property: new ObjectId(id),
          maintenance_date: {
            $gte: new Date(Date.UTC(year, parseInt(strMonth) - 1, 1)),
            $lte: new Date(
              Date.UTC(year, parseInt(strMonth), 0, 23, 59, 59, 999)
            )
          }
        }
      } else {
        query = {
          property: new ObjectId(id),
          maintenance_date: {
            $gte: new Date(Date.UTC(year, 0, 1)),
            $lte: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999))
          }
        }
      }

      const maintenances = await collections.maintenance
        ?.aggregate([
          {
            $match: query
          },
          {
            $group: {
              _id: null,
              total: { $sum: '$amount' },
              count: { $sum: 1 }
            }
          },
          {
            $project: { _id: 0 }
          }
        ])
        .toArray()

      res.status(200).send(maintenances)
    } catch (error) {
      res.status(500).send(error)
    }
  }
)

// POST

maintenanceRouter.post('/', async (req: Request, res: Response) => {
  try {
    const property = new ObjectId(req.body.property)
    const maintenance_date = new Date(req.body.maintenance_date)
    const amount = new Double(req.body.amount)
    const newMaintenance = {
      property,
      maintenance_date,
      amount,
      item: req.body.item
    } as Maintenance
    const queryRent = {
      property,
      rent_date: {
        $gte: new Date(
          Date.UTC(
            maintenance_date.getFullYear(),
            maintenance_date.getMonth(),
            1
          )
        ),
        $lte: new Date(
          Date.UTC(
            maintenance_date.getFullYear(),
            maintenance_date.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          )
        ) // get the last moment (23:59:59:999) of the last day of the month in UTC
      }
    }

    const resultRent = await collections.rent?.findOne(queryRent)

    if (resultRent) {
      const queryRentUpdate = { _id: resultRent._id }
      const updateRent = {
        $set: {
          // convert to new Double() type to satisfy the type of the field
          maintenance: new Double(
            Number((resultRent.maintenance + amount.valueOf()).toFixed(2))
          ),
          landlord_amount: new Double(
            Number((resultRent.landlord_amount - amount.valueOf()).toFixed(2))
          )
        }
      }

      await collections.rent?.updateOne(queryRentUpdate, updateRent)
    }

    const result = await collections.maintenance?.insertOne(newMaintenance)

    result
      ? res.status(201).send(result)
      : res.status(500).send(`Failed to create a new Maintenance.`)
  } catch (error) {
    console.error(error)
    res.status(400).send(error)
  }
})

// PUT
maintenanceRouter.put('/:id', async (req: Request, res: Response) => {
  const id = req?.params?.id
  const property = new ObjectId(req.body.property)
  const maintenance_date = new Date(req.body.maintenance_date)
  const amount = new Double(req.body.amount)

  try {
    const query = { _id: new ObjectId(id) }
    const queryRent = {
      property,
      rent_date: {
        $gte: new Date(
          Date.UTC(
            maintenance_date.getFullYear(),
            maintenance_date.getMonth(),
            1
          )
        ),
        $lte: new Date(
          Date.UTC(
            maintenance_date.getFullYear(),
            maintenance_date.getMonth() + 1,
            0,
            23,
            59,
            59,
            999
          )
        ) // get the last moment (23:59:59:999) of the last day of the month in UTC
      }
    }

    const resultMaintenance = await collections.maintenance?.findOne(query)
    const resultRent = await collections.rent?.findOne(queryRent)

    if (resultRent && resultMaintenance) {
      const queryRentUpdate = { _id: resultRent._id }
      // the differece between the new amount and the old amount
      const diffAmount = amount.valueOf() - resultMaintenance.amount.valueOf()
      const updateRent = {
        $set: {
          maintenance: new Double(
            Number((resultRent.maintenance + diffAmount).toFixed(2))
          ),
          landlord_amount: new Double(
            Number((resultRent.landlord_amount - diffAmount).toFixed(2))
          )
        }
      }

      await collections.rent?.updateOne(queryRentUpdate, updateRent)
    }

    const result = await collections.maintenance?.updateOne(query, {
      $set: {
        property,
        maintenance_date,
        amount,
        item: req.body.item
      }
    })

    result
      ? res.status(201).send(result)
      : res.status(304).send(`Maintenance with id: ${id} not updated`)
  } catch (error) {
    console.error(error)
    res.status(400).send(error)
  }
})

// DELETE
maintenanceRouter.delete('/:id', async (req: Request, res: Response) => {
  const id = req?.params?.id

  try {
    const query = { _id: new ObjectId(id) }
    const resultMaintenance = await collections.maintenance?.findOne(query)

    if (resultMaintenance) {
      const { property, maintenance_date, amount } = resultMaintenance
      const queryRent = {
        property,
        rent_date: {
          $gte: new Date(
            Date.UTC(
              maintenance_date.getFullYear(),
              maintenance_date.getMonth(),
              1
            )
          ),
          $lte: new Date(
            Date.UTC(
              maintenance_date.getFullYear(),
              maintenance_date.getMonth() + 1,
              0,
              23,
              59,
              59,
              999
            )
          ) // get the last moment (23:59:59:999) of the last day of the month in UTC
        }
      }

      const resultRent = await collections.rent?.findOne(queryRent)

      if (resultRent) {
        const { _id, maintenance, landlord_amount } = resultRent
        const queryRentUpdate = { _id }
        const updateRent = {
          $set: {
            maintenance: new Double(
              Number((maintenance - amount.valueOf()).toFixed(2))
            ),
            landlord_amount: new Double(
              Number((landlord_amount + amount.valueOf()).toFixed(2))
            )
          }
        }

        await collections.rent?.updateOne(queryRentUpdate, updateRent)
      }
    }

    const result = await collections.maintenance?.deleteOne(query)

    if (result && result.deletedCount) {
      res.status(202).send(`Successfully removed Maintenance with id ${id}`)
    } else if (!result) {
      res.status(400).send(`Failed to remove Maintenance with id ${id}`)
    } else if (!result.deletedCount) {
      res.status(404).send(`Maintenance with id ${id} does not exist`)
    }
  } catch (error) {
    console.error(error)
    res.status(400).send(error)
  }
})
