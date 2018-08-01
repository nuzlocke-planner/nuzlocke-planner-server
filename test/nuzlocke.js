process.env.NODE_ENV = 'test';

let utils = require("./utils");

let NuzlockeBasics = require("./nuzlocke-basics");
let NuzlockePokemon = require("./nuzlocke-pokemon");
let NuzlockeUsers = require("./nuzlocke-users");

describe('Nuzlocke Planner', () => {
  before('Delete all users data', utils.clearData());

  // NuzlockeBasics();
  // NuzlockePokemon();
  NuzlockeUsers();
});