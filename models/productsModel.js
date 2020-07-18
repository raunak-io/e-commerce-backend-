const mongoose = require('mongoose');
const slugify = require('slugify');

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A product must contain a name'],
      unique: true,
      trim: true,
      maxlength: [40, 'a product must have name less than 40 characters'],
      minlength: [
        6,
        'a product must must contain a name of atleast 6 characters'
      ]
    },
    companyName: {
      type: String,
      trim: true,
      required: [true, 'a product must have its company name']
    },
    productType: {
      type: String,
      required: [true, 'type of product must be specified'],
      trim: true
    },
    slug: String,

    price: {
      type: Number,
      required: [true, 'a product must contain a price']
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function(val) {
          return val < this.price;
        },
        message: 'discount price ({VALUE}) must be below regular price'
      }
    },
    description: {
      type: String,
      required: [true, ' a product must contain a description'],
      trim: true
    },
    image: String,
    ratingsAverage: {
      type: Number,
      default: 4.5,
      min: [1, 'Rating must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
      set: val => Math.round(val * 10) / 10
    },
    ratingsQuantity: {
      type: Number,
      default: 0
    }
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

productSchema.index({ price: 1, ratingsAverage: -1 });
productSchema.index({ slug: 1 });

productSchema.virtual('reviews', {
  ref: 'Review',
  foreignField: 'product',
  localField: '_id'
});

productSchema.pre('save', function(next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});

const Product = mongoose.model('Product', productSchema);
module.exports = Product;
