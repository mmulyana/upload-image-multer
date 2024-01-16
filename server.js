const express = require('express')
const multer = require('multer')
const sharp = require('sharp')

const app = express()

const multerStorage = multer.memoryStorage()

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new Error('Not an image'), false)
  }
}

const resizePhoto = (req, res, next) => {
  if (!req.file) return next()

  req.file.filename = `img-${Date.now()}.jpeg`

  sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/image/${req.file.filename}`)

  next()
}

const resizeMultiplePhotos = async (req, res, next) => {
  if (!req.files.images) return next()

  req.body.images = []
  await Promise.all(
    req.files.images.map(async (file, i) => {
      const filename = `${i+1}-${Date.now()}.jpeg`

      await sharp(file.buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/image/${filename}`)
      req.body.images.push(filename)
    })
  )

  next()
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/upload', upload.single('photo'), resizePhoto, async (req, res) => {
  try {
    console.log(req.body.images)

    res.status(200).json({ message: 'image upload success!' })
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: error.message })
  }
})

app.post(
  '/multiple-upload',
  upload.fields([{ name: 'images', maxCount: 5 }]),
  resizeMultiplePhotos,
  async (req, res) => {
    try {
      console.log(req.files)
      res.status(200).json({ message: 'multiple image upload success' })
    } catch (error) {
      console.log(error)
      res.status(500).json({ error: error.message })
    }
  }
)

app.listen(8000, () =>
  console.log('server is running in http://localhost:8000')
)
