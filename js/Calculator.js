let instance;
let calledViaGetInstace = false;

export default class Calculator {
    constructor(team1, team2) {
        if (!calledViaGetInstace) throw new Error("You must use the static getInstance() method to get a reference to this class.");

        function _handlePlayerChanged() {
            handlePlayerChanged(team1, team2);
        }

        team1.events.listen("playerChanged", _handlePlayerChanged);
        team2.events.listen("playerChanged", _handlePlayerChanged);
    }

    static getInstance(team1, team2) {
        calledViaGetInstace = true;
        if (!instance) instance = new Calculator(team1, team2);
        calledViaGetInstace = false;

        return instance;
    }
}

function handlePlayerChanged(team1, team2) {
    handleTeamCalculations(team1);
    handleTeamCalculations(team2);
    handleGameCalculations(team1, team2);
    handleGameCalculations(team2, team1);
}

function handleTeamCalculations(team) {
    const player1Score = team.player1.hasPlayer() ? team.player1.score : NaN;
    const player2Score = team.player2.hasPlayer() ? team.player2.score : NaN;

    team.average = (player1Score + player2Score) / 2;
    team.transform = Math.pow(10, team.average / 400);
}

function handleGameCalculations(team, otherTeam) {
    const player1Score = team.player1.hasPlayer() ? team.player1.score : NaN;
    const player2Score = team.player2.hasPlayer() ? team.player2.score : NaN;

    team.expected = team.transform / (team.transform + otherTeam.transform);
    team.ifWon = team.average + 32 * (1 - team.expected);
    team.ifLoss = team.average + 32 * (0 - team.expected);
    team.player1.scoreIfWon = Math.ceil((Math.abs(team.average - player1Score) * (1 - team.expected)) + player1Score + 32);
    team.player1.scoreIfWon = Math.ceil((Math.abs(team.average - player1Score) * (1 - team.expected)) + player1Score + 32);
    team.player2.scoreIfWon = Math.ceil((Math.abs(team.average - player2Score) * (1 - team.expected)) + player2Score + 32);
    team.player1.scoreIncrease = team.player1.scoreIfWon - player1Score;
    team.player2.scoreIncrease = team.player2.scoreIfWon - player2Score;
    team.player1.scoreIfLoss = Math.floor(player1Score - (Math.abs(team.average - player1Score) * (team.expected)) - 32);
    team.player2.scoreIfLoss = Math.floor(player2Score - (Math.abs(team.average - player2Score) * (team.expected)) - 32);
    team.player1.scoreDecrease = team.player1.scoreIfLoss - player1Score;
    team.player2.scoreDecrease = team.player2.scoreIfLoss - player2Score;
}