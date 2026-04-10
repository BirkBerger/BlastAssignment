import fs from 'fs';
import path from 'path';
import { ParsedLog, Player, Players, Round, TeamNames } from '@/types/log.types';

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

const regexes: { [ property in MATCH_PROPERTY ]: RegExp } = {
    roundStart:     /(\d{2}:\d{2}:\d{2}): World triggered "Round_Start"/,
    roundEnd:       /(\d{2}:\d{2}:\d{2}): World triggered "Round_End"/,
    roundScore:     /MatchStatus: Score: (\d+):(\d+) on map "[^"]+" RoundsPlayed: (\d+)/,
    ctTeam:         /MatchStatus: Team playing "CT": (.+)/,
    terroristTeam:  /MatchStatus: Team playing "TERRORIST": (.+)/,
    kill:           /"(?<name>[^<]+)<\d+><(?<id>[^>]+)><(?<side>[^>]*)>" \[[^\]]+\] killed "(?<victimName>[^<]+)<\d+><(?<victimId>[^>]+)><[^>]*>" \[[^\]]+\] with "(?<weapon>[^"]+)"/,
    assist:         /"(?<name>[^<]+)<\d+><(?<id>[^>]+)><(?<side>[^>]*)>" (?:flash-)?assisted killing "(?<victimName>[^<]+)<\d+><(?<victimId>[^>]+)><[^>]*>"/,
    blindness:      /"(?<name>[^<]+)<\d+><(?<id>[^>]+)><[^>]*>" blinded for (?<duration>[\d.]+)/,
}

function parseLog(raw: string): ParsedLog {
    const lines = raw.split('\n');

    let teamNames: TeamNames = ["", ""];
    const rounds = new Array<Round>();
    const players: { [id: string]: Player } = {};

    const matches: Matches = {
        ctTeam: null,
        terroristTeam: null,
        roundStart: null,
        roundEnd: null,
        roundScore: null,
        kill: null,
        assist: null,
        blindness: null
    }

    for (const line of lines) {

        matchLines(line, matches);
        
        if (matches.roundScore) {
            const roundsPlayed = parseInt(matches.roundScore[3]);
            
            // Extract the team names from the first round, recording the intial team sides
            if (roundsPlayed == 0) teamNames = getTeamNames(matches, teamNames);
            if(roundsPlayed >= 0) {
                updatePlayers(players, teamNames, matches);
                
                matches.roundEnd = line.match(regexes.roundEnd);
                updateRounds(rounds, matches, teamNames);
            }
        }


    }

    return {
        teamNames: teamNames,
        rounds,
        players
    }
}

function matchLines(line: string, matches: Matches): Matches {
    if (line.includes("MatchStatus")) {
        matches.ctTeam = line.match(regexes.ctTeam) || matches.ctTeam;
        matches.terroristTeam = line.match(regexes.terroristTeam) || matches.terroristTeam;
        matches.roundScore = line.match(regexes.roundScore) || matches.roundScore;
    } else if (line.includes("World triggered")) {
        matches.roundStart = line.match(regexes.roundStart) ||  matches.roundStart;
    } else if (line.includes("killed")) {
        matches.kill = line.match(regexes.kill);
    } else if (line.includes("assisted")) {
        matches.assist = line.match(regexes.assist);
    } else if (line.includes("blinded")) {
        matches.blindness = line.match(regexes.blindness);
    }

    return matches;
}


function getTeamNames(matches: Matches, teamNames: TeamNames): TeamNames {
    if (!matches.ctTeam || !matches.terroristTeam) return teamNames;
    return [matches.ctTeam[1], matches.terroristTeam[1]];
}

function updatePlayers(players: Players, teamNames: TeamNames, matches: Matches) {
    if (matches.kill) {
        const matchResult = createPlayer(players, teamNames, matches, matches.kill);
        if (matchResult) players[matchResult.id].kills += 1;
        matches.kill = null;
    } else if (matches.assist) {
        const matchResult = createPlayer(players, teamNames, matches, matches.assist);
        if (matchResult) players[matchResult.id].assists += 1;
        matches.assist = null;
    } else if (matches.blindness) {
        const matchResult = createPlayer(players, teamNames, matches, matches.blindness);
        if (matchResult) players[matchResult.id].blindness += parseFloat(matchResult.duration);
        matches.blindness = null;
    }
}

function createPlayer(players: Players, teamNames: TeamNames, matches: Matches, match: RegExpMatchArray): { [key: string]: string } | null {
    const matchResult = match?.groups;
    if (!matchResult) return null;
    if (!players[matchResult.id]) {
        const teamName = (matches.ctTeam && matches.ctTeam[1] == matchResult.side) ? teamNames[0] : teamNames[1];
        players[matchResult.id] = new Player(matchResult.name, teamName);
    }
    return matchResult;
}

function updateRounds(rounds: Round[], matches: Matches, teamNames: TeamNames) {
    if (!matches.roundEnd || !matches.roundStart || !matches.roundScore || !teamNames) return;

    const startTime = matches.roundStart[1].split(":");
    const endTime = matches.roundEnd[1].split(":")
    const score1 = parseInt(matches.roundScore[1]);
    const score2 = parseInt(matches.roundScore[2]);
    const hasTeamSidesChanged = matches.ctTeam && matches.ctTeam[1] == teamNames[1];
    rounds.push ({
        duration: timeDiff(startTime, endTime),
        status: {
            teamSides: hasTeamSidesChanged ? [1, 0] : [0, 1],
            score: hasTeamSidesChanged ? [score2, score1] : [score1, score2]
        }
    })
}


function timeDiff(startTime: string[], endTime: string[]): number {
    const startSecs = parseInt(startTime[0]) * 3600 + parseInt(startTime[1]) * 60 + parseInt(startTime[2]);
    const endSecs = parseInt(endTime[0]) * 3600 + parseInt(endTime[1]) * 60 + parseInt(endTime[2]);
    return endSecs - startSecs;
}
