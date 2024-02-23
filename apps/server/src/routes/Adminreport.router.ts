/* eslint-disable no-console */
// External Dependencies
import express, { Request, Response, Router } from 'express'
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Double, ObjectId } from 'mongodb'
import { collections } from '../services/database.service'
import Reports from '../models/Adminreport'

// Global Config

// eslint-disable-next-line import/prefer-default-export
export const adminreportsRouter: Router = express.Router()

adminreportsRouter.use(express.json())
// GET
adminreportsRouter.get('/', async (_req: Request, res: Response) => {
  try {
    const reports = (await collections.rent
      ?.aggregate([
        {
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
          $unwind: {
            path: '$property_docs',
            preserveNullAndEmptyArrays: true
          }
        },
        {
          $unwind: { path: '$agent_docs', preserveNullAndEmptyArrays: true }
        },

        {
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
              $concat: ['$agent_docs.first_name', ' ', '$agent_docs.last_name']
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
        }
      ])
      .toArray()) as Reports[]
    // }

    res.status(200).send(reports)
  } catch (error) {
    res.status(500).send(error)
  }
})
// get with property id
adminreportsRouter.get('/:id', async (req: Request, res: Response) => {
  const id = req?.params?.id
  let rents: any

  try {
    const query = { property: new ObjectId(id) }
    const results = (await collections.rent?.findOne(query)) as Reports

    if (results) {
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
            $lookup: {
              from: 'Maintenance',
              localField: 'property_docs._id',
              foreignField: 'property',
              as: 'maintenance_docs'
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
            $unwind: {
              path: '$agent_docs',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            $unwind: {
              path: '$maintenance_docs',
              preserveNullAndEmptyArrays: true
            }
          },
          {
            // filter the fields that be showed in front-end
            $project: {
              'property.address_line1': 1,
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
              'property_docs.email': 1,
              'agent_docs.mobile': 1,
              'maintenance_docs.item': 1,
              'maintenance_docs.maintenance_date': 1,
              'maintenance_docs.amount': 1,

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
              }
            }
          }
        ])
        .toArray()
    }
    res.status(200).send(rents)
  } catch (error) {
    res
      .status(404)
      .send(`Unable to find matching document with id: ${req.params.id}`)
  }
})

// specific  month
adminreportsRouter.get('/:year/:month', async (req: Request, res: Response) => {
  const { id } = req.params
  const now = new Date()
  const year = parseInt(req.params.year)
  const month = parseInt(req.params.month) + 1
  const inDate = new Date(year, month - 1, 1)
  const query = {
    rent_date: {
      $gte: new Date(Date.UTC(year, month - 1, 1)), // create a Date-object from a specific UTC time that includes the current time zone
      $lte: new Date(Date.UTC(year, month, 0)) // Feb has just 28 days
    }
  }
  const queryPreMonth = {
    rent_date: {
      $gte: new Date(Date.UTC(inDate.getFullYear(), inDate.getMonth() - 1, 1)),
      $lte: new Date(Date.UTC(inDate.getFullYear(), inDate.getMonth(), 0))
    }
  }

  let rents: any

  try {
    const results = (await collections.rent?.find(query).toArray()) as Reports[]

    // is current month and current month data null?
    if (
      results?.length === 0 &&
      now.getFullYear() === year &&
      now.getMonth() + 1 === month
    ) {
      rents = await collections.rent
        ?.aggregate([
          {
            $match: queryPreMonth // get previous month data
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
              localField: 'property',
              foreignField: '_id',
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [
                        {
                          $gte: [
                            '$maintenance_date',
                            new Date(year, month - 1, 1)
                          ]
                        }, // the first day of month cann't be included(unsolved)
                        {
                          $lte: [
                            '$maintenance_date',
                            new Date(year, month - 1, 31)
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
              'property.address_line1': 1,
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
          }
        ])
        .toArray()
      // console.log(`${rents?.length} --2`)
      if (rents?.length === 0) {
        // the data of previous month is null
        // automatically generate new document
        await collections.property
          ?.aggregate([
            { $match: { manager: new ObjectId(id), status: { $ne: 100 } } }, // all properties of the agent except inactive status
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
                            $gte: [
                              '$maintenance_date',
                              new Date(Date.UTC(year, month - 1, 1))
                            ]
                          }, // the first day of month cann't be included(unsolved)
                          {
                            $lte: [
                              '$maintenance_date',
                              new Date(Date.UTC(year, month, 0))
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
                maintenance_total: { $sum: '$maintenance_docs.amount' },
                // maintenance_docs: 1,
                landlord: 1,
                agent_fullname: {
                  $concat: [
                    '$agent_docs.first_name',
                    ' ',
                    '$agent_docs.last_name'
                  ]
                }
              }
            }
          ])
          .forEach((item) => {
            const initRent = {
              // eslint-disable-next-line no-underscore-dangle
              property: item._id,
              agent: id,
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
              property_docs: { landlord: item.landlord }
              // maintenance_docs: item.maintenance_docs
            }
            rents.push(initRent)
          })
      }
    } else {
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
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $eq: ['$status', 99]
                    }
                  }
                }
              ],
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
              preserveNullAndEmptyArrays: false
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
              } // generate a new field
            }
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

