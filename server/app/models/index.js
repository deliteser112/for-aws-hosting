/* eslint-disable array-callback-return */
const Sequelize = require('sequelize');
const config = require('../config/db.config.js');

const sequelize = new Sequelize(config.DB, config.USER, config.PASSWORD, {
  host: config.HOST,
  dialect: config.dialect,
  operatorsAliases: 0,

  pool: {
    max: config.pool.max,
    min: config.pool.min,
    acquire: config.pool.acquire,
    idle: config.pool.idle
  }
});

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = require('./user.model.js')(sequelize, Sequelize);
db.role = require('./role.model.js')(sequelize, Sequelize);
db.team = require('./team.model.js')(sequelize, Sequelize);
db.office = require('./office.model.js')(sequelize, Sequelize);
db.company = require('./company.model.js')(sequelize, Sequelize);
db.calendar = require('./calendar.model.js')(sequelize, Sequelize);
db.basiclist = require('./basiclist.model.js')(sequelize, Sequelize);
db.customlist = require('./customlist.model.js')(sequelize, Sequelize);
db.workingdays = require('./workingdays.model.js')(sequelize, Sequelize);
db.organizations = require('./organizations.model.js')(sequelize, Sequelize);

// offices relative
db.office.belongsToMany(db.user, {
  through: 'user_offices',
  foreignKey: 'officeId',
  otherKey: 'userId'
});
db.user.belongsToMany(db.office, {
  through: 'user_offices',
  foreignKey: 'userId',
  otherKey: 'officeId'
});

// team relative
db.team.belongsToMany(db.user, {
  through: 'user_teams',
  foreignKey: 'teamId',
  otherKey: 'userId'
});
db.user.belongsToMany(db.team, {
  through: 'user_teams',
  foreignKey: 'userId',
  otherKey: 'teamId'
});

db.ROLES = ['super admin', 'admin', 'leader', 'member'];
db.OFFICES = [
  { emoji: '👨‍👨‍👧', name: 'Human resource', capacity: 5 },
  { emoji: '⚖️', name: 'Tech Support', capacity: 5 },
  { emoji: '📬', name: 'Data Service', capacity: 5 }
];

db.TEAMS = [
  { color: '#00D084', name: 'Web Team', capacity: 3 },
  { color: '#9900EF', name: 'Mobile Team', capacity: 5 },
  { color: '#EB144C', name: 'IoT Team', capacity: 7 },
  { color: '#0693E3', name: 'Device Team', capacity: 2 }
];

db.BASICLIST = [
  {
    emoji: '🏡',
    title: 'From home',
    description: 'Remote (works with Cities feature)',
    isActive: 1
  },
  {
    emoji: '🚶‍♂️',
    title: 'On the go',
    description: 'On the go / Out of the office',
    isActive: 1
  },
  {
    emoji: '🏝',
    title: 'Not working',
    description: 'Holiday / Not working',
    isActive: 1
  },
  {
    emoji: '🤒',
    title: 'Sick',
    description: 'Sick days (merged with "Not working")',
    isActive: 0
  }
];

db.CUSTOMLIST = [
  {
    emoji: '🙂',
    title: 'Custom 1',
    isActive: 1
  }
];

db.WORKINGDAYS = '1,2,3,4,6';

db.ORGANIZATIONS = {
  isEmail: 1,
  isGoogleSignIn: 0,
  startingDay: 0,
  monthRange: 3,
  isCities: 0,
  isHalfDays: 1
};

const obj = {
  icon: '?',
  morning: { id: 0, type: 'undefined' },
  afternoon: { id: 0, type: 'undefined' },
  isHalf: false,
  isWork: false
};

const yData = [];
const MonthDays = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
for (let i = 0; i < 12; i += 1) {
  const mData = [];
  for (let j = 0; j < MonthDays[i]; j += 1) {
    mData.push(obj);
  }
  yData.push(mData);
}

db.SCHEDULES = yData;

module.exports = db;
