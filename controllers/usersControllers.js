const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./../controllers/handlerFactory');
const cloudinary = require('../utils/cloudinary');

// const filterObj = (obj, ...allowedFields) => {
//   const newObj = {};
//   Object.keys(obj).forEach(el => {
//     if (allowedFields.includes(el)) newObj[el] = obj[el];
//   });
//   return newObj;
// };

exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};
exports.updateMe = catchAsync(async (req, res, next) => {
  if (req.body.password || req.body.confirmPassword) {
    return next(
      new AppError(
        'this route is not for password updates . please use update my password.',
        400
      )
    );
  }

  let image = req.body.image;
  if (req.file) {
    cloudinary.uploader.upload(req.file.path, res => {
      imgUrlGetter(res.secure_url);
    });

    const imgUrlGetter = async function(url) {
      const filteredBody = {
        name: req.body.name,
        email: req.body.email,
        image: url
      };
      const updateUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody,
        {
          new: true,
          runValidators: true
        }
      );
      res.status(200).json({
        status: 'success',
        data: {
          user: updateUser
        }
      });
    };
  } else {
    const filteredBody = {
      name: req.body.name,
      email: req.body.email,
      image: image
    };
    //  filterObj(req.body, 'name', 'email', 'image');
    const updateUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
      new: true,
      runValidators: true
    });
    res.status(200).json({
      status: 'success',
      data: {
        user: updateUser
      }
    });
  }
});

exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});

exports.getAllUsers = factory.getAll(User);

exports.getOneUser = factory.getOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'this route is not yet implemented ! please use signUp instead'
  });
};
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);
