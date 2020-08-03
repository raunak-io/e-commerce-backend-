const path = require('path');
const express = require('express');
const morgan = require('morgan');

const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const compression = require('compression');

const cors = require('cors');
// const bodyParser = require('body-parser');

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const productRouter = require('./routes/productsRoutes');
const userRouter = require('./routes/usersRoutes');
const reviewRouter = require('./routes/reviewRoutes');

const app = express();
app.use(helmet());
app.use(cors());
app.options('*', cors());
app.use('/images', express.static(path.join(__dirname, 'images')));

app.use(morgan('dev'));

const limiter = rateLimit({
  max: 50,
  windowMs: 60 * 60 * 1000,
  message: 'too many requests from this ip address, please try again in an hour'
});

app.use('/api', limiter);

app.use(express.json({ limit: '10kb' }));
app.use(cookieParser());

app.use(mongoSanitize());

app.use(xss());

app.use(
  hpp({
    whitelist: ['price', 'ratingsQuantity', 'ratingsAverage', 'productType']
  })
);

app.use(compression());
// Serving static files
app.use(express.static(`${__dirname}/public`));
app.use('/',express.static(path.join(__dirname,`frontend-data`)));


app.use('/api/v1/products', productRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use((req,res,next)=>{
  res.sendFile(path.join(__dirname,"frontend-data","index.html"))
})

app.all('*', (req, res, next) => {
  next(new AppError(`can't find ${req.originalUrl} on this server`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
