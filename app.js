import express from 'express';
import http from 'http';
import errorHandler from 'errorhandler';
import morgan from 'morgan';
import helmet from 'helmet';
import db from './db/db.js';
import routes from './routes/index.js';

const port = process.env.PORT;

// Configure mongoose's promise to global promise
db.promise = global.Promise;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// Configure isProduction variable
const isProduction = process.env.NODE_ENV === 'production';

// Initiate our app
const app = express();

// Configure our app
app.use(morgan('dev'));
app.use(helmet());

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

if (!isProduction) {
  app.use(errorHandler(true));
}

app.use('/users', routes.users);
app.use('/hosts', routes.hosts);

const server = http.createServer(app);

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
