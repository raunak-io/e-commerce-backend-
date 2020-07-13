const mongoose = require('mongoose');
const dotenv = require('dotenv');

process.on('uncaught Exception', err => {
  console.log('uncaught exception shutting down ...');
  console.log(err.name, err.message);
  process.exit(1);
});

dotenv.config({ path: './config.env' });

const app = require('./app');

console.log(app.get('env'));

// const DB = process.env.DATABASE_LOCAL;
const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: false,
    useUnifiedTopology: true
  })
  .then(() => console.log('connection to database is successful'))
  .catch(err => {
    console.log(err);
  });

const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`server is lstening on port : ${port} `);
});

process.on('uncaught rejection', err => {
  console.log('uncaught rejection shutting down');
  console.log(err.name, err.message);
  server.close(() => {
    process.exit(1);
  });
});
