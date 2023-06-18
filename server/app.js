import express from 'express';
import importData from './importData.js';

const app = express();

app.use('/', importData);

app.use('/', (req, res) => {
  res.send('basdas');
});

app.listen(3000, () => {
  console.log('server now running on port 3000');
});
