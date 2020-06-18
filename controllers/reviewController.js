const Review = require('./../models/reviewModel');
const factory = require('./../controllers/handlerFactory');

exports.getAllReviews = factory.getAll(Review);

exports.setProductUserId = (req, res, next) => {
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user.id;

  next();
};
exports.getReview = factory.getOne(Review);
exports.createReview = factory.createOne(Review);
exports.updateReview = factory.updateOne(Review);
exports.deleteReview = factory.deleteOne(Review);
