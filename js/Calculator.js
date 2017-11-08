export default class Calculator {
    constructor(team1, team2) {
        team1.events.listen("newPlayer", () => {
            handleNewPlayer(team1, team2);
        });
        team2.events.listen("newPlayer", () => {
            handleNewPlayer(team1, team2);
        });
    }
}

function handleNewPlayer(team1, team2) {
    handleTeamUpdate(team1);
    handleTeamUpdate(team2);
    handleGameUpdate(team1, team2);
}

function handleTeamUpdate(team) {
    const player1Score = team.player1 === undefined ? NaN : team.player1.score;
    const player2Score = team.player2 === undefined ? NaN : team.player2.score;

    team.average = (player1Score + player2Score) / 2;
    team.transform = Math.pow(10, team.average / 400);
}

function handleGameUpdate(team1, team2) {
     team1.expected = team1.transform / (team1.transform + team2.transform);
    team2.expected = team2.transform / (team2.transform + team1.transform);
}