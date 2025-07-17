const express = require('express');
const app = express();
const port = 80;

app.get('/', (req, res) => {
  res.send('Ajenye gemo');
});

app.listen(port, () => {
  console.log(`App running on port ${port}`);
});
