"use strict";

/* eslint-disable array-callback-return */

/* eslint-disable consistent-return */

/* eslint-disable import/order */
var db = require('../models');

var config = require('../config/auth.config');

var sequelize = db.sequelize;
var User = db.user;
var Office = db.office;
var Team = db.team;
var Company = db.company;
var Calendar = db.calendar;
var BasicList = db.basiclist;
var Customlist = db.customlist;
var WorkingDays = db.workingdays;
var Organizations = db.organizations;
var ROLES = db.ROLES,
    OFFICES = db.OFFICES,
    TEAMS = db.TEAMS,
    BASICLIST = db.BASICLIST,
    CUSTOMLIST = db.CUSTOMLIST,
    WORKINGDAYS = db.WORKINGDAYS,
    ORGANIZATIONS = db.ORGANIZATIONS,
    SCHEDULES = db.SCHEDULES;

var jwt = require('jsonwebtoken');

var bcrypt = require('bcryptjs');

var JWT_SECRET = config.secret;
var JWT_EXPIRES_IN = 86400;
var ADMIN = 2;
var MEMBER = 4;

exports.signup = function (req, res) {
  // Save User to Database
  User.create({
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    email: req.body.email,
    photoURL: '/static/uploads/1.jpg',
    password: bcrypt.hashSync(req.body.password, 8),
    unHashedPassword: req.body.password
  }).then(function (userData) {
    var emailCount = 0;
    var role = ADMIN;
    User.findAll().then(function _callee3(users) {
      var reqEmail, company;
      return regeneratorRuntime.async(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              reqEmail = req.body.email.split('@')[1].split('.')[0];
              company = req.body.email.split('@')[1];
              users.map(function (user) {
                var existEmail = user.email.split('@')[1].split('.')[0];

                if (reqEmail === existEmail) {
                  emailCount += 1;
                }
              });

              if (emailCount > 1) {
                role = MEMBER;
                Company.findOne({
                  where: {
                    domain: company
                  }
                }).then(function _callee(company) {
                  var _ref, accessToken, user;

                  return regeneratorRuntime.async(function _callee$(_context) {
                    while (1) {
                      switch (_context.prev = _context.next) {
                        case 0:
                          _context.next = 2;
                          return regeneratorRuntime.awrap(generateUser(userData, role, company.id, false));

                        case 2:
                          _ref = _context.sent;
                          accessToken = _ref.accessToken;
                          user = _ref.user;
                          _context.next = 7;
                          return regeneratorRuntime.awrap(User.update({
                            companyId: company.id
                          }, {
                            where: {
                              email: userData.email
                            }
                          }));

                        case 7:
                          res.status(200).send({
                            accessToken: accessToken,
                            user: user
                          });

                        case 8:
                        case "end":
                          return _context.stop();
                      }
                    }
                  });
                });
              } else {
                Company.create({
                  domain: company
                }).then(function _callee2(company) {
                  var _ref2, accessToken, user;

                  return regeneratorRuntime.async(function _callee2$(_context2) {
                    while (1) {
                      switch (_context2.prev = _context2.next) {
                        case 0:
                          _context2.next = 2;
                          return regeneratorRuntime.awrap(generateUser(userData, role, company.id, true));

                        case 2:
                          _ref2 = _context2.sent;
                          accessToken = _ref2.accessToken;
                          user = _ref2.user;
                          _context2.next = 7;
                          return regeneratorRuntime.awrap(User.update({
                            companyId: company.id
                          }, {
                            where: {
                              email: userData.email
                            }
                          }));

                        case 7:
                          res.status(200).send({
                            accessToken: accessToken,
                            user: user
                          });

                        case 8:
                        case "end":
                          return _context2.stop();
                      }
                    }
                  });
                });
              }

            case 4:
            case "end":
              return _context3.stop();
          }
        }
      });
    });
  })["catch"](function (err) {
    res.status(500).send({
      message: err.message
    });
  });
};

