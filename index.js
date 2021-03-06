const express = require('express');
const cors = require('cors');
const app = express();

const { config } = require('./config/index');
const { teams } = require('./routes/teams.js');
const { champions } = require('./routes/champions.js');
const { matches } = require('./routes/matches.js');
const { tournaments } = require('./routes/tournaments.js');
const { stats } = require('./routes/stats');

app.use(cors());
//body parser
app.use(express.json());

teams(app);
champions(app);
matches(app);
tournaments(app);
stats(app);


app.listen(config.port, function () {
  // eslint-disable-next-line no-console
  console.log(`Listening on port : http://localhost:${config.port}`)
});
