const Product = require('./../models/productsModel');

const catchAsync = require('./../utils/catchAsync');

const factory = require('./../controllers/handlerFactory');

exports.topRatedProducts = (req, res, next) => {
  req.query.limit = '10';
  req.query.sort = '-ratingsAverage ,price';
  req.query.fields = 'name,price,ratingsAverage,companyName,productType';

  next();
};

exports.getAllProducts = factory.getAll(Product);

exports.getOneProduct = factory.getOne(Product, { path: 'reviews' });
exports.createProduct = factory.createOne(Product);
exports.UpdateProduct = factory.updateOne(Product);

exports.deleteProduct = factory.deleteOne(Product);

// exports.deleteProduct = catchAsync(async (req, res, next) => {
//   const product = await Product.findByIdAndDelete(req.params.id);
//   if (!product) {
//     return next(new AppError('no product found with that id', 404));
//   }
//   res.status(204).json({ status: 'successfully deleted', data: null });
// });

exports.getProductStats = catchAsync(async (req, res, next) => {
  const stats = await Product.aggregate([
    {
      $match: { ratingsAverage: { $gte: 4.5 } }
    },
    {
      $group: {
        _id: { $toUpper: '$productType' },
        numProducts: { $sum: 1 },
        numRatings: { $sum: '$ratingsQuantity' },
        avgRatings: { $avg: '$ratingsAverage' },
        avgPrice: { $avg: '$price' },
        minPrice: { $min: '$price' },
        maxPrice: { $max: '$price' }
      }
    },
    {
      $sort: { avgPrice: 1 }
    }
  ]);
  res.status(200).json({
    status: 'success',
    data: {
      stats
    }
  });
});
