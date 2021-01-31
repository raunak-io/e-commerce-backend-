// const multer = require('multer');

// const MIME_TYPE_MAP = {
//   'image/png': 'png',
//   'image/jpeg': 'jpg',
//   'image/jpg': 'jpg'
// };

// const fileStorage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     const isValid = MIME_TYPE_MAP[file.mimetype];
//     let error = new Error('Invalid mime type');
//     if (isValid) {
//       error = null;
//     }
//     console.log("image validation stage passed")
//     cb(error, 'images/products');
//   },
//   filename: (req, file, cb) => {
//     const name = file.originalname
//       .toLowerCase()
//       .split(' ')
//       .join('-');
//     const extension = MIME_TYPE_MAP[file.mimetype];
//     console.log("image validation stage 111passed",req.body,file)
//     cb(null, name ); //
//     console.log("image validation stage passed",req.body,file)
//   }

// }
// );
// module.exports = multer({ storage: fileStorage }).single('image');
const multer = require('multer');

const MIME_TYPE_MAP = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/jpg': 'jpg'
};

//cloudinary.uploader.upload(//file path and a call back function)
const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const isValid = MIME_TYPE_MAP[file.mimetype];
    let error = new Error('Invalid mime type');
    if (isValid) {
      error = null;
    }
    cb(error, 'images/products');
  },
  filename: (req, file, cb) => {
    const name = file.originalname
      .toLowerCase()
      .split(' ')
      .join('-');
    cb(null, name);
  }
});
module.exports = multer({ storage: fileStorage }).single('image');
