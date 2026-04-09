export interface Round {
    duration: number
    status: {
        score: [number, number],
        teamSides: [number, number]
    }
}

export interface WeaponUse {
    [ weaponName: string ]: number
}

export interface HitGroupDamage {
    [ hitGroup: string ]: number
}

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
}

export interface ParsedLog {
    teamNames: [string, string]
    rounds: Round[],
    players: { [id: string ]: Player }
}