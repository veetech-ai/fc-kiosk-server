const models = require("../../models/index");
const Game = models.Game;

async function createGame(reqBody) {
  const game = await Game.create({
    ...reqBody,
  });

  return game;
}

module.exports = {
  createGame,
};
