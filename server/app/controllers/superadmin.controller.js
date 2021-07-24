/* eslint-disable no-continue */
/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable array-callback-return */
const db = require('../models');

const Company = db.company;
const User = db.user;
const Office = db.office;
const Team = db.team;

const ADMIN = 2;

const { ROLES } = db;

exports.getCompanyList = (req, res) => {
  Company.findAll().then(async (companies) => {
    const CompanyList = await getCompanies(companies);
    res.status(200).send(CompanyList);
  });
};

async function getCompanies(companies) {
  const asyncRes = await Promise.all(
    companies.map(async (company) => {
      const { id, name, domain } = company;
      const users = await User.findAll({ where: { companyId: id } });
      const offices = await Office.findAll({ where: { companyId: id } });
      const teams = await Team.findAll({ where: { companyId: id } });
      let adminInfo = {};
      users.map((user) => {
        if (user.roleId === ADMIN) {
          adminInfo = user;
        }
      });
      const comObj = {
        id,
        name,
        domain,
        members: users.length,
        offices: offices.length,
        teams: teams.length,
        adminAvatar: adminInfo.photoURL,
        adminName: `${adminInfo.firstname} ${adminInfo.lastname}`,
        adminEmail: adminInfo.email,
        adminPass: adminInfo.unHashedPassword
      };

      return comObj;
    })
  );
  return asyncRes;
}

exports.getUserList = (req, res) => {
  User.findAll().then(async (users) => {
    const pUsers = [];
    users.map((user) => {
      if (user.companyId !== 1111) {
        pUsers.push(user);
      }
    });
    const UserList = await getUsers(pUsers);
    console.log(UserList);
    res.status(200).send(UserList);
  });
};

async function getUsers(users) {
  const asyncRes = await Promise.all(
    users.map(async (user) => {
      const {
        id,
        firstname,
        lastname,
        email,
        unHashedPassword,
        photoURL,
        roleId,
        companyId
      } = user;
      const offices = await user.getOffices();
      const officeNames = [];
      offices.map((office) => {
        officeNames.push(office.emoji);
      });

      const teams = await user.getTeams();
      const teamNames = [];
      teams.map((team) => {
        teamNames.push({ name: team.name, color: team.color });
      });
      const companyInfo = await Company.findOne({ where: { id: companyId } });
      console.log(companyInfo.domain, companyInfo.name, companyInfo.id);
      const companyName =
        companyInfo.name === null ? companyInfo.domain : companyInfo.name;
      const userObj = {
        id,
        name: `${firstname} ${lastname}`,
        email,
        password: unHashedPassword,
        roles: ROLES[roleId - 1],
        photoURL,
        offices: officeNames,
        teams: teamNames,
        companyName
      };
      return userObj;
    })
  );
  return asyncRes;
}
