/* eslint-disable no-continue */
/* eslint-disable consistent-return */
/* eslint-disable no-await-in-loop */
/* eslint-disable array-callback-return */
const jwt = require('jsonwebtoken');
const multer = require('multer');

const config = require('../config/auth.config');

const JWT_SECRET = config.secret;

const db = require('../models');

const User = db.user;
const { ROLES } = db;

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, '../public/static/uploads');
  },
  filename(req, file, cb) {
    console.log(file);
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});
const upload = multer({ storage }).single('file');

exports.getUserList = (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(400).send([]);
  }

  const accessToken = authorization.split(' ')[1];
  const { userId } = jwt.verify(accessToken, JWT_SECRET);
  User.findOne({
    where: {
      id: userId
    }
  }).then((userData) => {
    const officeIds = [];
    userData.getOffices().then((offices) => {
      for (let i = 0; i < offices.length; i += 1) {
        officeIds.push(`${offices[i].id}`);
      }
      const user = {
        id: userData.id,
        firstname: userData.firstname,
        lastname: userData.lastname,
        email: userData.email,
        photoURL: userData.photoURL,
        roles: ROLES[userData.roleId - 1].toUpperCase(),
        offices: officeIds
      };
      User.findAll().then((datas) => {
        getUserLists(datas).then((users) => {
          const existEmail = user.email.split('@')[1].split('.')[0];
          const isAdmin = user.roles === 'ADMIN';
          const members = [];
          users.map((res) => {
            const reqEmail = res.email.split('@')[1].split('.')[0];
            if (isAdmin) {
              if (existEmail === reqEmail) members.push(res);
            } else if (existEmail === reqEmail) {
              let isDuplicated = false;
              for (let i = 0; i < res.officeIds.length; i += 1) {
                if (isDuplicated) {
                  isDuplicated = false;
                  break;
                }
                for (let j = 0; j < user.offices.length; j += 1) {
                  if (res.officeIds[i] === user.offices[j]) {
                    isDuplicated = true;
                    members.push(res);
                    break;
                  }
                }
              }
            }
          });
          res.status(200).send(members);
        });
      });
    });
  });
};

async function getUserLists(datas) {
  const users = [];
  for (let i = 0; i < datas.length; i += 1) {
    const offices = await datas[i].getOffices();
    const officeIds = [];
    for (let i = 0; i < offices.length; i += 1) {
      officeIds.push(`${offices[i].id}`);
    }
    users.push({
      id: datas[i].id,
      avatarUrl: datas[i].photoURL,
      name: `${datas[i].firstname} ${datas[i].lastname}`,
      email: datas[i].email,
      role: ROLES[datas[i].roleId - 1],
      isLinked: false,
      officeIds
    });
  }
  return users;
}

exports.updateProfile = (req, res) => {
  User.update(
    {
      firstname: req.body.firstname,
      lastname: req.body.lastname,
      photoURL: req.body.photoURL,
      roles: 1
    },
    { where: { email: req.body.email } }
  )
    .then(() => {
      User.findOne({
        where: {
          email: req.body.email
        }
      }).then((userData) => {
        userData.setOffices(req.body.officeId);
        userData.setTeams(req.body.teamId);
        res.status(200).send('success');
      });
    })
    .catch((error) => {
      console.log('error', error);
    });
};

exports.uploadAvatar = (req, res) => {
  upload(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      return res.status(500).json(err);
    }
    if (err) {
      return res.status(500).json(err);
    }
    return res.status(200).send(req.file);
  });
};

exports.getProfile = (req, res) => {
  const { authorization } = req.headers;
  if (!authorization) {
    return res.status(400).send([]);
  }

  const accessToken = authorization.split(' ')[1];
  const { userId } = jwt.verify(accessToken, JWT_SECRET);

  User.findOne({
    where: {
      id: userId
    }
  }).then((userData) => {
    const officeIds = [];
    const teamIds = [];
    userData.getOffices().then((offices) => {
      for (let i = 0; i < offices.length; i += 1) {
        officeIds.push(`${offices[i].id}`);
      }
      userData.getTeams().then((teams) => {
        for (let i = 0; i < teams.length; i += 1) {
          teamIds.push(`${teams[i].id}`);
        }
        const user = {
          id: userData.id,
          firstname: userData.firstname,
          lastname: userData.lastname,
          email: userData.email,
          photoURL: userData.photoURL,
          roles: ROLES[userData.roleId - 1].toUpperCase(),
          offices: officeIds,
          teams: teamIds
        };
        res.status(200).send({ user });
      });
    });
  });
};