exports.signin = function (req, res) {
  User.findOne({
    where: {
      email: req.body.email
    }
  }).then(function (userData) {
    if (!userData) {
      return res.status(400).send({
        message: 'auth/user-not-found'
      });
    }

    var passwordIsValid = bcrypt.compareSync(req.body.password, userData.password);

    if (!passwordIsValid) {
      return res.status(400).send({
        accessToken: null,
        message: 'auth/wrong-password'
      });
    }

    var token = jwt.sign({
      userId: userData.id,
      companyId: userData.companyId
    }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN // 24 hours 86400

    });
    var officeIds = [];
    var teamIds = [];
    userData.getOffices().then(function (offices) {
      for (var i = 0; i < offices.length; i += 1) {
        officeIds.push("".concat(offices[i].id));
      }

      userData.getTeams().then(function (teams) {
        for (var _i = 0; _i < teams.length; _i += 1) {
          teamIds.push("".concat(teams[_i].id));
        }

        var user = {
          id: userData.id,
          firstname: userData.firstname,
          lastname: userData.lastname,
          email: userData.email,
          photoURL: userData.photoURL,
          roles: ROLES[userData.roleId - 1].toUpperCase(),
          offices: officeIds,
          teams: teamIds,
          companyId: userData.comapnyId
        };
        var accessToken = token;
        res.status(200).send({
          accessToken: accessToken,
          user: user
        });
      });
    });
  })["catch"](function (err) {
    res.status(500).send({
      message: err.message
    });
  });
};

function generateUser(userData, role, cId, isNew) {
  var accessToken, entries, officeId, user, sql, res;
  return regeneratorRuntime.async(function generateUser$(_context4) {
    while (1) {
      switch (_context4.prev = _context4.next) {
        case 0:
          if (!isNew) {
            _context4.next = 3;
            break;
          }

          _context4.next = 3;
          return regeneratorRuntime.awrap(initial(cId, userData.id));

        case 3:
          Calendar.create({
            schedule: JSON.stringify(SCHEDULES),
            userId: userData.id,
            companyId: cId
          });
          accessToken = jwt.sign({
            userId: userData.id,
            companyId: cId
          }, JWT_SECRET, {
            expiresIn: JWT_EXPIRES_IN
          });
          _context4.next = 7;
          return regeneratorRuntime.awrap(Office.findAll({
            limit: 1,
            order: [['createdAt', 'DESC']],
            where: {
              companyId: cId,
              isActive: 1
            }
          }));

        case 7:
          entries = _context4.sent;
          officeId = '';
          entries.map(function (office) {
            officeId = office.id;
          });
          user = {
            id: userData.id,
            firstname: userData.firstname,
            lastname: userData.lastname,
            email: userData.email,
            photoURL: userData.photoURL,
            roles: ROLES[role - 1].toUpperCase(),
            offices: [officeId],
            teams: [],
            companyId: cId
          };
          console.log('This is User:', user);
          sql = "\n    UPDATE users\n    SET roleId = ".concat(role, "\n    WHERE id = ").concat(userData.id, ";\n  ");
          sequelize.query(sql, {
            type: sequelize.QueryTypes.UPDATE
          }); // set user office

          userData.setOffices([officeId]).then(function () {
            var sql = "\n      UPDATE user_offices\n      SET isManager = 0\n      WHERE userId = ".concat(userData.id, " and officeId = ").concat(officeId, ";\n    ");
            sequelize.query(sql, {
              type: sequelize.QueryTypes.UPDATE
            });
          });
          res = {};
          res.accessToken = accessToken;
          res.user = user;
          return _context4.abrupt("return", res);

        case 19:
        case "end":
          return _context4.stop();
      }
    }
  });
}

function initial(cId) {
  return regeneratorRuntime.async(function initial$(_context5) {
    while (1) {
      switch (_context5.prev = _context5.next) {
        case 0:
          // user office initialize ...
          OFFICES.forEach(function (office) {
            Office.create({
              emoji: office.emoji,
              name: office.name,
              capacity: office.capacity,
              companyId: cId
            });
          });
          TEAMS.forEach(function (team) {
            Team.create({
              color: team.color,
              name: team.name,
              capacity: team.capacity,
              companyId: cId
            });
          });
          BASICLIST.forEach(function (basic) {
            BasicList.create({
              emoji: basic.emoji,
              title: basic.title,
              description: basic.description,
              isActive: basic.isActive,
              companyId: cId
            });
          });
          CUSTOMLIST.forEach(function (custom) {
            Customlist.create({
              emoji: custom.emoji,
              title: custom.title,
              isActive: custom.isActive,
              companyId: cId
            });
          });
          WorkingDays.create({
            isWorking: WORKINGDAYS,
            companyId: cId
          });
          Organizations.create({
            isEmail: ORGANIZATIONS.isEmail,
            isGoogleSignIn: ORGANIZATIONS.isGoogleSignIn,
            startingDay: ORGANIZATIONS.startingDay,
            monthRange: ORGANIZATIONS.monthRange,
            isCities: ORGANIZATIONS.isCities,
            isHalfDays: ORGANIZATIONS.isHalfDays,
            companyId: cId
          });

        case 6:
        case "end":
          return _context5.stop();
      }
    }
  });
}