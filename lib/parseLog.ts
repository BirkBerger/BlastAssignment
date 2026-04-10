import fs from 'fs';
import path from 'path';
import { ParsedLog, Player, Round, TeamNames } from '@/types/log.types';

const enum MATCH_PROPERTY {
    ctTeam = 'ctTeam',
    terroristTeam = 'terroristTeam',
    roundStart = 'roundStart',
    roundEnd = 'roundEnd',
    roundScore = 'roundScore'
}

type Matches = { [property in MATCH_PROPERTY]: RegExpMatchArray | null };

const regexes: { [property in MATCH_PROPERTY]: RegExp } = {
    roundStart: /(\d{2}:\d{2}:\d{2}): World triggered "Round_Start"/,
    roundEnd: /(\d{2}:\d{2}:\d{2}): World triggered "Round_End"/,
    roundScore: /MatchStatus: Score: (\d+):(\d+) on map "[^"]+" RoundsPlayed: (\d+)/,
    ctTeam: /MatchStatus: Team playing "CT": (.+)/,
    terroristTeam: /MatchStatus: Team playing "TERRORIST": (.+)/
}

export function parseLog(raw: string): ParsedLog {
    const lines = raw.split('\n');

    let teamNames = null;
    const rounds = new Array<Round>();
    const players: { [id: string]: Player } = {};

    const matches: Matches = {
        ctTeam: null,
        terroristTeam: null,
        roundStart: null,
        roundEnd: null,
        roundScore: null
    }

    for (const line of lines) {

        matches.ctTeam = line.match(regexes.ctTeam) || matches.ctTeam;
        matches.terroristTeam = line.match(regexes.terroristTeam) || matches.terroristTeam;
        matches.roundStart = line.match(regexes.roundStart) ||  matches.roundStart;
        matches.roundScore = line.match(regexes.roundScore) || matches.roundScore;

        teamNames = getTeamNames(matches, teamNames);

        if (matches.roundScore) {
            const roundsPlayed = parseInt(matches.roundScore[3]);
            if(roundsPlayed < 1) continue;
        }

        matches.roundEnd = line.match(regexes.roundEnd);

        const round = createRound(matches, teamNames);
        if (round) rounds.push(round);
    }

    return {
        teamNames: teamNames || ["", ""],
        rounds,
        players
    }

}

function getTeamNames(matches: Matches, teamNames: TeamNames | null): TeamNames | null {
    // Extract the first occurrence of team names which desides the intial team sides
    if (!matches.ctTeam || !matches.terroristTeam) return teamNames;
    return teamNames || [matches.ctTeam[1], matches.terroristTeam[1]] as TeamNames
}

function createRound(matches: Matches, teamNames: TeamNames | null): Round | null {
    if (!matches.roundStart || !matches.roundEnd || !matches.roundScore || !teamNames) return null;

    const startTime = matches.roundStart[1].split(":");
    const endTime = matches.roundEnd[1].split(":")
    const score1 = parseInt(matches.roundScore[1]);
    const score2 = parseInt(matches.roundScore[2]);
    const hasTeamSidesChanged = matches.ctTeam && teamNames && matches.ctTeam[1] == teamNames[1];
    return {
        duration: timeDiff(startTime, endTime),
        status: {
            teamSides: hasTeamSidesChanged ? [1, 0] : [0, 1],
            score: hasTeamSidesChanged ? [score2, score1] : [score1, score2]
        }
    }
}


function timeDiff(startTime: string[], endTime: string[]): number {
    const startSecs = parseInt(startTime[0]) * 3600 + parseInt(startTime[1]) * 60 + parseInt(startTime[2]);
    const endSecs = parseInt(endTime[0]) * 3600 + parseInt(endTime[1]) * 60 + parseInt(endTime[2]);
    return endSecs - startSecs;
}
