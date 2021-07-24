/* eslint-disable no-continue */
/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable array-callback-return */
const jwt = require('jsonwebtoken');
const db = require('../models');

const Team = db.team;
const config = require('../config/auth.config');

const JWT_SECRET = config.secret;

exports.getTeamList = (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(400).send([]);
  }

  const accessToken = authorization.split(' ')[1];
  const { companyId } = jwt.verify(accessToken, JWT_SECRET);
  Team.findAll({
    where: { companyId, isActive: 1 }
  }).then((teams) => {
    const teamList = [];
    teams.map((team) => {
      teamList.push({
        id: team.id,
        color: team.color,
        name: team.name,
        capacity: team.capacity
      });
    });
    console.log(teamList);
    res.status(200).send(teamList);
  });
};

exports.addTeam = (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(400).send([]);
  }

  const accessToken = authorization.split(' ')[1];
  const { companyId } = jwt.verify(accessToken, JWT_SECRET);

  Team.create({
    color: '#9900EF',
    name: 'New Team',
    capacity: 5,
    companyId
  }).then((teamList) => {
    const data = {
      id: teamList.id
    };
    res.status(200).send(data);
  });
};

exports.deleteTeam = (req, res) => {
  const { teamId } = req.body;
  Team.update(
    { isActive: 0 },
    {
      where: {
        id: teamId
      }
    }
  );
  res.status(200).send({ message: 'Deleted successfully!' });
};

exports.updateTeamList = (req, res) => {
  const teamList = req.body;
  teamList.map((team) => {
    const updateValues = {
      color: team.color,
      name: team.name,
      capacity: Number(team.capacity)
    };
    Team.update(updateValues, { where: { id: team.id } });
  });
  res.status(200).send('success');
};
