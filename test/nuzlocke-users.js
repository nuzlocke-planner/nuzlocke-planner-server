process.env.NODE_ENV = 'test';

let utils = require("./utils");
let Mocks = require("./mocks");

let chai = utils.chai;
let should = chai.should();

let server = utils.server;

let NuzlockeUsers = require("../src/models/user.model");
let Nuzlocke = require("../src/models/nuzlocke.model");

let async = require("async");

module.exports = function () {
  describe('Nuzlocke planner users management', () => {
    beforeEach('Delete user data', utils.clearUsersData());
    describe('Sign up', () => {
      it('it should POST the subscription', (done) => {
        chai.request(server)
          .post("/auth/signup")
          .send(Mocks.NEW_MOCK_USER)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.have.property('id');
            NuzlockeUsers.findOne({
              user: Mocks.NEW_MOCK_USER.username
            }, "user nuzlockes", (err, result) => {
              if (err) throw err;
              result.user.should.be.eql(Mocks.NEW_MOCK_USER.username);
              done();
            })
          });
      });

      it('it should not POST the subscription because seome user properties are missing', (done) => {
        chai.request(server)
          .post("/auth/signup")
          .send({
            username: "TestUser"
          })
          .end((err, res) => {
            res.should.have.status(400);
            done();
          });
      });
    });

    describe('Login', () => {
      it('it should POST the login data and get the token back', (done) => {
        chai.request(server)
          .post("/auth/signup")
          .send(Mocks.NEW_MOCK_USER)
          .end((err, res) => {
            res.should.have.status(200);
            chai.request(server)
              .post("/auth/login")
              .send(Mocks.NEW_MOCK_USER)
              .end((err, res) => {
                res.should.have.status(200);
                res.body.should.have.property('token');
                done();
              });
          });
      });

      it('it should not login on invalid password', (done) => {
        chai.request(server)
          .post("/auth/signup")
          .send(Mocks.NEW_MOCK_USER)
          .end((err, res) => {
            res.should.have.status(200);
            chai.request(server)
              .post("/auth/login")
              .send({
                username: Mocks.NEW_MOCK_USER.username,
                password: "invalid"
              })
              .end((err, res) => {
                res.should.have.status(403);
                res.body.name.should.be.eql('InvalidCredentialsError');
                done();
              });
          });
      });
    });

    describe('Delete a user', () => {
      it('it should DELETE the user', (done) => {
        async.waterfall([
          // Signup
          next => chai.request(server)
            .post("/auth/signup")
            .send(Mocks.NEW_MOCK_USER)
            .end((err, res) => {
              res.should.have.status(200);
              next(null);
            })
          ,
          // Add a mock nuzlocke
          next => utils.addNuzlocke(Mocks.NEW_MOCK_USER.username).then((id) => {
              NuzlockeUsers.findOne({ user: Mocks.NEW_MOCK_USER.username }, {}, (err, result) => {
                result.nuzlockes.length.should.be.eql(1);
                next(null, id);
              });
            })
          ,
          // Login
          (nuzlockeId, next) => 
            chai.request(server)
              .post("/auth/login")
              .send(Mocks.NEW_MOCK_USER)
              .end((err, res) => {
                res.should.have.status(200);
                next(null, nuzlockeId, res.body.token);
              })
          ,
          // Delete the account
          (nuzlockeId, token, next) => {
            chai.request(server)
              .delete("/auth/")
              .set('Authorization', 'bearer ' + token)
              .end((err, res) => {
                res.should.have.status(200);
                next(null, nuzlockeId);
              })
          },
          // Check nuzlockes and user have been deleted correctly
          (nuzlockeId) => {
            NuzlockeUsers.findOne({ user: Mocks.NEW_MOCK_USER.username }, {}, (err, result) => {
              if (err) throw err;
              should.not.exist(result);
              Nuzlocke.findById(nuzlockeId, {}, (err, res) => {
                should.not.exist(res);
                done();
              });
            });
          }
        ]);
      });
    });
  });
}