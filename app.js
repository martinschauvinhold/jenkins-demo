const express = require('express');
const _ = require('lodash');

const app = express();
const port = process.env.PORT || 3000;

// Ruta vulnerable de demo (usa lodash de forma innecesaria)
app.get('/', (req, res) => {
  const message = _.join(['Hola', 'desde', 'la', 'app', 'demo'], ' ');
  res.send(`<h1>${message}</h1><p>Pipeline DevSecOps funcionando 🚀</p>`);
});

app.listen(port, () => {
  console.log(`App demo escuchando en http://localhost:${port}`);
});

