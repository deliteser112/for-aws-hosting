"use strict";

/* eslint-disable no-continue */

/* eslint-disable consistent-return */

/* eslint-disable no-await-in-loop */

/* eslint-disable array-callback-return */
var db = require('../models');

var Company = db.company;
var User = db.user;
var Office = db.office;
var Team = db.team;
var ADMIN = 2;
var ROLES = db.ROLES;

exports.getCompanyList = function (req, res) {
  Company.findAll().then(function _callee(companies) {
    var CompanyList;
    return regeneratorRuntime.async(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            _context.next = 2;
            return regeneratorRuntime.awrap(getCompanies(companies));

          case 2:
            CompanyList = _context.sent;
            res.status(200).send(CompanyList);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    });
  });
};

function getCompanies(companies) {
  var asyncRes;
  return regeneratorRuntime.async(function getCompanies$(_context3) {
    while (1) {
      switch (_context3.prev = _context3.next) {
        case 0:
          _context3.next = 2;
          return regeneratorRuntime.awrap(Promise.all(companies.map(function _callee2(company) {
            var id, name, domain, users, offices, teams, adminInfo, comObj;
            return regeneratorRuntime.async(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    id = company.id, name = company.name, domain = company.domain;
                    _context2.next = 3;
                    return regeneratorRuntime.awrap(User.findAll({
                      where: {
                        companyId: id
                      }
                    }));

                  case 3:
                    users = _context2.sent;
                    _context2.next = 6;
                    return regeneratorRuntime.awrap(Office.findAll({
                      where: {
                        companyId: id
                      }
                    }));

                  case 6:
                    offices = _context2.sent;
                    _context2.next = 9;
                    return regeneratorRuntime.awrap(Team.findAll({
                      where: {
                        companyId: id
                      }
                    }));

                  case 9:
                    teams = _context2.sent;
                    adminInfo = {};
                    users.map(function (user) {
                      if (user.roleId === ADMIN) {
                        adminInfo = user;
                      }
                    });
                    comObj = {
                      id: id,
                      name: name,
                      domain: domain,
                      members: users.length,
                      offices: offices.length,
                      teams: teams.length,
                      adminAvatar: adminInfo.photoURL,
                      adminName: "".concat(adminInfo.firstname, " ").concat(adminInfo.lastname),
                      adminEmail: adminInfo.email,
                      adminPass: adminInfo.unHashedPassword
                    };
                    return _context2.abrupt("return", comObj);

                  case 14:
                  case "end":
                    return _context2.stop();
                }
              }
            });
          })));

        case 2:
          asyncRes = _context3.sent;
          return _context3.abrupt("return", asyncRes);

        case 4:
        case "end":
          return _context3.stop();
      }
    }
  });
}

exports.getUserList = function (req, res) {
  User.findAll().then(function _callee3(users) {
    var pUsers, UserList;
    return regeneratorRuntime.async(function _callee3$(_context4) {
      while (1) {
        switch (_context4.prev = _context4.next) {
          case 0:
            pUsers = [];
            users.map(function (user) {
              if (user.companyId !== 1111) {
                pUsers.push(user);
              }
            });
            _context4.next = 4;
            return regeneratorRuntime.awrap(getUsers(pUsers));

          case 4:
            UserList = _context4.sent;
            console.log(UserList);
            res.status(200).send(UserList);

          case 7:
          case "end":
            return _context4.stop();
        }
      }
    });
  });
};

function getUsers(users) {
  var asyncRes;
  return regeneratorRuntime.async(function getUsers$(_context6) {
    while (1) {
      switch (_context6.prev = _context6.next) {
        case 0:
          _context6.next = 2;
          return regeneratorRuntime.awrap(Promise.all(users.map(function _callee4(user) {
            var id, firstname, lastname, email, unHashedPassword, photoURL, roleId, companyId, offices, officeNames, teams, teamNames, companyInfo, companyName, userObj;
            return regeneratorRuntime.async(function _callee4$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    id = user.id, firstname = user.firstname, lastname = user.lastname, email = user.email, unHashedPassword = user.unHashedPassword, photoURL = user.photoURL, roleId = user.roleId, companyId = user.companyId;
                    _context5.next = 3;
                    return regeneratorRuntime.awrap(user.getOffices());

                  case 3:
                    offices = _context5.sent;
                    officeNames = [];
                    offices.map(function (office) {
                      officeNames.push(office.emoji);
                    });
                    _context5.next = 8;
                    return regeneratorRuntime.awrap(user.getTeams());

                  case 8:
                    teams = _context5.sent;
                    teamNames = [];
                    teams.map(function (team) {
                      teamNames.push({
                        name: team.name,
                        color: team.color
                      });
                    });
                    _context5.next = 13;
                    return regeneratorRuntime.awrap(Company.findOne({
                      where: {
                        id: companyId
                      }
                    }));

                  case 13:
                    companyInfo = _context5.sent;
                    console.log(companyInfo.domain, companyInfo.name, companyInfo.id);
                    companyName = companyInfo.name === null ? companyInfo.domain : companyInfo.name;
                    userObj = {
                      id: id,
                      name: "".concat(firstname, " ").concat(lastname),
                      email: email,
                      password: unHashedPassword,
                      roles: ROLES[roleId - 1],
                      photoURL: photoURL,
                      offices: officeNames,
                      teams: teamNames,
                      companyName: companyName
                    };
                    return _context5.abrupt("return", userObj);

                  case 18:
                  case "end":
                    return _context5.stop();
                }
              }
            });
          })));

        case 2:
          asyncRes = _context6.sent;
          return _context6.abrupt("return", asyncRes);

        case 4:
        case "end":
          return _context6.stop();
      }
    }
  });
}