// get property id and date for monthly report
adminreportsRouter.get(
  '/:id/:year/:month?',
  async (req: Request, res: Response) => {
    const { id } = req.params
    // const now = new Date()
    const year = parseInt(req.params.year)
    const month = parseInt(req.params.month)
    // const inDate = new Date(year, month - 1, 1)
    const query = {
      property: new ObjectId(id),
      rent_date: {
        $gte: new Date(Date.UTC(year, month - 1, 1)), // create a Date-object from a specific UTC time that includes the current time zone
        $lte: new Date(Date.UTC(year, month, 0)) // Feb has just 28 days
      }
    }
    // console.log('greater', new Date(Date.UTC(year, month - 1, 1)))
    // console.log('less', new Date(Date.UTC(year, month, 0)))
    // console.log(year, month)

    // const queryPreMonth = {
    //   property: new ObjectId(id),
    //   rent_date: {
    //     $gte: new Date(
    //       Date.UTC(inDate.getFullYear(), inDate.getMonth() - 1, 1)
    //     ),
    //     $lte: new Date(Date.UTC(inDate.getFullYear(), inDate.getMonth(), 0))
    //   }
    // }

    let rents: any

    try {
      // const results = (await collections.rent
      //   ?.find(query)
      //   .toArray()) as Reports[]

      // is current month and current month data null?
      // if (results?.length === 0) {
      //   rents = await collections.rent
      //     ?.aggregate([
      //       {
      //         $match: query // get previous month data
      //       },
      //       {
      //         $limit: 1
      //       },
      //       {
      //         // left join select
      //         $lookup: {
      //           from: 'Property',
      //           localField: 'property',
      //           foreignField: '_id',
      //           as: 'property_docs'
      //         }
      //       },
      //       {
      //         // Deconstructs an array field from the input documents to output a document for each element
      //         // if you take three documents(A=>B=>C) associated search, you must unwind the B document before associate with C document
      //         $unwind: {
      //           path: '$property_docs',
      //           preserveNullAndEmptyArrays: true
      //         }
      //       },
      //       {
      //         // associates the third document
      //         $lookup: {
      //           from: 'Maintenance',
      //           localField: 'property',
      //           foreignField: '_id',
      //           pipeline: [
      //             {
      //               $match: {
      //                 $expr: {
      //                   $and: [
      //                     {
      //                       $gte: [
      //                         '$maintenance_date',
      //                         new Date(Date.UTC(year, month - 1, 1))
      //                       ]
      //                     }, // the first day of month cann't be included(unsolved)
      //                     {
      //                       $lte: [
      //                         '$maintenance_date',
      //                         new Date(Date.UTC(year, month, 0))
      //                       ]
      //                     }
      //                   ]
      //                 }
      //               }
      //             },
      //             {
      //               $project: { _id: 1, amount: 1 }
      //             }
      //           ],
      //           as: 'maintenance_docs'
      //         }
      //       },
      //       {
      //         $lookup: {
      //           from: 'User',
      //           localField: 'agent',
      //           foreignField: '_id',
      //           as: 'agent_docs'
      //         }
      //       },
      //       {
      //         $unwind: { path: '$agent_docs', preserveNullAndEmptyArrays: true }
      //       },
      //       {
      //         // filter the fields that be sent to front-end( _id is default included so must be excluded)
      //         $project: {
      //           'property.address_line1': 1,
      //           agent: 1,
      //           tenant: 1,
      //           tenant_amount: 1,
      //           maintenance: 1,
      //           landlord_amount: 1,
      //           agent_amount: 1,
      //           company_amount: 1,
      //           cra: 1,
      //           rental_start: 1,
      //           rental_end: 1,
      //           rent_date: 1,
      //           grant: 1,
      //           note: 1,
      //           'property_docs.account': 1,
      //           'property_docs.landlord': 1,
      //           'property_docs.email': 1,
      //           'agent_docs.mobile': 1,
      //           agent_fullname: {
      //             $concat: [
      //               '$agent_docs.first_name',
      //               ' ',
      //               '$agent_docs.last_name'
      //             ]
      //           },
      //           prop_address: {
      //             $concat: [
      //               '$property_docs.address_line1',
      //               ' ',
      //               '$property_docs.city',
      //               ' ',
      //               '$property_docs.province',
      //               ' ',
      //               '$property_docs.postcode',
      //               ' '
      //             ]
      //           },
      //           TotalValueOfBothFields: {
      //             $add: [
      //               '$tenant_amount',
      //               '$landlord_amount',
      //               '$agent_amount',
      //               '$maintenance',
      //               '$company_amount'
      //             ]
      //           }
      //         }
      //       }
      //     ])
      //     .toArray()
      // console.log(`${rents?.length} --2`)
      // if (rents?.length === 0) {
      //   // the data of previous month is null
      //   // automatically generate new document
      //   await collections.property
      //     ?.aggregate([
      //       { $match: { manager: new ObjectId(id), status: { $ne: 100 } } }, // all properties of the agent except inactive status
      //       {
      //         $lookup: {
      //           // left join Maintenance to calculate the maintenance total
      //           from: 'Maintenance',
      //           localField: '_id',
      //           foreignField: 'property',
      //           pipeline: [
      //             {
      //               $match: {
      //                 $expr: {
      //                   $and: [
      //                     {
      //                       $gte: [
      //                         '$maintenance_date',
      //                         new Date(Date.UTC(year, month - 1, 1))
      //                       ]
      //                     }, // the first day of month cann't be included(unsolved)
      //                     {
      //                       $lte: [
      //                         '$maintenance_date',
      //                         new Date(Date.UTC(year, month, 0))
      //                       ]
      //                     }
      //                   ]
      //                 }
      //               }
      //             },
      //             {
      //               $project: { _id: 1, amount: 1 }
      //             }
      //           ],
      //           as: 'maintenance_docs'
      //         }
      //       },
      //       {
      //         $lookup: {
      //           from: 'User',
      //           localField: 'manager',
      //           foreignField: '_id',
      //           as: 'agent_docs'
      //         }
      //       },
      //       {
      //         $unwind: {
      //           path: '$agent_docs',
      //           preserveNullAndEmptyArrays: true
      //         }
      //       },
      //       {
      //         $project: {
      //           maintenance_total: { $sum: '$maintenance_docs.amount' },
      //           // maintenance_docs: 1,
      //           landlord: 1,
      //           agent_fullname: {
      //             $concat: [
      //               '$agent_docs.first_name',
      //               ' ',
      //               '$agent_docs.last_name'
      //             ]
      //           }
      //         }
      //       }
      //     ])
      //     .forEach((item) => {
      //       const initRent = {
      //         // eslint-disable-next-line no-underscore-dangle
      //         property: item._id,
      //         agent: id,
      //         tenant: '',
      //         tenant_amount: new Double(0),
      //         maintenance: item.maintenance_total,
      //         landlord_amount: new Double(0),
      //         agent_amount: new Double(0),
      //         company_amount: new Double(0),
      //         cra: new Double(0),
      //         rental_start: new Date(Date.UTC(year, month - 1, 1)),
      //         rental_end: new Date(Date.UTC(year, month, 0)),
      //         rent_date: new Date(Date.UTC(year, month - 1, 1)),
      //         grant: false,
      //         note: '',
      //         agent_fullname: item.agent_fullname,
      //         property_docs: { landlord: item.landlord }
      //         // maintenance_docs: item.maintenance_docs
      //       }
      //       rents.push(initRent)
      //     })
      // }
      // }

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
              rental_start: new Date(Date.UTC(year, month - 1, 1)),
              rental_end: new Date(Date.UTC(year, month, 0)),
              rent_date: new Date(Date.UTC(year, month, 1)),
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
              } // generate a new field
            }
          }
        ])
        .toArray()

      // console.log(`${JSON.stringify(rents)} --3`)
      res.status(200).send(rents)
    } catch (error) {
      res.status(500).send(error)
    }
  }
)

