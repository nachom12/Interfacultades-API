const express = require('express');
const cors = require('cors');
const app = express();

const { config } = require('./config/index');
const { teams } = require('./routes/teams.js');
const { champions } = require('./routes/champions.js')

app.use(cors());
//body parser
app.use(express.json());

teams(app);
champions(app);

app.listen(config.port, function () {
  console.log(`Listening on port : http://localhost:${config.port}`)
});
