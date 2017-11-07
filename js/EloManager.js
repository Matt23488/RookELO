import PlayerList from "./components/PlayerList.js";
import Team from "./components/Team.js";

export default class EloManager {
    constructor() {
        
        // TODO: Import from JSON
        const players = [
            { id: 1, name: "Adam", score: 920 },
            { id: 2, name: "Burns", score: 1040 },
            { id: 3, name: "Jon", score: 1072 },
            { id: 4, name: "Matt", score: 968 },
            { id: 5, name: "Durga", score: 1000 },
            { id: 6, name: "Joey", score: 1000 },
            { id: 7, name: "John", score: 984 },
        ];

        function handleDrop(playerId, container) {
            container.appendChild()
        }
        
        const playerList = PlayerList.initialize(players);

        function handleAddPlayer1(team, playerId) {
            const matchedPlayer = playerList.find(playerId);
            team.player1 = matchedPlayer;
        }

        function handleAddPlayer2(team, playerId) {
            const matchedPlayer = playerList.find(playerId);
            team.player2 = matchedPlayer;
        }
        
        function handleRemovePlayer(playerId) {
            playerList.reclaim(playerId);
        }

        const team1 = new Team("team1");
        team1.events.listen("addPlayer1", playerId => handleAddPlayer1(team1, playerId));
        team1.events.listen("addPlayer2", playerId => handleAddPlayer2(team1, playerId));
        team1.events.listen("removePlayer1", handleRemovePlayer);
        team1.events.listen("removePlayer2", handleRemovePlayer);

        const team2 = new Team("team2");
        team2.events.listen("addPlayer1", playerId => handleAddPlayer1(team2, playerId));
        team2.events.listen("addPlayer2", playerId => handleAddPlayer2(team2, playerId));
        team2.events.listen("removePlayer1", handleRemovePlayer);
        team2.events.listen("removePlayer2", handleRemovePlayer);
    }
}