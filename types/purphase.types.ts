export enum PurchaseType {
    WEAPON = 'WEAPON',
    GRENADE = 'GRENADE',
    GEAR = 'GEAR',
}

export const PURCHASES: Record<PurchaseType, string[]> = {
    [PurchaseType.WEAPON]: [
        'knife', 'knife_t',
        'glock', 'hkp2000', 'usp_silencer', 'p250', 'tec9', 'cz75a', 'fiveseven', 'deagle', 'revolver',
        'mac10', 'mp9', 'mp7', 'mp5sd', 'ump45', 'p90', 'bizon',
        'ak47', 'm4a1', 'm4a1_silencer', 'famas', 'galilar', 'sg556', 'aug', 'awp', 'ssg08', 'g3sg1', 'scar20',
        'nova', 'xm1014', 'sawedoff', 'mag7', 'm249', 'negev',
    ],
    [PurchaseType.GRENADE]: [
        'hegrenade', 'flashbang', 'smokegrenade', 'molotov', 'incgrenade', 'decoy',
    ],
    [PurchaseType.GEAR]: [
        'kevlar', 'helmet', 'defuser', 'taser',
    ],
}

export const PURCHASE_TYPE_MAP: Record<string, PurchaseType> = Object.entries(PURCHASES).reduce((acc, [type, items]) => {
    items.forEach((item) => acc[item] = type as PurchaseType);
    return acc;
}, {} as Record<string, PurchaseType>)