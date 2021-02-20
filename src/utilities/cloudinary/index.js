const cloudinary = require('cloudinary').v2
const { CloudinaryStorage } = require('multer-storage-cloudinary'),
    multer = require('multer')

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
})

//STRIVIFY USERS STORAGE
const userStorage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: `${process.env.CLOUDINARY_USERS_FOLDER}`,
        use_filename: true,
        public_id: (req, file) => {
            return file.originalname
        }
    }
})

const userUpload = multer({ storage: userStorage })

module.exports = {
    userUpload
}