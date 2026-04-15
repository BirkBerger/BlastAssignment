import { GameData, Player, Round, TeamNames } from "@/types/log.types";
import SteamID from 'steamid';

enum MATCH_PROPERTY {
    ctTeam = 'ctTeam',
    terroristTeam = 'terroristTeam',
    roundStart = 'roundStart',
    roundEnd = 'roundEnd',
    roundScore = 'roundScore',
    assist = 'assist',
    kill = 'kill',
    blindness = 'blindness',
    purchase = 'purchase',
    attack = 'attack',
    threw = 'threw',
    killed_other = 'killed_other'
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
    blindness:      /"(?<name>[^<]+)<\d+><(?<id>[^>]+)><(?<side>[^>]*)>" blinded for (?<duration>[\d.]+)/,
    purchase:       /"(?<name>[^<]+)<\d+><(?<id>[^>]+)><(?<side>[^>]*)>" money change \d+-(?<moneySpend>\d+) = \$\d+/,
    attack:         /"(?<name>[^<]+)<\d+><(?<id>[^>]+)><(?<side>[^>]*)>" \[[^\]]+\] attacked "(?<victimName>.+)<\d+><(?<victimId>[^>]+)><[^>]+>" \[[^\]]+\] with "(?<weapon>[^"]+)" \(damage "(?<damage>\d+)"\).*\(hitgroup "(?<hitGroup>[^"]+)"\)/,
    threw:          /"(?<name>[^<]+)<\d+><(?<id>[^>]+)><(?<side>[^>]+)>" threw (?<grenade>\w+)/,
    killed_other:   /"(?<name>[^<]+)<\d+><(?<id>[^>]+)><(?<side>[^>]*)>" \[[^\]]+\] killed other/
}

export class LogParser {

    private teamNames: TeamNames = ["", ""];
    private rounds: Round[] = [];
    private playerMap: { [id: string ]: Player } = {};
    private matches: Matches = Object.values(MATCH_PROPERTY).reduce((acc, key) => {
        acc[key] = null;
        return acc;
    }, {} as Matches)

    constructor(raw: string) {
        const lines = raw.split('\n');
        let prevRoundsPlayed = -1;
        
        for (const line of lines) {

            this.matchLines(line);
            
            if (this.matches.roundScore) {
                const roundsPlayed = parseInt(this.matches.roundScore[3]);

                if (roundsPlayed === 0) this.setTeamNames();

                if (roundsPlayed === 0 && prevRoundsPlayed >= 0) {
                    this.rounds = [];
                    this.playerMap = {};
                }
                
                if (roundsPlayed >= 0) {
                    this.updatePlayers();
                    this.matches.roundEnd = line.match(REGEXES.roundEnd);
                    this.updateRounds();
                }
                prevRoundsPlayed = roundsPlayed;
            }
        }
    }

    public getData(): GameData {
        return {
            teamNames: this.teamNames,
            rounds: this.rounds,
            players: Object.values(this.playerMap)
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
            this.matches.killed_other = line.match(REGEXES.killed_other);
        } else if (line.includes("assisted")) {
            this.matches.assist = line.match(REGEXES.assist);
        } else if (line.includes("blinded")) {
            this.matches.blindness = line.match(REGEXES.blindness);
        } else if (line.includes("money")) {
            this.matches.purchase = line.match(REGEXES.purchase)
        } else if (line.includes("attacked")) {
            this.matches.attack = line.match(REGEXES.attack);
        } else if (line.includes("threw")) {
            this.matches.threw = line.match(REGEXES.threw);
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
                const killer = this.getPlayer(matchGroup.id, matchGroup.name, matchGroup.side);
                if (killer) killer.kills += 1;
                const victim = this.getPlayer(matchGroup.victimId, matchGroup.victimName, matchGroup.victimSide);
                if (victim) victim.deaths += 1;
            }
            this.matches.kill = null;
        } else if (this.matches.assist) {
            const matchGroup = this.matches.assist?.groups;
            if (matchGroup) {
                const player = this.getPlayer(matchGroup.id, matchGroup.name, matchGroup.side);
                if (player) player.assists += 1;
            }
            this.matches.assist = null;
        } else if (this.matches.blindness) {
            const matchGroup = this.matches.blindness?.groups;
            if (matchGroup) {
                const player = this.getPlayer(matchGroup.id, matchGroup.name, matchGroup.side);
                if (player) player.blindness += parseFloat(matchGroup.duration);
            }
            this.matches.blindness = null;
        } else if (this.matches.purchase) {
            const matchGroup = this.matches.purchase?.groups;
            if (matchGroup) {
                const player = this.getPlayer(matchGroup.id, matchGroup.name, matchGroup.side);
                if (player) player.moneySpend += parseInt(matchGroup.moneySpend);
            }
            this.matches.purchase = null;
        } else if (this.matches.attack) {
            const matchGroup = this.matches.attack?.groups;
            if (matchGroup) {
                const attacker = this.getPlayer(matchGroup.id, matchGroup.name, matchGroup.side);
                if (attacker) {
                    const weapon = matchGroup.weapon;
                    if (weapon != "inferno") {
                    const currentHitgroupShots = attacker.hitgroupShots[matchGroup.hitGroup] || 0;
                    attacker.hitgroupShots[matchGroup.hitGroup] = currentHitgroupShots + 1
                        const currentWeaponShots = attacker.weaponShots[weapon] || 0;
                        attacker.weaponShots[matchGroup.weapon] = currentWeaponShots + 1;
                    }
                }
            }
            this.matches.attack = null;
        } else if (this.matches.threw) {
            const matchGroup = this.matches.threw?.groups;
            if (matchGroup) {
                const player = this.getPlayer(matchGroup.id, matchGroup.name, matchGroup.side);
                if (player) {
                    const currentGrenadesThrown = player.grenadesThrown[matchGroup.grenade] || 0;
                    player.grenadesThrown[matchGroup.grenade] = currentGrenadesThrown + 1;
                }
            }
            this.matches.threw = null;
        } else if (this.matches.killed_other) {
            const matchGroup = this.matches.killed_other?.groups;
            if (matchGroup) {
                const player = this.getPlayer(matchGroup.id, matchGroup.name, matchGroup.side);
                if (player) player.mapDamage += 1;
            }
            this.matches.killed_other = null;
        }
    }

    private getPlayer(id: string, name: string, side: string): Player | null {
        if (this.playerMap[id]) return this.playerMap[id];

        // Filter out any players not on team CT and TERRORIST (e.g. Spectators)
        const teamName = side == "CT" ? this.matches.ctTeam?.[1] : side == "TERRORIST" ? this.matches.terroristTeam?.[1] : null;
        if (!teamName) return null;

        return this.playerMap[id] = {
            id: this.getFullSteamId(id),
            name,
            teamIndex: this.teamNames.indexOf(teamName),
            kills: 0,
            deaths: 0,
            assists: 0,
            blindness: 0,
            weaponShots: {},
            grenadesThrown: {},
            moneySpend: 0,
            hitgroupShots: {},
            mapDamage: 0
        }
    }

    private getFullSteamId(id: string): string {
        const sid = new SteamID(id);
        return sid.getSteamID64();
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
        const currentRoundSpend = Object.values(this.playerMap).reduce((acc, player) => {
            (player.teamIndex == 0) ? acc[0] += player.moneySpend : acc[1] += player.moneySpend;
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