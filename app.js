const express = require("express");
const app = express();

const { open } = require("sqlite");
const path = require("path");
const sqlite3 = require("sqlite3");

const dbPath = path.join(__dirname, "cricketMatchDetails.db");
let database = null;

const initializeDBandServer = async () => {
  try {
    database = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000");
    });
  } catch (error) {
    console.log(`DB Error ${error.message}`);
    process.exit(1);
  }
};

initializeDBandServer();

const convertDBResponse = (dataObject) => {
  return {
    playerId: dataObject.player_id,
    playerName: dataObject.player_name,
  };
};

app.get("/players/", async (request, response) => {
  const listPlayers = `
        SELECT *
        FROM player_details`;
  const playersList = await database.all(listPlayers);
  response.send(playersList.map((eachPlayer) => convertDBResponse(eachPlayer)));
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playersQuery = `
        SELECT *
        FROM player_details
        WHERE player_id = ${playerId};`;
  const player = await database.get(playersQuery);
  response.send(convertDBResponse(player));
});

app.put("/players/:playerId/", async (request, response) => {
  const { playerName } = request.body;
  const { playerId } = request.params;
  const updatePlayerName = `
        UPDATE player_details
        SET player_name = '${playerName}'
        WHERE player_id = ${playerId};`;
  await database.run(updatePlayerName);
  response.send("Player Details Updated");
});

module.exports = app;
