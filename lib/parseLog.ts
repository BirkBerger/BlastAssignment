import fs from 'fs';
import path from 'path';
import { ParsedLog, Player, Round } from '@/types/log.types';

export function parseLog(raw: string): ParsedLog {
    const lines = raw.split('\n');

    const rounds = new Array<Round>();
    const players: { [id: string]: Player } = {};

    const roundStartRegex = /(\d{2}:\d{2}:\d{2}): World triggered "Round_Start"/;
    const roundScoreRegex = /MatchStatus: Score: (\d+):(\d+) on map "[^"]+" RoundsPlayed: (\d+)/
    const roundEndRegex = /(\d{2}:\d{2}:\d{2}): World triggered "Round_End"/;

    console.log(`* Parsing ${lines.length} lines *`);

    let roundStartMatch;
    let roundScoreMatch;

    for (const line of lines) {
        roundStartMatch = line.match(roundStartRegex) || roundStartMatch;
        roundScoreMatch = line.match(roundScoreRegex) || roundScoreMatch;
        
        if (roundStartMatch && roundScoreMatch) {
            const roundsPlayed = parseInt(roundScoreMatch[3]);

            if(roundsPlayed < 1) continue;

            const roundEndMatch = line.match(roundEndRegex);

            if (roundEndMatch) {
                const startTime = roundStartMatch[1].split(":");
                const endTime = roundEndMatch[1].split(":")
                rounds.push({
                    duration: timeDiff(startTime, endTime),
                    score: [parseInt(roundScoreMatch[1]), parseInt(roundScoreMatch[2])]
                })
            }
        }
    }

    return {
        rounds,
        players
    }

}

function timeDiff(startTime: string[], endTime: string[]): number {
    const startSecs = parseInt(startTime[0]) * 3600 + parseInt(startTime[1]) * 60 + parseInt(startTime[2]);
    const endSecs = parseInt(endTime[0]) * 3600 + parseInt(endTime[1]) * 60 + parseInt(endTime[2]);
    return endSecs - startSecs;
}