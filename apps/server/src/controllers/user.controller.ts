/* eslint-disable prefer-destructuring */
/* eslint-disable arrow-body-style */
/* eslint-disable object-shorthand */
/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable no-underscore-dangle */
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import asyncHandler from 'express-async-handler'
import { ObjectId } from 'mongodb'
import User from '../models/User'
import { collections } from '../services/database.service'

// Method to compare password
const matchPassword = (enteredPassword: string, storedPassword: string) => {
  // return true
  return bcrypt.compare(enteredPassword, storedPassword)
}

// Method to hash password
const hashPassword = async (password: string) => {
  const salt = await bcrypt.genSalt(10)
  const generatedPassword = await bcrypt.hash(password, salt)
  return generatedPassword
}

// Method to generate token
const generateToken = (id: string) => {
  return jwt.sign(
    { id: id },
    '36D678C0CC35C6F98A20414A77B3112514567B17F0D3E4B8099B9F01DC876A93' as string,
    {
      expiresIn: '30d'
    }
  )
}

// // @desc Fetch Auth user & get token
// // @route POST /api/users/login
// // @access Public
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body
  const user = (await collections.user?.findOne({ email })) as User

  if (user && (await matchPassword(password, user.password))) {
    res.json({
      _id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      status: user.status,
      mobile: user.mobile,
      telephone: user.telephone,
      address: user.address,
      token: generateToken(user._id?.toString() as string)
    })
  } else {
    res.status(401)
    throw new Error('Invalid email or password')
  }
})

// @desc    Register a new user
// @route   POST /api/users
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  const { first_name, last_name, email, password, mobile, address } = req.body
  const hashedPassword = await hashPassword(password)
  const userExists = await collections.user?.findOne({ email })
  if (userExists) {
    res.status(400)
    throw new Error('User already exists')
  }
  const user = await collections.user?.insertOne({
    first_name,
    last_name,
    email,
    password: hashedPassword,
    role: 209,
    status: 99,
    mobile,
    address
  })
  if (user) {
    const token = generateToken(user.insertedId?.toString() as string)
    res.status(201).json({
      _id: user.insertedId,
      token
    })
  } else {
    res.status(400)
    throw new Error('Invalid user data')
  }
})

// // // @desc Get user profile
// // @route GET /api/users/profile
// // @access Private
const getUserProfile = asyncHandler(async (req: any, res) => {
  const user = req.user

  if (user) {
    res.json({
      _id: user._id,
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      status: user.status,
      mobile: user.mobile,
      telephone: user.telephone,
      address: user.address
    })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// // @desc Update user profile
// // @route PUT /api/users/profile
// // @access Private
const updateUserProfile = asyncHandler(async (req: any, res) => {
  const user = await collections.user?.findOne({
    _id: new ObjectId(req.body._id)
  })

  // check if the user exist
  if (user) {
    const {
      email,
      first_name,
      last_name,
      old_password,
      new_password,
      mobile,
      address
    } = req.body

    const isPasswordMatched = await matchPassword(old_password, user.password)

    if (!isPasswordMatched) {
      throw new Error('Your password is incorrect')
    }

    const hashedPassword = await hashPassword(new_password)

    user.first_name = first_name
    user.last_name = last_name
    user.email = email
    user.password = hashedPassword
    user.mobile = mobile
    user.address = address

    await collections.user?.updateOne(
      {
        _id: new ObjectId(req.body._id)
      },
      {
        $set: {
          ...user
        }
      }
    )

    res.json({
      _id: user._id,
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      mobile: user.mobile,
      address: user.address,
      token: generateToken(user._id?.toString() as string)
    })
  } else {
    res.status(404)
    throw new Error('You are not authorized to update this user')
  }
})

const updateUserRole = asyncHandler(async (req: any, res) => {
  const user = await collections.user?.findOne({
    _id: new ObjectId(req.body._id)
  })

  // check if the user exist
  if (user) {
    const { role, status } = req.body

    user.role = role
    user.status = status

    await collections.user?.updateOne(
      {
        _id: new ObjectId(req.body._id)
      },
      {
        $set: {
          ...user
        }
      }
    )

    res.json({
      _id: user._id
    })
  } else {
    res.status(404)
    throw new Error('You are not authorized to update this user')
  }
})

const resetPassword = asyncHandler(async (req: any, res) => {
  const user = await collections.user?.findOne({
    _id: new ObjectId(req.body._id)
  })

  // check if the user exist
  if (user) {
    user.password = await hashPassword('123456')

    await collections.user?.updateOne(
      {
        _id: new ObjectId(req.body._id)
      },
      {
        $set: {
          password: user.password
        }
      }
    )

    res.json({
      _id: user._id
    })
  } else {
    res.status(404)
    throw new Error('You are not authorized to update this user')
  }
})

// // @desc Get all users
// // @route GET /api/users
// // @access Private/Admin
const getUsers = asyncHandler(async (req, res) => {
  const users = await collections.user?.find({}).toArray()
  res.json(users)
})

// @desc Delete user
// @route DELETE /api/users/:id
// @access Private/Admin
const deleteUser = asyncHandler(async (req: any, res) => {
  const user = await collections.user?.findOne({
    _id: new ObjectId(req.body._id)
  })

  if (user) {
    await collections.user?.deleteOne({
      _id: new ObjectId(req.body._id)
    })

    res.json({
      _id: user._id
    })

    // await user.remove()
    res.json({ message: 'User removed' })
  } else {
    res.status(404)
    throw new Error('User not found')
  }
})

// // @desc Get user by ID
// // @route GET /api/users/:id
// // @access Private/Admin
// const getUserById = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.params.id).select('-password')
//   if (user) {
//     res.json(user)
//   } else {
//     res.status(404)
//     throw new Error('User not found')
//   }
// })

// @desc Update user
// @route PUT /api/users/:id
// @access Private/Admin
// const updateUser = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.params.id)

//   // check if the user exist
//   if (user) {
//     user.name = req.body.name || user.name
//     user.email = req.body.email || user.email
//     user.isAdmin = req.body.isAdmin

//     const updatedUser = await user.save()
//     res.json({
//       _id: updatedUser._id,
//       name: updatedUser.name,
//       email: updatedUser.email,
//       isAdmin: updatedUser.isAdmin
//     })
//   } else {
//     res.status(404)
//     throw new Error('User not found')
//   }
// })

// // @desc Get user by ID
// // @route GET /api/users/:id
// // @access Private/Admin
// const getUserById = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.params.id).select('-password')
//   if (user) {
//     res.json(user)
//   } else {
//     res.status(404)
//     throw new Error('User not found')
//   }
// })
// @desc Update user
// @route PUT /api/users/:id
// @access Private/Admin
// const updateUser = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.params.id)
//   // check if the user exist
//   if (user) {
//     user.name = req.body.name || user.name
//     user.email = req.body.email || user.email
//     user.isAdmin = req.body.isAdmin
//     const updatedUser = await user.save()
//     res.json({
//       _id: updatedUser._id,
//       name: updatedUser.name,
//       email: updatedUser.email,
//       isAdmin: updatedUser.isAdmin
//     })
//   } else {
//     res.status(404)
//     throw new Error('User not found')
//   }
// })
export {
  authUser,
  registerUser,
  getUserProfile,
  updateUserProfile,
  updateUserRole,
  getUsers,
  resetPassword,
  // deleteUser,
  // getUserById,
  // updateUser
  deleteUser
}
