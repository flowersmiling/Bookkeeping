/* eslint-disable no-underscore-dangle */
// External Dependencies
import express, { Request, Response, Router } from 'express'
import fs from 'fs'
import path from 'path'
import multer from 'multer'
import { Int32, ObjectId } from 'mongodb'
import { collections } from 'services/database.service'
import Document from '../models/Document'
// global config
export const contractRouter: Router = express.Router()

const diskStorage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, './uploads')
  },
  filename(req, file, cb) {
    cb(
      null,
      `${new Date().toISOString().replace(/:/g, '-')}-${file.originalname}`
    )
  }
})

const upload = multer({
  storage: diskStorage,
  limits: {
    fileSize: 20000000 // max file size 20MB = 20000000 bytes
  },
  fileFilter(req, file, cb) {
    if (
      !file.originalname.match(/\.(jpeg|jpg|png|pdf|doc|docx|xlsx|xls|txt)$/i)
    ) {
      return cb(
        new Error(
          'only upload files with jpg, jpeg, png, pdf, doc, docx, xslx, xls, txt format.'
        )
      )
    }
    return cb(undefined, true) // continue with upload
  }
})

contractRouter.get('/files', async (req: Request, res: Response) => {
  try {
    const documents = (await collections.document
      ?.find({})
      .toArray()) as Document[]
    const sortedByCreationDate = documents.sort(
      (a: any, b: any) => b.upload_date - a.upload_date
    )
    res.status(200).send(sortedByCreationDate)
  } catch (error) {
    res.status(500).send(error)
  }
})

// middleware 'upload.single' is used to upload a single file
// 'file' must be the same as the name attribute in the front-end form(or formData append name)
contractRouter.post(
  '/upload',
  upload.single('file'),
  async (req: any, res: Response) => {
    // the req shares the req value of the global middleware "protect"
    const id: ObjectId = req.user._id
    try {
      const newDocument = {
        creator: id,
        upload_date: new Date(),
        filename: req.file.originalname,
        mimetype: req.file.mimetype,
        size: new Int32(req.file.size),
        filepath: req.file.path
      } as Document
      const result = await collections.document?.insertOne(newDocument)

      result
        ? res.status(201).send(result)
        : res.status(500).send(`Failed to create a new Document.`)
    } catch (error) {
      console.error(error)
      res.status(400).send(error)
    }
  }
)

contractRouter.get('/download/:id', async (req: Request, res: Response) => {
  const { id } = req.params
  try {
    const query = { _id: new ObjectId(id) }
    const file = (await collections.document?.findOne(query)) as Document
    res.set({
      'Content-Type': file.mimetype
    })
    // __dirname is the current directory,'..' means go up one level
    res.status(200).sendFile(path.join(__dirname, '..', file.filepath))
  } catch (error) {
    res.status(400).send('Error while downloading file. Try again later.')
  }
})

contractRouter.delete('/delete/:id', async (req: any, res: Response) => {
  const { id } = req.params
  try {
    const query = { _id: new ObjectId(id) }
    const file = (await collections.document?.findOne(query)) as Document
    let result = null

    // only the creator of the file can delete it
    if (req.user.role === 201) {
      // delete the file from the server physically
      fs.unlinkSync(path.join(__dirname, '..', file.filepath))
      // delete the file from the database logically
      result = await collections.document?.deleteOne(query)
    }

    result
      ? res.status(200).send(result)
      : res.status(500).send(`Failed to delete the File.`)
  } catch (error) {
    res.status(400).send('Error while deleting file. Try again later.')
  }
})
