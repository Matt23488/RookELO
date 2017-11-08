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
    handleGameUpdate(team2, team1);
}

function handleTeamUpdate(team) {
    const player1Score = team.player1 === undefined ? NaN : team.player1.score;
    const player2Score = team.player2 === undefined ? NaN : team.player2.score;

    team.average = (player1Score + player2Score) / 2;
    team.transform = Math.pow(10, team.average / 400);
}

function handleGameUpdate(team, otherTeam) {
    const player1Score = team.player1 === undefined ? NaN : team.player1.score;
    const player2Score = team.player2 === undefined ? NaN : team.player2.score;

    team.expected = team.transform / (team.transform + otherTeam.transform);
    team.ifWon = team.average + 32 * (1 - team.expected);
    team.ifLoss = team.average + 32 * (0 - team.expected);
    team.player1ScoreIfWon = Math.ceil((Math.abs(team.average - player1Score) * (1 - team.expected)) + player1Score + 32);
    team.player2ScoreIfWon = Math.ceil((Math.abs(team.average - player2Score) * (1 - team.expected)) + player2Score + 32);
    team.player1ScoreIncrease = team.player1ScoreIfWon - player1Score;
    team.player2ScoreIncrease = team.player2ScoreIfWon - player2Score;
    team.player1ScoreIfLoss = Math.floor(player1Score - (Math.abs(team.average - player1Score) * (team.expected)) - 32);
    team.player2ScoreIfLoss = Math.floor(player2Score - (Math.abs(team.average - player2Score) * (team.expected)) - 32);
    team.player1ScoreDecrease = team.player1ScoreIfLoss - player1Score;
    team.player2ScoreDecrease = team.player2ScoreIfLoss - player2Score;
}