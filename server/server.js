const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();

const corsOptions = {
  origin: 'http://localhost:3000'
};

app.use(cors(corsOptions));

// parse requests of content-type - application/json
app.use(bodyParser.json());

// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// database
const db = require('./app/models');

// const { sequelize } = db;

const Role = db.role;
const User = db.user;

const { ROLES } = db;

// eslint-disable-next-line no-unused-vars
function initial() {
  // user roles initialize ...
  ROLES.forEach((role, index) => {
    Role.create({
      id: index + 1,
      name: role
    });
  });

  // admin setting
  User.create({
    id: 1,
    firstname: 'Mo',
    lastname: 'Riss',
    email: 'superadmin@thimble.com',
    roleId: 1,
    companyId: 1111,
    password: bcrypt.hashSync('superadmin', 8),
    unHashedPassword: 'superadmin'
  });
}

// db.sequelize.sync().then(() => {
//   initial();
// });

// force: true will drop the table if it already exists

// db.sequelize.sync({ force: true }).then(() => {
//   console.log('Drop and Resync Database with { force: true }');
//   initial();
// });

// simple route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to thimble application.' });
});

// routes
require('./app/routes/auth.routes')(app);
require('./app/routes/user.routes')(app);
require('./app/routes/office.routes')(app);
require('./app/routes/team.routes')(app);
require('./app/routes/organization.routes')(app);
require('./app/routes/general.routes')(app);
require('./app/routes/superadmin.routes')(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
