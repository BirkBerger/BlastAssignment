export interface Round {
    duration: number
    status: {
        score: [number, number],
        teamSides: [number, number]
    }
};

export interface WeaponUse {
    [ weaponName: string ]: number
};

export interface HitGroupDamage {
    [ hitGroup: string ]: number
};

export class Player {
    name: string = "";
    teamName: string = "";
    kills: number = 0;
    deaths: number = 0;
    assists: number = 0;
    blindness: number = 0;
    WeaponUse: WeaponUse = {};
    moneySpend: number = 0;
    hitGroupDamage: HitGroupDamage = {};

    constructor(name: string, teamName: string) {
        this.name = name;
        this.teamName = teamName;
    }
};

export type Players = { [id: string ]: Player };

export type TeamNames = [string, string];

export interface ParsedLog {
    teamNames: TeamNames
    rounds: Round[],
    players: Players
};