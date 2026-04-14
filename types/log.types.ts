export interface Round {
    duration: number
    status: {
        score: [number, number],
        teamSides: [number, number]
        moneySpend: [number, number]
    }
};

export interface WeaponUse {
    [ weaponName: string ]: number
};

export interface HitGroupDamage {
    [ hitGroup: string ]: number
};

export interface Player {
    id: string;
    name: string;
    teamIndex: number;  // Position in GameData.teamNames
    kills: number;
    deaths: number;
    assists: number;
    blindness: number;
    weaponUse: WeaponUse;
    moneySpend: number;
    hitGroupDamage: HitGroupDamage;
};

export type TeamNames = [string, string];

export interface GameData {
    teamNames: TeamNames
    rounds: Round[],
    players: Player[]
};