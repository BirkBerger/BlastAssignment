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
    name: string;
    teamName: string;
    kills: number;
    deaths: number;
    assists: number;
    blindness: number;
    weaponUse: WeaponUse;
    moneySpend: number;
    hitGroupDamage: HitGroupDamage;
};

export type Players = { [id: string ]: Player };

export type TeamNames = [string, string];

export interface GameData {
    teamNames: TeamNames
    rounds: Round[],
    players: Players
};