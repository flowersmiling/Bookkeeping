/* eslint-disable no-underscore-dangle */

// External Dependencies
import express, { Request, Response, Router } from 'express'
import { Double, ObjectId } from 'mongodb'
import Rent from '../models/Rent'
import { collections } from '../services/database.service'

// Global Config
export const rentRouter: Router = express.Router()
rentRouter.use(express.json())

// GET
rentRouter.get('/', async (req: Request, res: Response) => {
  try {
    const rents = (await collections.rent?.find({}).toArray()) as Rent[]
    res.status(200).send(rents)
  } catch (error) {
    res.status(500).send(error)
  }
})

rentRouter.get('/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    // convert string to ObjectId type matched the type of Mongodb schema validation(same as following)
    const query = { _id: new ObjectId(id) }
    const rent = (await collections.rent?.findOne(query)) as Rent

    if (rent) {
      res.status(200).send(rent)
    }
  } catch (error) {
    res
      .status(404)
      .send(`Unable to find matching document with id: ${req.params.id}`)
  }
})

// specific agent
rentRouter.get('/agent/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const query = { agent: new ObjectId(id) }
    const rents = (await collections.rent?.find(query).toArray()) as Rent[]

    res.status(200).send(rents)
  } catch (error) {
    res.status(500).send(error)
  }
})

