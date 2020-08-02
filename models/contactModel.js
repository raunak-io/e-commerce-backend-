const mongoose = require('mongoose');
const validator = require('validator');

const contactSchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: [true, 'first name is required']
    },
    lastname: {
      type: String,
      required: [true, 'last name is required']
    },
    email: {
      type: String,
      required: [true, 'email field is required'],
      unique: [false, 'email field is required'],
      lowercase: true,
      validate: [validator.isEmail, 'please enter your correct email address']
    },

    mobile: {
      type: Number,
      required: [true, 'please provide us your contact number']
    },

    message: {
      type: String,
      required: [true, ' please enter your message'],
      trim: true
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

const ContactUs = mongoose.model('ContactUs', contactSchema);
module.exports = ContactUs;
