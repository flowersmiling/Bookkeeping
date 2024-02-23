import express, { Router } from 'express'
import {
  authUser,
  getUserProfile,
  registerUser,
  // updateUserProfile,
  getUsers,
  updateUserProfile,
  updateUserRole,
  deleteUser,
  resetPassword
  // getUserById,
  // updateUser
} from '../controllers/user.controller'
import { admin, protect } from '../middleware/auth.middleware'

const userRouter: Router = express.Router()
userRouter.use(express.json())
// /api/users
userRouter.route('/').post(registerUser).get(getUsers)
userRouter.post('/login', authUser)
userRouter.route('/me').get(protect, getUserProfile)
userRouter.route('/update').put(protect, updateUserProfile)
userRouter.route('/delete').delete(protect, admin, deleteUser)
userRouter.route('/users').get(protect, admin, getUsers).post(updateUserRole)
userRouter.route('/reset').get(protect, admin, getUsers).post(resetPassword)

// userRouter
//   .route('/profile')
//   .get(protect, getUserProfile)
//   .put(protect, updateUserProfile)
// userRouter
//   .route('/:id')
//   .delete(protect, admin, deleteUser)
//   .get(protect, admin, getUserById)
//   .put(protect, admin, updateUser)

export default userRouter
