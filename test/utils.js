let async = require('async');

let redis = require('redis');

let Nuzlocke = require('../src/models/nuzlocke.model');
let NuzlockeUser = require('../src/models/user.model');

let Mocks = require("./mocks");

let server = require('../src/app');

let chai = require('chai');
let chaiHttp = require('chai-http');
chai.use(chaiHttp);

usersClient = redis.createClient(process.env.USER_MANAGEMENT_NUZLOCKE_PLANNER_TEST);

function userLogin(auth) {
  return (done) => {
    Nuzlocke.remove({}, () => {
      NuzlockeUser.updateOne({ user: Mocks.NEW_MOCK_USER.username }, { $set: { nuzlockes: [] } }, (err) => {
        if (err) throw err;
        login(auth).then(() => {
          done();
        });
      });
    });
  };
}

function loginWithANuzlocke(auth) {
  return (done) => {
    Nuzlocke.remove({}, () => {
      NuzlockeUser.updateOne({ user: Mocks.NEW_MOCK_USER.username }, { $set: { nuzlockes: [] } }, (err) => {
        if (err) throw err;
        login(auth).then(() =>  {
          addNuzlocke(Mocks.NEW_MOCK_USER.username).then(nuzlockeId => {
            auth.nuzlockeId = nuzlockeId;
            done();
          });
        });
      }); 
    });
  };
}

function clearData() {
  return (done) => {
    async.waterfall([
      callback => usersClient.on('connect', () => callback(null)),
      callback => {
        usersClient.flushdb(err => {
          if (err) throw err;
          callback(null);
        });
      },
      callback => {
        NuzlockeUser.remove({}, err => {
          if (err) throw err;
          callback(null);
        });
      },
      () => {
        async.forEach([Mocks.NEW_MOCK_USER, Mocks.OTHER_MOCK_USER], (user, next) => {
          chai.request(server)
            .post("/auth/signup")
            .send(user)
            .end((err, res) => {
              if (err) throw err;
              res.should.have.status(200);
              next();
            });
          },
          err => {
            if (err) throw err;
            done();
          }
        );
      }
    ]);
  };
}

function addNuzlocke(username, pokedex) {
  let nuzlocke = {
    game: {
      generation: Mocks.MOCK_NUZLOCKE.generation,
      name: Mocks.MOCK_NUZLOCKE.game_name,
      version_group: Mocks.MOCK_NUZLOCKE.version_group,
    },
    gender: Mocks.MOCK_NUZLOCKE.gender,
    trainer_name: Mocks.MOCK_NUZLOCKE.trainer_name,
    pokemon: pokedex || []
  };

  return new Promise(resolve => {
    new Nuzlocke(nuzlocke).save((err, result) => {
      if (err) throw err;
      NuzlockeUser.updateOne({
        user: username
      }, {
        $push: {
          nuzlockes: result.id
        }
      }, (err) => {
        if (err) throw err;
        resolve(result.id);
      });
    });
  });
}

function login(auth) {
  return new Promise(resolve => {
    chai.request(server)
    .post("/auth/login")
    .send({
      username: Mocks.NEW_MOCK_USER.username,
      password: Mocks.NEW_MOCK_USER.password
    })
    .end((err, res) => {
      if (err) throw err;
      res.should.have.status(200);
      auth.token = res.body.token;
      resolve();
    });
  });
}

module.exports = {
  chai,
  userLogin,
  clearData,
  addNuzlocke,
  server,
  loginWithANuzlocke
}