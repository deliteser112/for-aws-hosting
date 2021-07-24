const controller = require('../controllers/team.controller');

module.exports = (app) => {
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Headers',
      'x-access-token, Origin, Content-Type, Accept'
    );
    next();
  });

  // --------------------- Team Getting List section --------------------------------------------------------------

  app.get('/api/team/teams', controller.getTeamList);

  // --------------------- Team CRUD section --------------------------------------------------------------
  app.post('/api/team/addTeam', controller.addTeam);
  app.post('/api/team/deleteTeam', controller.deleteTeam);
  app.post('/api/team/updateTeamList', controller.updateTeamList);
  // -----------------------------------------------------------------------------------
};
