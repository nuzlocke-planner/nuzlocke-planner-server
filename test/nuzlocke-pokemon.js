process.env.NODE_ENV = 'test';

let utils = require("./utils");
let Mocks = require("./mocks");

let chai = utils.chai;
let should = chai.should();

let server = utils.server;

let async = require('async');

module.exports = function () {
  describe('Nuzlocke planner pokemon management', () => {
    var auth = {};
    beforeEach('Login user and delete the user nuzlockes', utils.loginWithANuzlocke(auth));

    // describe('Add a pokemon to existent nuzlocke', () => {
    //   it('it should POST a new pokemon', (done) => {
    //     chai.request(server)
    //     .post("/nuzlocke/" + auth.nuzlockeId + "/pokedex")
    //     .set('Authorization', 'bearer ' + auth.token)
    //     .send({ dex_number: 1, found_at: 2, nickname: "Flower"})
    //     .end((err, res) => {
    //       res.should.have.status(200);
    //       res.body.should.be.a('object');
    //       res.body.pokemon.length.should.be.eql(1);
    //       res.body.pokemon[0].nickname.should.be.eql("Flower");
    //       res.body.pokemon[0].found_at.should.be.eql(2);
    //       done();
    //     });
    //   });

    //   it('it should not POST a new pokemon because location is missing', (done) => {
    //   chai.request(server)
    //     .post("/nuzlocke/" + auth.nuzlockeId + "/pokedex")
    //     .set('Authorization', 'bearer ' + auth.token)
    //     .send({ dex_number: 1, nickname: "Flower"})
    //     .end((err, res) => {
    //       res.should.have.status(400);
    //       res.body.error.should.be.eql("ValidationError");
    //       done();
    //     });
    //   });

    //   it('it should not POST two new pokemon at same location', (done) => {
    //     chai.request(server)
    //     .post("/nuzlocke/" + auth.nuzlockeId + "/pokedex")
    //     .set('Authorization', 'bearer ' + auth.token)
    //     .send({ dex_number: 1, found_at: 2, nickname: "Flower"})
    //     .end((err, res) => {
    //       res.should.have.status(200);

    //       chai.request(server)
    //       .post("/nuzlocke/" + auth.nuzlockeId + "/pokedex")
    //       .set('Authorization', 'bearer ' + auth.token)
    //       .send({ dex_number: 5, found_at: 2, nickname: "Mountain"})
    //       .end((err, res) => {
    //         res.body.message.should.include("at location 2");
    //         done();
    //       });
    //     });
    //   });
    // });

    // describe('Delete a caught pokemon from a nuzlocke', () => {
    //   it('it should DELETE the pokemon', (done) => {
    //     utils.addNuzlocke(Mocks.NEW_MOCK_USER.username, [{ dex_number: 1, found_at: 2, nickname: "Flower"}]).then((id) => {
    //       chai.request(server)
    //         .get("/nuzlocke/" + id)
    //         .set('Authorization', 'bearer ' + auth.token)
    //         .end((err, res) => {
    //           res.should.have.status(200);
    //           let pokemonId = res.body.pokemon[0]._id;
    //           chai.request(server)
    //           .delete("/nuzlocke/" + id + "/pokedex/" + pokemonId)
    //           .set('Authorization', 'bearer ' + auth.token)
    //           .end((err, res) => {
    //             res.should.have.status(200);
    //             res.body.should.be.a("object");
    //             res.body.pokemon.length.should.be.eql(0);
    //             done();
    //           });
    //         });
    //     });
    //   });
    // });

    // describe('Update the team of a nuzlocke', () => {
    //   it('it should POST the new pokemon team', (done) => {
    //     utils.addNuzlocke(Mocks.NEW_MOCK_USER.username, [
    //       { dex_number: 1, found_at: 2, nickname: "Flower"},
    //       { dex_number: 4, found_at: 3, nickname: "Flame"}
    //     ]).then((id) => {
    //       chai.request(server)
    //         .post("/nuzlocke/" + id + "/team/")
    //         .set('Authorization', 'bearer ' + auth.token)
    //         .send({ team : [
    //           { dex_number: 1, found_at: 2, nickname: "Flower"},
    //           { dex_number: 4, found_at: 3, nickname: "Flame"}
    //         ]})
    //         .end((err, res) => {
    //           res.should.have.status(200);
    //           let pokemonId = res.body.pokemon[0]._id;
    //           chai.request(server)
    //           .delete("/nuzlocke/" + id + "/pokedex/" + pokemonId)
    //           .set('Authorization', 'bearer ' + auth.token)
    //           .end((err, res) => {
    //             res.should.have.status(200);
    //             res.body.should.be.a("object");
    //             res.body.team.length.should.be.eql(2);
    //             res.body.team.map(pkm => pkm.nickname).should.be.eql(['Flower', 'Flame']);
    //             done();
    //           });
    //         });
    //     });
    //   });

      

      // it('it should not POST the new pokemon team because the user do not own the pokemon', (done) => {
      //   utils.addNuzlocke(Mocks.NEW_MOCK_USER.username, [
      //     { dex_number: 1, found_at: 2, nickname: "Flower"},
      //     { dex_number: 4, found_at: 3, nickname: "Flame"}
      //   ]).then((id) => {
      //     chai.request(server)
      //       .post("/nuzlocke/" + id + "/team/")
      //       .set('Authorization', 'bearer ' + auth.token)
      //       .send({ team : [
      //         { dex_number: 3, found_at: 2, nickname: "Flower"},
      //         { dex_number: 4, found_at: 3, nickname: "Flame"}
      //       ]})
      //       .end((err, res) => {
      //         res.should.have.status(400);
      //         done();
      //       });
      //   });
      // });
    // });
    describe("Mark a pokemon as defeated", () => {
      it('it should UPDATE a pokemon to defeated', (done) => {
        utils.addNuzlocke(Mocks.NEW_MOCK_USER.username, [
          { dex_number: 1, found_at: 2, nickname: "Flower"},
          { dex_number: 4, found_at: 3, nickname: "Flame"}
        ]).then((id) => {
          chai.request(server)
            .get("/nuzlocke/" + id)
            .set('Authorization', 'bearer ' + auth.token)
            .end((err, res) => {
              res.should.have.status(200);
              res.body.pokemon[0].is_defeated.should.be.eql(false);
              let pokeId =  res.body.pokemon[0]._id;
              chai.request(server)
                .post("/nuzlocke/" + id + "/pokedex/" + pokeId + "/defeated")
                .set('Authorization', 'bearer ' + auth.token)
                .end((err, res) => {
                  if (err) throw err;
                  res.should.have.status(200);
                  res.body.pokemon.should.be.a('array');
                  res.body.pokemon[0].is_defeated.should.be.eql(true);
                  done();
                });
            });
        });
      });

      it('it should UPDATE a pokemon to defeated and pull it from team', (done) => {
        async.waterfall([
          // setup test
          next => {
            utils.addNuzlocke(Mocks.NEW_MOCK_USER.username, [
              { dex_number: 1, found_at: 2, nickname: "Flower"},
              { dex_number: 4, found_at: 3, nickname: "Flame"}
            ]).then((id) => {
              chai.request(server)
                .post("/nuzlocke/" + id + "/team/")
                .set('Authorization', 'bearer ' + auth.token)
                .send({ team : [
                  { dex_number: 1, found_at: 2, nickname: "Flower"},
                ]})
                .end((err, res) => {
                  res.should.have.status(200);
                  next(null, id);
                });
              });
            },
            // Get the nuzlocke
            (id, next) => {
              chai.request(server)
                .get("/nuzlocke/" + id)
                .set('Authorization', 'bearer ' + auth.token)
                .end((err, res) => {
                  res.should.have.status(200);
                  res.body.pokemon[0].is_defeated.should.be.eql(false);
                  res.body.team.length.should.be.eql(1);
                  next(null, id, res.body.pokemon[0]._id);
                });
            },
            // Set pokemon as defeat
            (id, pkmId) => {
              chai.request(server)
                .post("/nuzlocke/" + id + "/pokedex/" + pkmId + "/defeated")
                .set('Authorization', 'bearer ' + auth.token)
                .end((err, res) => {
                  if (err) throw err;
                  res.should.have.status(200);
                  res.body.pokemon.should.be.a('array');
                  res.body.pokemon[0].is_defeated.should.be.eql(true);
                  res.body.team.length.should.be.eql(0);
                  done();
                });
            }
        ]);
      });
    });
  });
}