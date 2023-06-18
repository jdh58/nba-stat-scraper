import express from 'express';
import importData from './importData.js';
import mongoose from 'mongoose';

// Configure .env variables
import 'dotenv/config.js';

// eslint-disable-next-line no-undef
const mongoDB = process.env.MONGOURI;
mongoose.connect(mongoDB).catch((err) => {
  console.error('Could not connect to the database' + err);
});

const app = express();

app.use('/', importData);

app.use('/', (req, res) => {
  res.send('basdas');
});

app.listen(3000, () => {
  console.log('server now running on port 3000');
});
