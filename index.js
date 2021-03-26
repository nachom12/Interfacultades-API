const express = require('express');
const app = express();

const { config } = require('./config/index');
const { interfacultadesAPI } = require('./routes/interfacultades.js');

interfacultadesAPI(app);

app.listen(config.port, function(){
  console.log(`Listening on port : http://localhost:${config.port}`)
});
