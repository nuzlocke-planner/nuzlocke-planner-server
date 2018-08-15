var UserCtrl = require('../controllers/users.controller');
var Nuzlocke = require('../models/nuzlocke.model');
var log = require("../utils").log;
var async = require("async");
var NuzlockeError = require('../lib/NuzlockePlannerError');

var NuzlockeCtrl = {
  get: (req, res) => {
    Nuzlocke.findById(req.params.id, (err, nuzlocke) => {
      if (err) 
        res.status(500).send(err);
      else {
        res.send(nuzlocke);
      }
    });
  },
  list: (userInfo, req, res) => {
    UserCtrl.get(userInfo.user.username, (err, result) => {
      if (err) {
        res.sendStatus(500);
      } else if (result) {
        Nuzlocke.find({ _id: { $in: result.nuzlockes } }, (err, nuzlockes) => {
          if (err)
            res.send(err);
          else
            res.send(nuzlockes);
        });
      } else {
        res.send(new NuzlockeError("Cannot find user on database"));
      }
    });
  },
  add: (userInfo, req, res) => {
    async.waterfall([
      // Add a nuzlocke
      (next) => {
        let nuzlocke = new Nuzlocke({
          game: {
            generation: req.body.generation,
            name: req.body.game_name,
            version_group: req.body.version_group,
          },
          gender: req.body.gender,
          trainer_name: req.body.trainer_name
        });
        nuzlocke.save((err, newNuzlocke) => {
          if (err) {
            if (err.name === "ValidationError")
            res.status(400).json({error: err.name, message: err.message});
          } else {
            next(null, newNuzlocke);
          }
        });
      },
      // Link the nuzlocke to the auth user
      (nuzlocke, next) => {
        UserCtrl.add_nuzlocke(userInfo.user.username, nuzlocke.id, (err) => {
          if(err) {
            res.send(new NuzlockeError("Error adding the nuzlocke to user: " + userInfo.user.username));
          } else {
            next(null, nuzlocke);
          }
        });
      },
      // Attach the updated user to the response
      (nuzlocke) => {
        UserCtrl.get(userInfo.user.username, (err, user) => {
          if(err) {
            res.send(new NuzlockeError("Cannot find user on database"));
          } else {
            log("Nuzlocke successfully added by " + userInfo.user.username);
            res.json({
              status: 200,
              message: "Nuzlocke " + nuzlocke.id + " successfully added.",
              nuzlocke,
              user
            });
          }
        });
      }
    ]);
  },
  delete: (userInfo, req, res) => {
    Nuzlocke.findByIdAndRemove(req.params.id, (err, nuzlocke) => {
      if(err) {
        res.send(err);
      } else {
        UserCtrl.delete_nuzlocke(userInfo.user.username, req.params.id, (err) => {
          if(err) {
            res.send(err);
          } else {
            log("Nuzlocke " + req.params.id + " deleted successfully by " + userInfo.user.username);
            res.json({
              status: 200,
              message: "Deleted successfully",
              nuzlocke
            });
          }
        });
      }
    });
  },
  add_pokemon: (userInfo, req, res) => {   
    async.waterfall([
      // Find the requested nuzlocke
      (next) => {
        Nuzlocke.findById(req.params.id, (err, nuzlocke) => {
          if(err) {
            res.status(400).send(err);
          } else if (nuzlocke) {
            next(null, nuzlocke);
          } else {
            log(userInfo.user.username + " is trying to add a new pokemon to an unexistent nuzlocke");
            res.status(400).send(new NuzlockeError("Nuzlocke with id " + req.params.id + " cannot be found"));
          }
        });
      },
      // Check if the new pokemon is valid
      (nuzlocke, next) => {
        if (nuzlocke.pokemon.some(pkm => pkm.found_at === req.body.found_at)) {
          res.status(400).send(new NuzlockeError("You have already caught a pokemon at location " + req.body.found_at));
          log(userInfo.user.username + " has tried to add a new pokemon " + req.body.dex_number + " to nuzlocke " + req.params.id + " with invalid location");
        } else {
          next(null, {
            dex_number: req.body.dex_number,
            found_at: req.body.found_at,
            nickname: req.body.nickname
          });
        }
      },
      // Update the nuzlocke
      pokemon => {
        Nuzlocke.update({ _id: req.params.id }, { $push: { pokemon: pokemon }}, { runValidators: true },  (err) => {
          if(err)
            if (err.name === "ValidationError")
              res.status(400).json({error: err.name, message: err.message});
            else
              res.status(400).send(err);
          else {
            sendBackNuzlocke(req, res);
            log(userInfo.user.username + " added a new pokemon " + req.body.dex_number + " to nuzlocke " + req.params.id);
          }
        });
      }
    ]); 
  },
  delete_pokemon: (userInfo, req, res) => {
    pullPokemonOfTeam(req.params.id, req.params.pkmId)
      .then(() => {
        Nuzlocke.update({ _id: req.params.id }, { $pull: { pokemon: { _id: req.params.pkmId }}}, (err) => {
          if(err) 
            res.status(500).send(err);
          else {
            sendBackNuzlocke(req, res);
            log(userInfo.user.username + " has deleted the pokemon " + req.params.pkmId + " from nuzlocke " + req.params.id);
          }
        });
      })
      .catch((status, msg) => res.status(status).send(msg));
  },

  defeat_pokemon: (userInfo, req, res) => {
    pullPokemonOfTeam(req.params.id, req.params.pkmId)
      .then(() => {
        Nuzlocke.update({ _id: req.params.id, "pokemon._id": req.params.pkmId }, { $set: { "pokemon.$.is_defeated": true }}, (err) => {
          if(err) 
            res.status(500).send(err);
          else {
            sendBackNuzlocke(req, res);
            log(userInfo.user.username + " set the pokemon " + req.params.pkmId + " from nuzlocke " + req.params.id + " as defeated.");
          }
        });
      })
      .catch((status, msg) => res.status(status).send(msg))
  },
  update_team: (userInfo, req, res) => {
    async.waterfall([
      // Get the nuzlocke
      next => {
        Nuzlocke.findById(req.params.id, (err, nuzlocke) => {
          if (err) 
            res.status(500).send(err);
          else {
           next(null, nuzlocke);
          }
        });
      },
      // Check if the posted team is valid
      (nuzlocke, next) => {
        if(isTeamValid(nuzlocke.pokemon, req.body.team)) {
          next(null);
        } else {
          res.status(400).send(new NuzlockeError("Invalid team"));
        }
      },
      // update the nuzlocke
      () => {
        Nuzlocke.update({ _id: req.params.id }, { $set: { team: req.body.team }}, { runValidators: true },  (err) => {
          if(err)
            if (err.name === "ValidationError")
              res.status(400).json({error: err.name, message: err.message});
            else
              res.status(500).send(err);
          else {
            sendBackNuzlocke(req, res);
            log(userInfo.user.username + " has modified the team of " + req.params.id + " nuzlocke");
          }
        });
      }
    ]);
  }
};

