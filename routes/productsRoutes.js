const express = require('express');
const authController = require('./../controllers/authController');

const productControllers = require('./../controllers/productsControllers');
const reviewRouter = require('./../routes/reviewRoutes');
const postImageValidation = require('../utils/postImageValidator');
const router = express.Router();

router.use('/:productId/reviews', reviewRouter);

router
  .route('/')
  .get(productControllers.getAllProducts)
  .post(
    authController.protect,
    authController.restrictTo('admin'),
    postImageValidation,
    productControllers.createProduct
  );
router
  .route('/top-rated-products')
  .get(productControllers.topRatedProducts, productControllers.getAllProducts);
router
  .route('/products-statistics')
  .get(
    authController.protect,
    authController.restrictTo('admin'),
    productControllers.getProductStats
  );

router
  .route('/:id')
  .get(productControllers.getOneProduct)
  .patch(
    authController.protect,
    authController.restrictTo('admin'),
    postImageValidation,
    productControllers.UpdateProduct
  )
  .delete(
    authController.protect,
    authController.restrictTo('admin'),
    productControllers.deleteProduct
  );

// router
//   .route('/:productId/reviews')
//   .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
//   );

module.exports = router;
