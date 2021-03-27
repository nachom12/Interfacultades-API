const express = require('express');
const app = express();

const { config } = require('./config/index');
const { teams } = require('./routes/teams.js');

teams(app);

app.listen(config.port, function(){
  console.log(`Listening on port : http://localhost:${config.port}`)
});
