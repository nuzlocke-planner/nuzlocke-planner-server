process.env.NODE_ENV = 'test';

let utils = require("./utils");
let Mocks = require("./mocks");

let chai = utils.chai;
let should = chai.should();

let server = utils.server;

module.exports = function () {
  describe('Nuzlocke planner basics', () => {
    
    var auth = {};
    beforeEach('Login user and delete the user nuzlockes', utils.userLogin(auth));

    describe('List nuzlockes', () => {
      it('it should GET all the nuzlockes', (done) => {
        chai.request(server)
          .get("/nuzlocke/")
          .set('Authorization', 'bearer ' + auth.token)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('array');
            res.body.length.should.be.eql(0);
            done();
          });
      });

      it('should return 403 error because of invalid token when listing nuzlockes', (done) => {
        chai.request(server)
          .get("/nuzlocke/")
          .set('Authorization', 'bearer ' + 'invalid token')
          .end((err, res) => {
            res.should.have.status(403);
            done();
          });
      });
    });

    describe('List nuzlockes', () => {
      it('it should GET the existent nuzlocke', (done) => {
        utils.addNuzlocke(Mocks.NEW_MOCK_USER.username).then((nuzlockeId) => {
          chai.request(server)
          .get("/nuzlocke/" + nuzlockeId)
          .set('Authorization', 'bearer ' + auth.token)
          .end((err, res) => {
            res.should.have.status(200);
            res.body.should.be.a('object');
            res.body.should.have.property('game');
            res.body.should.have.property('trainer_name');
            res.body.game.name.should.be.eql('crystal');
            res.body.pokemon.should.be.a('array');
            res.body.team.should.be.a('array');
            done();
          });
        });
        
      });

      it('should return 403 error because a user who has not created the nuzlocke is trying to get it', (done) => {
        utils.addNuzlocke(Mocks.OTHER_MOCK_USER.username).then((nuzlockeId) => {
          chai.request(server)
          .get("/nuzlocke/" + nuzlockeId)
          .set('Authorization', 'bearer ' + auth.token)
          .end((err, res) => {
            res.should.have.status(403);
            res.body.should.be.a('object');
            done();
          });
        });
      });
    });


    describe('Add a new nuzlocke', () => {
      it('it should POST a new nuzlocke', (done) => {

        chai.request(server)
          .post("/nuzlocke/")
          .set('Authorization', 'bearer ' + auth.token)
          .send(Mocks.MOCK_NUZLOCKE)
          .end((err, res) => {
            if (err) throw err;
            res.should.have.status(200);
            res.body.nuzlocke.should.have.property('game');
            res.body.nuzlocke.game.name.should.be.eql('crystal');
            res.body.nuzlocke.pokemon.should.be.a('array');
            res.body.nuzlocke.team.should.be.a('array');
            res.body.nuzlocke.team.length.should.be.eql(0);
            res.body.nuzlocke.pokemon.length.should.be.eql(0);
            res.body.nuzlocke._id.should.be.eql(res.body.user.nuzlockes[0]);
            done();
          });
      });

      it('it should not POST a new nuzlocke because of missing properties', (done) => {
        let nuzlocke = {
          generation: "generation-ii",
          version_group: "crystal",
          gender: "female",
          trainer_name: "guillem-kami"
        };
        chai.request(server)
          .post("/nuzlocke/")
          .set('Authorization', 'bearer ' + auth.token)
          .send(nuzlocke)
          .end((err, res) => {
            if (err) throw err;
            res.should.have.status(400);
            res.body.should.be.a('object');
            res.body.error.should.be.eql("ValidationError");
            done();
          });
      });
    });

    describe('Delete a nuzlocke', () => {
      it('should delete an existent nuzlocke', (done) => {
        utils.addNuzlocke(Mocks.NEW_MOCK_USER.username).then((id) => {
          chai.request(server)
            .delete("/nuzlocke/" + id)
            .set('Authorization', 'bearer ' + auth.token)
            .end((err, res) => {
              res.should.have.status(200);
              done();
            });
        });
      });

      it('should not delete an existent nuzlocke because other user has add it', (done) => {
        utils.addNuzlocke(Mocks.OTHER_MOCK_USER.username).then((id) => {
          chai.request(server)
            .delete("/nuzlocke/" + id)
            .set('Authorization', 'bearer ' + auth.token)
            .end((err, res) => {
              res.should.have.status(403);
              done();
            });
        });
      });
    });
  });
}