// get rent id and year for yearly report   need editing
// adminreportsRouter.get('/:id/:year', async (req: Request, res: Response) => {
//   const { id } = req.params
//   const year = parseInt(req.params.year)
//   const query = {
//     property: new ObjectId(id),
//     rent_date: {
//       $gte: new Date(Date.UTC(year, 0, 1)), // create a Date-object from a specific UTC time that includes the current time zone
//       $lte: new Date(Date.UTC(year, 11, 31))
//     }
//   }

//   try {
//     // is current month and current month data null?
//     const results = await collections.rent
//       ?.aggregate([
//         {
//           $match: query
//         },
//         {
//           // left join select
//           $lookup: {
//             from: 'Property',
//             localField: 'property',
//             foreignField: '_id',
//             as: 'property_docs'
//           }
//         },
//         {
//           $lookup: {
//             from: 'User',
//             localField: 'agent',
//             foreignField: '_id',
//             as: 'agent_docs'
//           }
//         },
//         {
//           // Deconstructs an array field from the input documents to output a document for each element
//           $unwind: {
//             path: '$property_docs',
//             preserveNullAndEmptyArrays: true
//           }
//         },
//         {
//           $unwind: { path: '$agent_docs', preserveNullAndEmptyArrays: true }
//         },
//         {
//           // filter the fields that be sent to front-end( _id is default included )
//           $project: {
//             property: 1,
//             agent: 1,
//             tenant: 1,
//             tenant_amount: 1,
//             maintenance: 1,
//             landlord_amount: 1,
//             agent_amount: 1,
//             company_amount: 1,
//             cra: 1,
//             rental_start: 1,
//             rental_end: 1,
//             rent_date: 1,
//             grant: 1,
//             note: 1,
//             'property_docs.account': 1,
//             'property_docs.landlord': 1,
//             agent_fullname: {
//               $concat: ['$agent_docs.first_name', ' ', '$agent_docs.last_name']
//             },
//             prop_address: {
//               $concat: [
//                 '$property_docs.address_line1',
//                 ' ',
//                 '$property_docs.address_line2',
//                 ' ',
//                 '$property_docs.city',
//                 ' ',
//                 '$property_docs.province',
//                 ' ',
//                 '$property_docs.postcode',
//                 ' '
//               ]
//             },
//             TotalValueOfBothFields: {
//               $add: [
//                 '$tenant_amount',
//                 '$landlord_amount',
//                 '$agent_amount',
//                 '$maintenance',
//                 '$company_amount'
//               ]
//             } // generate a new field
//           }
//         }
//       ])
//       .toArray()

//     res.status(200).send(results)
//   } catch (error) {
//     res.status(500).send(error)
//   }
// })

// POST
adminreportsRouter.post('/adminreport', async (req: Request, res: Response) => {
  try {
    const newRent = req.body as Reports
    const result = await collections.rent?.insertOne(newRent)

    result
      ? res
          .status(201)
          .send(`Successfully created a new game with id ${result.insertedId}`)
      : res.status(500).send('Failed to create a new game.')
  } catch (error) {
    console.error(error)
    res.status(400).send(error)
  }
})

// PUT

// DELETE