// specific agent and date
rentRouter.get('/agent/:year/:month', async (req: any, res: Response) => {
  // the req shares the req value of the global middleware "protect"
  const id: ObjectId = req.user._id
  const now = new Date()
  const year = parseInt(req.params.year)
  const month = parseInt(req.params.month)
  const inDate = new Date(year, month - 1, 1)
  const query = {
    agent: id,
    rent_date: {
      $gte: new Date(Date.UTC(year, month - 1, 1)), // create a Date-object from a specific UTC time that includes the current time zone
      $lte: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)) // Feb has just 28 days
    }
  }
  const queryPreMonth = {
    agent: id,
    rent_date: {
      $gte: new Date(Date.UTC(inDate.getFullYear(), inDate.getMonth() - 1, 1)), // get the first moment (00:00:00:000) of the first day of the month in UTC
      $lte: new Date(
        Date.UTC(inDate.getFullYear(), inDate.getMonth(), 0, 23, 59, 59, 999)
      ) // get the last moment (23:59:59:999) of the last day of the month in UTC
    }
  }

  let rents: any

  try {
    const results = (await collections.rent?.find(query).toArray()) as Rent[]

    // is current month and current month data null?
    if (
      results?.length === 0 &&
      now.getFullYear() === year &&
      now.getMonth() + 1 === month
    ) {
      rents = await collections.rent
        ?.aggregate([
          {
            $match: queryPreMonth // get PREVIOUS month data
          },
          {
            // left join select
            $lookup: {
              from: 'Property',
              localField: 'property',
              foreignField: '_id',
              as: 'property_docs'
            }
          },
          {
            // Deconstructs an array field from the input documents to output a document for each element
            // if you take three documents(A=>B=>C) associated search, you must unwind the B document before associate with C document
            $unwind: {
              path: '$property_docs',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            // associates the third document
            $lookup: {
              from: 'Maintenance',
              localField: 'property_docs._id',
              foreignField: 'property',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        // filtering maintenance amount of CURRENT month
                        {
                          $gte: [
                            '$maintenance_date',
                            new Date(Date.UTC(year, month - 1, 1))
                          ]
                        },
                        {
                          $lte: [
                            '$maintenance_date',
                            new Date(Date.UTC(year, month, 0, 23, 59, 59, 999))
                          ]
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
            $lookup: {
              from: 'User',
              localField: 'agent',
              foreignField: '_id',
              as: 'agent_docs'
            }
          },
          {
            $unwind: { path: '$agent_docs', preserveNullAndEmptyArrays: true }
          },
          {
            // filter the fields that be sent to front-end( _id is default included so must be excluded)
            $project: {
              _id: 0,
              property: 1,
              agent: 1,
              tenant: 1,
              tenant_amount: 1,
              maintenance: { $sum: '$maintenance_docs.amount' }, // summarizing maintenance amount of CURRENT month
              maintenance_pre: '$maintenance', // maintenance amount of PREVIOUS month (original field value: maintenance)
              agent_amount: 1,
              company_amount: 1,
              cra: 1,
              landlord_amount: {
                // calculate landlord amount of CURRENT month according the PREVIOUS month amount
                $subtract: [
                  '$tenant_amount',
                  {
                    $add: [
                      '$agent_amount',
                      '$cra',
                      '$company_amount',
                      { $sum: '$maintenance_docs.amount' }
                    ]
                  }
                ]
              },
              rental_start: new Date(Date.UTC(year, month - 1, 1)),
              rental_end: new Date(Date.UTC(year, month, 0)),
              rent_date: new Date(Date.UTC(year, month - 1, 1)), // CURRENT month
              grant: 1,
              note: 1,
              // maintenance_docs: 1,
              'property_docs.landlord': 1,
              'property_docs.account': 1,
              prop_address: {
                $concat: [
                  '$property_docs.address_line1',
                  ' ',
                  '$property_docs.city',
                  ' ',
                  '$property_docs.province',
                  ' ',
                  '$property_docs.postcode',
                  ' '
                ]
              },
              agent_fullname: {
                $concat: [
                  '$agent_docs.first_name',
                  ' ',
                  '$agent_docs.last_name'
                ]
              } // generate a new field
            }
          },
          {
            $sort: { 'property_docs.landlord': 1 } // ascending order
          }
        ])
        .toArray()
      // console.log(`${rents?.length} --2`)
      if (rents?.length === 0) {
        // the data of PREVIOUS month is null
        // automatically generate NEW document
        await collections.property
          ?.aggregate([
            { $match: { manager: id, status: { $ne: 100 } } }, // all properties of the agent except INACTIVE status
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
                          // filtering maintenance amount of CURRENT month
                          {
                            $gte: [
                              '$maintenance_date',
                              new Date(Date.UTC(year, month - 1, 1))
                            ]
                          },
                          {
                            $lte: [
                              '$maintenance_date',
                              new Date(
                                Date.UTC(year, month, 0, 23, 59, 59, 999)
                              )
                            ]
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
              $lookup: {
                from: 'User',
                localField: 'manager',
                foreignField: '_id',
                as: 'agent_docs'
              }
            },
            {
              $unwind: {
                path: '$agent_docs',
                preserveNullAndEmptyArrays: true
              }
            },
            {
              $project: {
                maintenance_total: { $sum: '$maintenance_docs.amount' }, // summarizing maintenance amount of CURRENT month
                // maintenance_docs: 1,
                landlord: 1,
                account: 1,
                agent_fullname: {
                  $concat: [
                    '$agent_docs.first_name',
                    ' ',
                    '$agent_docs.last_name'
                  ]
                }
              }
            },
            {
              $sort: { landlord: 1 }
            }
          ])
          .forEach((item) => {
            const initRent = {
              property: item._id,
              agent: id.toString(), // ObjectId to string
              tenant: '',
              tenant_amount: new Double(0),
              maintenance: item.maintenance_total,
              landlord_amount: new Double(0),
              agent_amount: new Double(0),
              company_amount: new Double(0),
              cra: new Double(0),
              rental_start: new Date(Date.UTC(year, month - 1, 1)),
              rental_end: new Date(Date.UTC(year, month, 0)),
              rent_date: new Date(Date.UTC(year, month - 1, 1)),
              grant: false,
              note: '',
              agent_fullname: item.agent_fullname,
              property_docs: {
                landlord: item.landlord,
                account: item.account
              }
              // maintenance_docs: item.maintenance_docs
            }
            rents.push(initRent)
          })
      }
    } else {
      // current month data is NOT null
      rents = await collections.rent
        ?.aggregate([
          {
            $match: query
          },
          {
            // left join select
            $lookup: {
              from: 'Property',
              localField: 'property',
              foreignField: '_id',
              as: 'property_docs'
            }
          },
          {
            $lookup: {
              from: 'User',
              localField: 'agent',
              foreignField: '_id',
              as: 'agent_docs'
            }
          },
          {
            // Deconstructs an array field from the input documents to output a document for each element
            $unwind: {
              path: '$property_docs',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $unwind: { path: '$agent_docs', preserveNullAndEmptyArrays: true }
          },
          {
            // filter the fields that be sent to front-end( _id is default included )
            $project: {
              property: 1,
              agent: 1,
              tenant: 1,
              tenant_amount: 1,
              maintenance: 1,
              landlord_amount: 1,
              agent_amount: 1,
              company_amount: 1,
              cra: 1,
              rental_start: 1,
              rental_end: 1,
              rent_date: 1,
              grant: 1,
              note: 1,
              'property_docs.landlord': 1,
              'property_docs.account': 1,
              prop_address: {
                $concat: [
                  '$property_docs.address_line1',
                  ' ',
                  '$property_docs.city',
                  ' ',
                  '$property_docs.province',
                  ' ',
                  '$property_docs.postcode',
                  ' '
                ]
              },
              agent_fullname: {
                $concat: [
                  '$agent_docs.first_name',
                  ' ',
                  '$agent_docs.last_name'
                ]
              } // generate a new field
            }
          },
          {
            $sort: { 'property_docs.landlord': 1 }
          }
        ])
        .toArray()
    }
    // console.log(`${JSON.stringify(rents)} --3`)
    res.status(200).send(rents)
  } catch (error) {
    res.status(500).send(error)
  }
})

// POST
rentRouter.post('/', async (req: any, res: Response) => {
  // the req shares the req value of the global middleware "protect"
  const id: ObjectId = req.user._id

  try {
    const newRent = {
      property: new ObjectId(req.body.property),
      agent: id,
      tenant: req.body.tenant,
      tenant_amount: new Double(req.body.tenant_amount),
      maintenance: new Double(req.body.maintenance),
      landlord_amount: new Double(req.body.landlord_amount),
      agent_amount: new Double(req.body.agent_amount),
      company_amount: new Double(req.body.company_amount),
      cra: new Double(req.body.cra),
      rental_start: new Date(req.body.rental_start),
      rental_end: new Date(req.body.rental_end),
      rent_date: new Date(req.body.rent_date),
      grant: req.body.grant,
      note: req.body.note
    } as Rent
    const result = await collections.rent?.insertOne(newRent)

    result
      ? res.status(201).send(result)
      : res.status(500).send(`Failed to create a new Rent.`)
  } catch (error) {
    console.error(error)
    res.status(400).send(error)
  }
})

// PUT
rentRouter.put('/:id', async (req: Request, res: Response) => {
  const id = req?.params?.id

  try {
    const query = { _id: new ObjectId(id) }

    const result = await collections.rent?.updateOne(query, {
      $set: {
        property: new ObjectId(req.body.property),
        tenant: req.body.tenant,
        tenant_amount: new Double(req.body.tenant_amount),
        maintenance: new Double(req.body.maintenance),
        landlord_amount: new Double(req.body.landlord_amount),
        agent_amount: new Double(req.body.agent_amount),
        company_amount: new Double(req.body.company_amount),
        cra: new Double(req.body.cra),
        rental_start: new Date(req.body.rental_start),
        rental_end: new Date(req.body.rental_end),
        rent_date: new Date(req.body.rent_date),
        grant: req.body.grant,
        note: req.body.note
      }
    })

    result
      ? res.status(200).send(result)
      : res.status(304).send(`Rent with id: ${id} not updated`)
  } catch (error) {
    console.error(error)
    res.status(400).send(error)
  }
})

// DELETE
rentRouter.delete('/:id', async (req: Request, res: Response) => {
  const id = req?.params?.id

  try {
    const query = { _id: new ObjectId(id) }
    const result = await collections.rent?.deleteOne(query)

    if (result && result.deletedCount) {
      res.status(202).send(`Successfully removed Rent with id ${id}`)
    } else if (!result) {
      res.status(400).send(`Failed to remove Rent with id ${id}`)
    } else if (!result.deletedCount) {
      res.status(404).send(`Rent with id ${id} does not exist`)
    }
  } catch (error) {
    console.error(error)
    res.status(400).send(error)
  }
})

// Year to Date report with property id- Property
rentRouter.get(
  '/property/:id/:year/:month',
  async (req: Request, res: Response) => {
    const { id } = req.params
    const year = parseInt(req.params.year)
    const month = parseInt(req.params.month)
    const query = {
      property: new ObjectId(id),
      rent_date: {
        $gte: new Date(Date.UTC(year, 0, 1)), // create a Date-object from a specific UTC time that includes the current time zone
        $lte: new Date(Date.UTC(year, month, 0))
      }
    }

    try {
      const Y2D = await collections.rent
        ?.aggregate([
          {
            $match: query
          },
          {
            $group: {
              _id: '$property',
              tenant_amount: { $sum: '$tenant_amount' },
              maintenance: { $sum: '$maintenance' },
              landlord_amount: { $sum: '$landlord_amount' },
              agent_amount: { $sum: '$agent_amount' },
              company_amount: { $sum: '$company_amount' },
              cra: { $sum: '$cra' }
            }
          }
        ])
        .toArray()

      res.status(200).send(Y2D)
    } catch (error) {
      res.status(500).send(error)
    }
  }
)

// Year to Date report with property id- Property
rentRouter.get(
  '/property/year/report/:id/:year',
  async (req: Request, res: Response) => {
    const { id } = req.params
    const year = parseInt(req.params.year)
    const query = {
      property: new ObjectId(id),
      rent_date: {
        $gte: new Date(Date.UTC(year, 0, 1)), // create a Date-object from a specific UTC time that includes the current time zone
        $lte: new Date(Date.UTC(year, 11, 31))
      }
    }

    try {
      const Y2D = await collections.rent
        ?.aggregate([
          {
            $match: query
          },
          { $sort: { rent_date: 1 } },
          {
            // left join select
            $lookup: {
              from: 'Property',
              localField: 'property',
              foreignField: '_id',
              as: 'property_docs'
            }
          },
          {
            $lookup: {
              from: 'User',
              localField: 'agent',
              foreignField: '_id',
              as: 'agent_docs'
            }
          },
          {
            // Deconstructs an array field from the input documents to output a document for each element
            $unwind: {
              path: '$property_docs',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $unwind: { path: '$agent_docs', preserveNullAndEmptyArrays: true }
          },
          {
            // filter the fields that be sent to front-end( _id is default included )
            $project: {
              property: 1,
              agent: 1,
              tenant: 1,
              tenant_amount: 1,
              maintenance: 1,
              landlord_amount: 1,
              agent_amount: 1,
              company_amount: 1,
              cra: 1,
              rental_start: 1,
              rental_end: 1,
              rent_date: {
                $dateAdd: {
                  startDate: '$rent_date',
                  unit: 'day',
                  amount: 1
                }
              },
              grant: 1,
              note: 1,
              'property_docs.account': 1,
              'property_docs.landlord': 1,
              'property_docs.email': 1,
              'agent_docs.mobile': 1,
              agent_fullname: {
                $concat: [
                  '$agent_docs.first_name',
                  ' ',
                  '$agent_docs.last_name'
                ]
              },
              prop_address: {
                $concat: [
                  '$property_docs.address_line1',
                  ' ',
                  '$property_docs.city',
                  ' ',
                  '$property_docs.province',
                  ' ',
                  '$property_docs.postcode',
                  ' '
                ]
              },
              TotalValueOfBothFields: {
                $add: [
                  '$tenant_amount',
                  '$landlord_amount',
                  '$agent_amount',
                  '$maintenance',
                  '$company_amount'
                ]
              }
            }
          } // generate a new field
        ])
        .toArray()

      res.status(200).send(Y2D)
    } catch (error) {
      res.status(500).send(error)
    }
  }
)
