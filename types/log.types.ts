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

export interface Player {
    name: string,
    teamIndex: number,
    kills: number,
    deaths: number,
    assists: number,
    blindness: number,
    WeaponUse: WeaponUse,
    moneySpend: number,
    hitGroupDamage: HitGroupDamage
};

export type TeamNames = [string, string];

export interface ParsedLog {
    teamNames: TeamNames
    rounds: Round[],
    players: { [id: string ]: Player }
};