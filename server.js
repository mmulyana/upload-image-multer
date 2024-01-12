const express = require('express')
const multer = require('multer')

const app = express()

const multerStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/image')
  },
  filename: (req, file, cb) => {
    const fileType = file.mimetype.split('/')[1]
    cb(null, `${Date.now()}.${fileType}`)
  },
})

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true)
  } else {
    cb(new Error('Not an image'), false)
  }
}

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.post('/upload', upload.single('photo'), async (req, res) => {
  try {
    console.log(req.file)

    res.status(200).json({ message: 'image upload success!' })
  } catch (error) {
    console.log(error)
    res.status(400).json({ message: error.message })
  }
})

app.listen(8000, () =>
  console.log('server is running in http://localhost:8000')
)
