import { GameData, Player, Players, Round, TeamNames } from "@/types/log.types";

const enum MATCH_PROPERTY {
    ctTeam = 'ctTeam',
    terroristTeam = 'terroristTeam',
    roundStart = 'roundStart',
    roundEnd = 'roundEnd',
    roundScore = 'roundScore',
    assist = 'assist',
    kill = 'kill',
    blindness = 'blindness',
    purchase = 'purchase'
}

type Matches = { [property in MATCH_PROPERTY]: RegExpMatchArray | null };

const REGEXES: { [ property in MATCH_PROPERTY ]: RegExp } = {
    roundStart:     /(\d{2}:\d{2}:\d{2}): World triggered "Round_Start"/,
    roundEnd:       /(\d{2}:\d{2}:\d{2}): World triggered "Round_End"/,
    roundScore:     /MatchStatus: Score: (\d+):(\d+) on map "[^"]+" RoundsPlayed: (\d+)/,
    ctTeam:         /MatchStatus: Team playing "CT": (.+)/,
    terroristTeam:  /MatchStatus: Team playing "TERRORIST": (.+)/,
    kill:           /"(?<name>[^<]+)<\d+><(?<id>[^>]+)><(?<side>[^>]*)>" \[[^\]]+\] killed "(?<victimName>[^<]+)<\d+><(?<victimId>[^>]+)><(?<victimSide>[^>]*)>" \[[^\]]+\] with "(?<weapon>[^"]+)"/,
    assist:         /"(?<name>[^<]+)<\d+><(?<id>[^>]+)><(?<side>[^>]*)>" (?:flash-)?assisted killing "(?<victimName>[^<]+)<\d+><(?<victimId>[^>]+)><[^>]*>"/,
    blindness:      /"(?<name>[^<]+)<\d+><(?<id>STEAM[^>]+)><[^>]*>" blinded for (?<duration>[\d.]+)/,
    purchase:       /"(?<name>[^<]+)<\d+><(?<id>[^>]+)><(?<side>[^>]*)>" money change \d+-(?<moneySpend>\d+) = \$\d+/
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
        blindness: null,
        purchase: null
    }

    constructor(raw: string) {
        const lines = raw.split('\n');
        
        for (const line of lines) {

            this.matchLines(line);
            
            if (this.matches.roundScore) {
                const roundsPlayed = parseInt(this.matches.roundScore[3]);
                
                if (roundsPlayed == 0) this.setTeamNames();
                if (roundsPlayed >= 0) {
                    this.updatePlayers();
                    this.matches.roundEnd = line.match(REGEXES.roundEnd);
                    this.updateRounds();
                }
            }
        }
    }

    public getData(): GameData {
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
        } else if (line.includes("money")) {
            this.matches.purchase = line.match(REGEXES.purchase)
        }
    }
    
    
    private setTeamNames() {
        if (!this.matches.ctTeam || !this.matches.terroristTeam) return;
        this.teamNames = [this.matches.ctTeam[1], this.matches.terroristTeam[1]];
    }
    
    private updatePlayers() {
        if (this.matches.kill) {
            const matchGroup = this.matches.kill?.groups;
            if (matchGroup) {
                const killerTeam = this.getTeamName(matchGroup.side);
                const victimTeam = this.getTeamName(matchGroup.victimSide)
                if (killerTeam && victimTeam) {
                    this.createPlayer(matchGroup.id, matchGroup.name, killerTeam);
                    this.players[matchGroup.id].kills += 1;
                    this.createPlayer(matchGroup.victimId, matchGroup.victimName, victimTeam);
                    this.players[matchGroup.victimId].deaths += 1;
                }
            }
            this.matches.kill = null;
        } else if (this.matches.assist) {
            const matchGroup = this.matches.assist?.groups;
            if (matchGroup) {
                const team = this.getTeamName(matchGroup.side);
                if (team) {
                    this.createPlayer(matchGroup.id, matchGroup.name, team);
                    this.players[matchGroup.id].assists += 1;
                }
            }
            this.matches.assist = null;
        } else if (this.matches.blindness) {
            const matchGroup = this.matches.blindness?.groups;
            if (matchGroup) {
                const team = this.getTeamName(matchGroup.side);
                if (team) {
                    this.createPlayer(matchGroup.id, matchGroup.name, team);
                    this.players[matchGroup.id].blindness += parseFloat(matchGroup.duration);
                }
            }
            this.matches.blindness = null;
        } else if (this.matches.purchase) {
            const matchGroup = this.matches.purchase?.groups;
            if (matchGroup) {
                const team = this.getTeamName(matchGroup.side);
                if (team) {
                    this.createPlayer(matchGroup.id, matchGroup.name, team);
                    this.players[matchGroup.id].moneySpend += parseInt(matchGroup.moneySpend);
                }
            }
            this.matches.purchase = null;
        }
    }

    private getTeamName(side: string): string | undefined {
        // Filter out any players not on team CT and TERRORIST (e.g. Spectators)
        return side == "CT" ? this.matches.ctTeam?.[1] : side == "TERRORIST" ? this.matches.terroristTeam?.[1] : undefined;
    }
    
    private createPlayer(id: string, name: string, teamName: string) {
        if (this.players[id]) return;

        this.players[id] = {
            name,
            teamName,
            kills: 0,
            deaths: 0,
            assists: 0,
            blindness: 0,
            weaponUse: {},
            moneySpend: 0,
            hitGroupDamage: {}
        }
    }
    
    private updateRounds() {
        if (!this.matches.roundEnd || !this.matches.roundStart || !this.matches.roundScore || !this.teamNames) return;
    
        const startTime = this.matches.roundStart[1].split(":");
        const endTime = this.matches.roundEnd[1].split(":")
        const score1 = parseInt(this.matches.roundScore[1]);
        const score2 = parseInt(this.matches.roundScore[2]);
        const hasTeamSidesChanged = this.matches.ctTeam && this.matches.ctTeam[1] == this.teamNames[1];
        const newRound = {
            duration: this.getTimeDiff(startTime, endTime),
            status: {
                moneySpend: this.getTeamMoneySpend(),
                teamSides: (hasTeamSidesChanged ? [1, 0] : [0, 1]) as [number, number],
                score: (hasTeamSidesChanged ? [score2, score1] : [score1, score2]) as [number, number],
            }
        }
        this.rounds.push(newRound)
    }

    private getTeamMoneySpend(): [number, number] {
        const currentRoundSpend = Object.values(this.players).reduce((acc, player) => {
            (player.teamName == this.teamNames[0]) ? acc[0] += player.moneySpend : acc[1] += player.moneySpend;
            return acc;
        }, [0, 0]);
        const prevRoundSpend = this.rounds.length > 1 ? this.rounds[this.rounds.length - 1].status.moneySpend : [0, 0];
        return [currentRoundSpend[0] - prevRoundSpend[0], currentRoundSpend[1] - prevRoundSpend[1]];
    }
    
    private getTimeDiff(startTime: string[], endTime: string[]): number {
        const startSecs = parseInt(startTime[0]) * 3600 + parseInt(startTime[1]) * 60 + parseInt(startTime[2]);
        const endSecs = parseInt(endTime[0]) * 3600 + parseInt(endTime[1]) * 60 + parseInt(endTime[2]);
        return endSecs - startSecs;
    }

}