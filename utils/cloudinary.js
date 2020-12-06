const cloudinary = require('cloudinary');
const dotenv = require('dotenv');
dotenv.config({ path: '../config.env' });

cloudinary.config({
  cloud_name: process.env.Cloud_name,
  api_key: process.env.API_Key,
  api_secret: process.env.API_Secret
});

module.exports = cloudinary;
