const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
// const cloudinary = require('cloudinary');
const Formidable = require('formidable')
const User = require('./../models/userModel');
const ContactUs = require('./../models/contactModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');
const cloudinary = require('../utils/cloudinary')

const signToken = id => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN
  });
};

const createSendToken = (user, statusCode, res) => {
  const token = signToken(user._id);

  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true
  };
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  res.cookie('jwt', token, cookieOptions);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    tokenExpiresIn: 90 * 24 * 60 * 60,

    data: {
      user
    }
  });
};

exports.signUp = catchAsync(async (req, res, next) => {
  cloudinary.uploader.upload(req.file.path, res => {
    imgUrlGetter(res.secure_url);
  });
  const imgUrlGetter = async function(url) {
    const newUser = await User.create({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      confirmPassword: req.body.confirmPassword,
      image: url
    });
    createSendToken(newUser, 201, res);
  };
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return next(new AppError('email/password is missing', 404));
  }

  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('incorrect email/password', 401));
  }

  createSendToken(user, 200, res);
});

exports.protect = catchAsync(async (req, res, next) => {
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }
console.log("passed protecxt stage")
  if (!token) {
    return next(
      new AppError('you are not logged in ! Please log in to get access', 401)
    );
  }

  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError('the user belong to this token does no longer exist.', 401)
    );
  }

  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('User recently changed password ! please login again', 401)
    );
  }

  req.user = currentUser;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('You do not have permission to perform this action', 403)
      );
    }
    next();
  };
};

exports.contactUs = catchAsync(async (req, res, next) => {
  const contacting = await ContactUs.create({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    mobile: req.body.mobile,
    message: req.body.message
  });

  const message = `Dear ${req.body.firstname} ${req.body.lastname} .
        Thank you for contacting us .
        we have recieved your message .
        for any other queries regarding our products and services
        feel free to contact us at
             :freakylabzz147@gmail.com 
        or give us a call anytime at
             : (+91)-831-805-3987 
        from abhishek@freakylabzz.in  `;

  try {
    await sendEmail({
      email: req.body.email,
      subject: `hello ${req.body.firstname} .Thanks for reaching us `,
      message
    });

    res.status(200).json({
      status: 'success',
      message: "THANK YOU FOR REACHING US !! WE'VE RECIEVED YOUR MESSAGE!"
    });
  } catch (err) {
    // console.log(err);
    return next(
      new AppError('there was an error sending the email, Try again Later', 500)
    );
  }
});

exports.forgotPassword = catchAsync(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(new AppError('there is no user with that email address', 404));
  }
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const url = req.protocol + '://' + req.get('host');

  const resetURL = url + '/user/reset-pass/' + resetToken;

  const message = `Forgot your password? 
         please click on the link below to reset your password
             : ${resetURL}.
         if you didn't forget your password then please ignore this email`;

  try {
    await sendEmail({
      email: user.email,
      subject: 'your password reset token (valid for 10 mins only)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: `token sent to the email`
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError('there was an error sending the email, Try again Later', 500)
    );
  }
});

exports.resetPassword = catchAsync(async (req, res, next) => {
  const hashToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: hashToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  if (!user) {
    return next(new AppError('token is invalid or has expires', 400));
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();
  createSendToken(user, 200, res);
});

exports.updatePassword = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.user.id).select('+password');

  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(
      new AppError('please enter the correct previous password to update', 401)
    );
  }

  user.password = req.body.password;
  user.confirmPassword = req.body.confirmPassword;
  await user.save();

  createSendToken(user, 200, res);
});
