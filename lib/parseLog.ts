import fs from 'fs';
import path from 'path';
import { ParsedLog, Player, Round } from '@/types/log.types';

const roundStartRegex = /(\d{2}:\d{2}:\d{2}): World triggered "Round_Start"/;
const roundScoreRegex = /MatchStatus: Score: (\d+):(\d+) on map "[^"]+" RoundsPlayed: (\d+)/
const roundEndRegex = /(\d{2}:\d{2}:\d{2}): World triggered "Round_End"/;
const ctTeamRegex = /MatchStatus: Team playing "CT": (.+)/
const terroristTeamRegex = /MatchStatus: Team playing "TERRORIST": (.+)/

export function parseLog(raw: string): ParsedLog {
    const lines = raw.split('\n');

    const rounds = new Array<Round>();
    const players: { [id: string]: Player } = {};

    let teamNames;
    let ctTeamMatch;
    let terroristTeamMatch;
    let roundStartMatch;
    let roundScoreMatch;

    for (const line of lines) {

        ctTeamMatch = line.match(ctTeamRegex) || ctTeamMatch;
        terroristTeamMatch = line.match(terroristTeamRegex) || terroristTeamMatch;

        // Set team names on first encounter to record initial team sides
        if (!teamNames && ctTeamMatch && terroristTeamMatch) {
            teamNames = [ctTeamMatch[1], terroristTeamMatch[1]] as [string, string]
        }

        roundStartMatch = line.match(roundStartRegex) || roundStartMatch;
        roundScoreMatch = line.match(roundScoreRegex) || roundScoreMatch;
        
        if (roundStartMatch && roundScoreMatch) {
            const roundsPlayed = parseInt(roundScoreMatch[3]);

            if(roundsPlayed < 1) continue;

            const roundEndMatch = line.match(roundEndRegex);

            if (roundEndMatch) {
                const startTime = roundStartMatch[1].split(":");
                const endTime = roundEndMatch[1].split(":")
                const score1 = parseInt(roundScoreMatch[1]);
                const score2 = parseInt(roundScoreMatch[2]);
                const isInitialTeamSides = ctTeamMatch && teamNames && ctTeamMatch[1] == teamNames[0];
                rounds.push({
                    duration: timeDiff(startTime, endTime),
                    status: {
                        teamSides: isInitialTeamSides ? [0, 1] : [1, 0],
                        score: isInitialTeamSides ? [score1, score2] : [score2, score1]
                    }
                })
            }
        }
    }

    return {
        teamNames: teamNames || ["", ""],
        rounds,
        players
    }

}

function timeDiff(startTime: string[], endTime: string[]): number {
    const startSecs = parseInt(startTime[0]) * 3600 + parseInt(startTime[1]) * 60 + parseInt(startTime[2]);
    const endSecs = parseInt(endTime[0]) * 3600 + parseInt(endTime[1]) * 60 + parseInt(endTime[2]);
    return endSecs - startSecs;
}