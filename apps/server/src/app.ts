import cors from 'cors'
import express from 'express'
import { contractRouter } from './routes/Contract.router'
import { connectToDatabase } from './services/database.service'
import { propertyRouter } from './routes/Property.router'
import { maintenanceRouter } from './routes/Maintenance.router'
import { rentRouter } from './routes/Rent.router'
import userRouter from './routes/User.router'
import { adminreportsRouter } from './routes/Adminreport.router'
import { protect } from './middleware/auth.middleware'

const app = express()
const port = process.env.PORT || 8000

const corsOptions = {
  origin: '*',
  credentials: true,
  optionSuccessStatus: 200
}

connectToDatabase()

app.use(cors(corsOptions))

app.get('/', (_req, res) => {
  res.send('Hello World haha!')
})

app.use('/api/users', userRouter)

app.use('/properties', protect, propertyRouter)
app.use('/maintenances', protect, maintenanceRouter)
app.use('/rents', protect, rentRouter)
app.use('/adminreport', protect, adminreportsRouter)
app.use('/contracts', protect, contractRouter)

app.listen(port, () => {
  console.log(`Server started at https://localhost:${port}`)
})
