/* eslint-disable prefer-destructuring */
import { NextFunction, Response } from 'express'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import asyncHandler from 'express-async-handler'

import { collections } from '../services/database.service'

// @desc Middleware for checking if user is logged in
const protect = asyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    let token
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      try {
        token = req.headers.authorization.split(' ')[1]
        const decoded = jwt.verify(
          token,
          '36D678C0CC35C6F98A20414A77B3112514567B17F0D3E4B8099B9F01DC876A93' as string
        ) as any

        // select except password
        req.user = await collections.user?.findOne({
          _id: new ObjectId(decoded.id)
        })
        next()
      } catch (error) {
        console.error(error)
        res.status(401)
        throw new Error('Not authorized, no token')
      }
    }

    if (!token) {
      res.status(401)
      throw new Error('Not authorized, no token')
    }
  }
)

const admin = asyncHandler(
  async (req: any, res: Response, next: NextFunction) => {
    if ((req.user && req.user.role === 201) || req.user.role === 202) {
      next()
    } else {
      res.status(401)
      throw new Error('Not authorized as an admin')
    }
  }
)

// @desc Middleware for checking if user is admin
export { protect, admin }
