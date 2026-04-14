export interface Round {
    duration: number
    status: {
        score: [number, number],
        teamSides: [number, number]
        moneySpend: [number, number]
    }
};

export interface WeaponShots {
    [ weaponName: string ]: number
};

export interface HitgroupShots {
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
    weaponShots: WeaponShots;
    moneySpend: number;
    hitgroupShots: HitgroupShots;
};

export type TeamNames = [string, string];

export interface GameData {
    teamNames: TeamNames
    rounds: Round[],
    players: Player[]
};