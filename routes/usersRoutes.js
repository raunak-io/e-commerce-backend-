const express = require('express');
const userControllers = require('./../controllers/usersControllers');
const authController = require('./../controllers/authController');
const imageValidator = require('../utils/imageValidator');
const router = express.Router();

router.post('/signUp', imageValidator, authController.signUp);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.post('/contactUs', authController.contactUs);

router.use(authController.protect);

router.patch('/updateMyPassword', authController.updatePassword);

router.get('/me', userControllers.getMe, userControllers.getOneUser);

router.patch('/updateMe', imageValidator, userControllers.updateMe);
router.delete('/deleteMe', userControllers.deleteMe);

router.use(authController.restrictTo('admin'));
router
  .route('/')
  .get(userControllers.getAllUsers)
  .post(userControllers.createUser);
router
  .route('/:id')
  .get(userControllers.getOneUser)
  .patch(userControllers.updateUser)
  .delete(userControllers.deleteUser);

module.exports = router;
