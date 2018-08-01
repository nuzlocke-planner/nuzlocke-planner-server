const log = require("../utils").log;
const NuzlockeCtrl = require("../controllers/nuzlocke.controller");
const UsersCtrl = require("../controllers/users.controller");
const users = require("../db-connections/users-db");

function verifyUser(req, res) {
  return new Promise(resolve => {
    users.verifyToken(req.token,
      (sessionInfo) => resolve(sessionInfo),
      (err) => {
        log("FORBIDDEN: Auth Error"); 
        res.status(403).send(err);
      }
    );
  });
}

function same_user(req, res, callback) {
  verifyUser(req, res).then((sessionInfo) => {
    UsersCtrl.has_nuzlocke(sessionInfo.user.username, req.params.id, (heHas) => {
      if (heHas) {
        callback(sessionInfo);
      } else {
        res.status(403).json({ message: "Forbbiden: you do not own nuzlocke " + req.params.id});
      }
    });
  });
}

function nuzlocke_router(app) {
  app.get('/nuzlocke/', users.getToken, (req, res) => {
    verifyUser(req, res).then((sessionInfo) => NuzlockeCtrl.list(sessionInfo, req, res));
  });

  app.get('/nuzlocke/:id', users.getToken, (req, res) => {
    same_user(req, res, () => NuzlockeCtrl.get(req, res));
  });

  app.post('/nuzlocke/', users.getToken, (req, res) => {
    verifyUser(req, res).then((sessionInfo) => NuzlockeCtrl.add(sessionInfo, req, res));
  });

  app.delete('/nuzlocke/:id', users.getToken, (req, res) => {
    same_user(req, res, info => NuzlockeCtrl.delete(info, req, res));
  });

  app.post('/nuzlocke/:id/pokedex', users.getToken, (req, res) => {
    same_user(req, res, info => NuzlockeCtrl.add_pokemon(info, req, res));
  });

  app.delete('/nuzlocke/:id/pokedex/:pkmId', users.getToken, (req, res) => {
    same_user(req, res, info => NuzlockeCtrl.delete_pokemon(info, req, res));
  });

  app.post('/nuzlocke/:id/team', users.getToken, (req, res) => {
    same_user(req, res, info => NuzlockeCtrl.update_team(info, req, res));
  });
}

exports.nuzlocke_router = nuzlocke_router;