function isTeamValid(pokedex, team) {
  let pkdx = pokedex.slice(0);
  let t = team.slice(0);

  for(let i = 0; i < t.length; i++) {
    if(t[i]) {
      if(t[i].is_defeated)
        return false;
      let elem = pkdx.filter(pkm => t[i].dex_number === pkm.dex_number && t[i].found_at === pkm.found_at && t[i].nickname === pkm.nickname)[0];
      if(elem) {
        pkdx.splice(pkdx.indexOf(elem), 1);
      } else {
        return false;
      }
    }
  }

  return true;
}

function pullPokemonOfTeam(nuzlockeId, pokedexId, pokemon) {
  return new Promise((resolve, reject) => {
    async.waterfall([
      // Get the pokemon
      next => {
        Nuzlocke.findOne({ _id: nuzlockeId }).select({ pokemon: {$elemMatch: { _id: pokedexId }}}).exec((err, result) => {
          if (err) {
            reject(500, err);
          } else if(!result) {
            reject(400, new NuzlockeError("Pokemon not found"));
          } else {
            next(null, result.pokemon[0]);
          }
        });
      },
      // Look for pokemon in team
      (pokemon, next) => {
        Nuzlocke.findOne({ _id: nuzlockeId }, "team", (err, nuzlocke) => {
          if (err) throw err;
          let nuzPokemon = nuzlocke.team.filter(slot => slot.found_at === pokemon.found_at)[0];
          if (nuzPokemon) 
            next(null, nuzPokemon);
          else
            resolve();
        });
      },
      // Pull pokemon from team
      (pokemon) => {
        Nuzlocke.update({ _id: nuzlockeId }, { $pull: { team: { _id: pokemon._id }}}, err => {
          if(err) reject(500, err);
          else resolve()
        });
      }
    ]);
  });
}

function sendBackNuzlocke(req, res) {
  Nuzlocke.findOne({ _id: req.params.id }, (err, nuzlocke) => {
    if (err) throw err;
    res.send(nuzlocke);
  });
}

module.exports = NuzlockeCtrl;