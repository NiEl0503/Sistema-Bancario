const express = require('express');
const routes = require('./rotas');
const app = express();

app.use(express.json());
app.use('/', routes);

app.listen(3000, () => {
  console.log('Servidor rodando na porta 3000');
});