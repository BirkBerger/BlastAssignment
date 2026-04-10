import { ParsedLog, Player, Players, Round, TeamNames } from "@/types/log.types";

const enum MATCH_PROPERTY {
    ctTeam = 'ctTeam',
    terroristTeam = 'terroristTeam',
    roundStart = 'roundStart',
    roundEnd = 'roundEnd',
    roundScore = 'roundScore',
    assist = 'assist',
    kill = 'kill',
    blindness = 'blindness',
}

type Matches = { [property in MATCH_PROPERTY]: RegExpMatchArray | null };

const REGEXES: { [ property in MATCH_PROPERTY ]: RegExp } = {
    roundStart:     /(\d{2}:\d{2}:\d{2}): World triggered "Round_Start"/,
    roundEnd:       /(\d{2}:\d{2}:\d{2}): World triggered "Round_End"/,
    roundScore:     /MatchStatus: Score: (\d+):(\d+) on map "[^"]+" RoundsPlayed: (\d+)/,
    ctTeam:         /MatchStatus: Team playing "CT": (.+)/,
    terroristTeam:  /MatchStatus: Team playing "TERRORIST": (.+)/,
    kill:           /"(?<name>[^<]+)<\d+><(?<id>[^>]+)><(?<side>[^>]*)>" \[[^\]]+\] killed "(?<victimName>[^<]+)<\d+><(?<victimId>[^>]+)><[^>]*>" \[[^\]]+\] with "(?<weapon>[^"]+)"/,
    assist:         /"(?<name>[^<]+)<\d+><(?<id>[^>]+)><(?<side>[^>]*)>" (?:flash-)?assisted killing "(?<victimName>[^<]+)<\d+><(?<victimId>[^>]+)><[^>]*>"/,
    blindness:      /"(?<name>[^<]+)<\d+><(?<id>[^>]+)><[^>]*>" blinded for (?<duration>[\d.]+)/,
}

export class LogParser {

    private teamNames: TeamNames = ["", ""];
    private rounds: Round[] = [];
    private players: Players = {};
    private matches: Matches = {
        ctTeam: null,
        terroristTeam: null,
        roundStart: null,
        roundEnd: null,
        roundScore: null,
        kill: null,
        assist: null,
        blindness: null
    }

    constructor(raw: string) {
        const lines = raw.split('\n');
        
        for (const line of lines) {

            this.matchLines(line);
            
            if (this.matches.roundScore) {
                const roundsPlayed = parseInt(this.matches.roundScore[3]);
                
                // Extract the team names from the first round, recording the intial team sides
                if (roundsPlayed == 0) this.setTeamNames();
                if (roundsPlayed >= 0) {
                    this.updatePlayers();
                    this.matches.roundEnd = line.match(REGEXES.roundEnd);
                    this.updateRounds();
                }
            }
        }
    }

    public getData(): ParsedLog {
        return {
            teamNames: this.teamNames,
            rounds: this.rounds,
            players: this.players
        }
    }

    private matchLines(line: string) {
        if (line.includes("MatchStatus")) {
            this.matches.ctTeam = line.match(REGEXES.ctTeam) || this.matches.ctTeam;
            this.matches.terroristTeam = line.match(REGEXES.terroristTeam) || this.matches.terroristTeam;
            this.matches.roundScore = line.match(REGEXES.roundScore) || this.matches.roundScore;
        } else if (line.includes("World triggered")) {
            this.matches.roundStart = line.match(REGEXES.roundStart) || this.matches.roundStart;
        } else if (line.includes("killed")) {
            this.matches.kill = line.match(REGEXES.kill);
        } else if (line.includes("assisted")) {
            this.matches.assist = line.match(REGEXES.assist);
        } else if (line.includes("blinded")) {
            this.matches.blindness = line.match(REGEXES.blindness);
        }
    }
    
    
    private setTeamNames() {
        if (!this.matches.ctTeam || !this.matches.terroristTeam) return;
        this.teamNames = [this.matches.ctTeam[1], this.matches.terroristTeam[1]];
    }
    
    private updatePlayers() {
        if (this.matches.kill) {
            const matchResult = this.createPlayer(this.matches.kill);
            if (matchResult) this.players[matchResult.id].kills += 1;
            this.matches.kill = null;
        } else if (this.matches.assist) {
            const matchResult = this.createPlayer(this.matches.assist);
            if (matchResult) this.players[matchResult.id].assists += 1;
            this.matches.assist = null;
        } else if (this.matches.blindness) {
            const matchResult = this.createPlayer(this.matches.blindness);
            if (matchResult) this.players[matchResult.id].blindness += parseFloat(matchResult.duration);
            this.matches.blindness = null;
        }
    }
    
    private createPlayer(match: RegExpMatchArray): { [key: string]: string } | null {
        const matchResult = match?.groups;
        if (!matchResult) return null;
        if (!this.players[matchResult.id]) {
            const teamName = this.matches.ctTeam?.[1] == matchResult.side ? this.teamNames[0] : this.teamNames[1];
            this.players[matchResult.id] = new Player(matchResult.name, teamName);
        }
        return matchResult;
    }
    
    private updateRounds() {
        if (!this.matches.roundEnd || !this.matches.roundStart || !this.matches.roundScore || !this.teamNames) return;
    
        const startTime = this.matches.roundStart[1].split(":");
        const endTime = this.matches.roundEnd[1].split(":")
        const score1 = parseInt(this.matches.roundScore[1]);
        const score2 = parseInt(this.matches.roundScore[2]);
        const hasTeamSidesChanged = this.matches.ctTeam && this.matches.ctTeam[1] == this.teamNames[1];
        this.rounds.push ({
            duration: this.timeDiff(startTime, endTime),
            status: {
                teamSides: hasTeamSidesChanged ? [1, 0] : [0, 1],
                score: hasTeamSidesChanged ? [score2, score1] : [score1, score2]
            }
        })
    }
    
    private timeDiff(startTime: string[], endTime: string[]): number {
        const startSecs = parseInt(startTime[0]) * 3600 + parseInt(startTime[1]) * 60 + parseInt(startTime[2]);
        const endSecs = parseInt(endTime[0]) * 3600 + parseInt(endTime[1]) * 60 + parseInt(endTime[2]);
        return endSecs - startSecs;
    }
    
}