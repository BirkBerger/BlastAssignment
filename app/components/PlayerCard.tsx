'use client'

import Link from "next/link";
import { Player } from "@/types/log.types";
import React, { useEffect, useState } from "react";
import steamService from '../services/steam-service';
import { SteamInfo } from "@/types/steam.types";
import HitgroupChart from "./HitgroupChart";
import { FONT_SIZE } from "../constants/font-size";
import { THEME_COLORS } from "../constants/colors";

interface Props {
    player: Player | null,
    numberOfRounds: number
}

const PlayerCard = React.memo(function PlayerCard({ player, numberOfRounds }: Props) {

    const [steamInfo, setSteamInfo] = useState<SteamInfo | null>();

    const mostUsedWeapon = Object.entries(player?.weaponUse || {}).reduce((acc, [weapon, { shots, damage }]) => {
        return acc.shots > shots ? acc : { weapon, shots };
    }, { weapon: "", shots: 0 });

    const grenadesThrownTotal = Object.values(player?.grenadesThrown || {}).reduce((acc, throws) => {
        return acc + throws;
    }, 0);

    const damageTotal = Object.values(player?.weaponUse || {}).reduce((acc, { shots, damage }) => {
        return acc += damage;
    }, 0);

    useEffect(() => {
        setSteamInfo(null);
        if (!player) return;
        steamService.getPlayerInfo(player.id)
        .then((steamInfo) => setSteamInfo(steamInfo));


    }, [player?.id]);

    const cellClasses = "flex relative rounded-[20] p-4 xs:p-8"
    const cellBg = <div className="absolute z-[-1] top-3 left-3 bottom-3 right-3 rounded-[20] animate-fadeIn" ></div>;
    const cellInCell = (stat: number | string, statName: string) => (
        <div className="rounded-[15] flex flex-col items-center justify-center w-full p-1 animate-fadeIn" style={{ backgroundColor: THEME_COLORS[1] }}>
            <div className={`${FONT_SIZE.lg}`}>
                {stat}
            </div>
            <div className={`${FONT_SIZE.sm}`}>
                {statName}
            </div>
        </div>
    )

    return (
        <div className="rounded-[20]" style={{ minHeight: "calc(min(34vw, 230px) + min(15vw, 150px) + min(15vw, 150px) + 40px)", backgroundColor: player ? "" : THEME_COLORS[0] }} >
            { player && (
                <div className="grid grid-cols-4 grid-cols-[50fr_10fr_40fr] grid-rows-[repeat(auto,4)] xs:grid-cols-[32fr_8fr_25fr_35fr] xs:grid-rows-[min(34vw,230px)_min(15vw,150px)_min(15vw,150px)] gap-5 text-center">
                    <div className={`col-span-3 flex relative rounded-[20] flex-col gap-3 p-4`} style={{ backgroundColor: THEME_COLORS[0] }}>
                        {cellBg}
                        <div className="flex justify-between">
                            <div className={FONT_SIZE.xl}>
                                {player.name}
                            </div>
                            <Link className="relative cursor-pointer h-20" href={steamInfo?.playerSteamUrl || ""} target="_blank">
                                {steamInfo && (
                                    <img className="rounded-[10] max-h-20 object-cover animate-fadeIn"
                                        src={steamInfo?.playerAvatar}
                                        alt="Player STEAM avatar."
                                        onError={(e) => e.currentTarget.src = '/fallbacks/avatar.png'}>
                                    </img>
                                )}
                                <img className="absolute z-2 right-[-7] top-[-7] w-7 h-7 animate-fadeIn"
                                    src="/steam_logo.png"
                                    alt="STEAM logo.">
                                </img>
                            </Link>
                        </div>
                        <div className="flex gap-3 h-full">
                            {cellInCell((player.kills/player.deaths).toFixed(2), "Kills per Deaths")}
                            {cellInCell((player.kills/numberOfRounds).toFixed(2), "Kills per round")}
                            {cellInCell((damageTotal/numberOfRounds).toFixed(2), "Damage per round")}
                        </div>
                    </div>
                    <div className={`order-last xs:order-none col-span-3 xs:col-span-1 xs:row-span-3 ${cellClasses} flex-col px-4`} style={{ backgroundColor: THEME_COLORS[0] }}>
                        {cellBg}
                        <div className={FONT_SIZE.sm}>
                            HIT DISTRIBUTION MAP
                        </div>
                        <div className="grow min-h-0">
                            <HitgroupChart hitgroupShots={player.hitgroupShots}></HitgroupChart>
                        </div>
                    </div>
                    <div className={`${cellClasses} items-center justify-end`} style={{ backgroundColor: THEME_COLORS[0] }}>
                        {cellBg}
                        <img className="max-h-full max-w-[50%] object-contain absolute top-[3%] left-[-4%]"
                            src="/chair.png"
                            alt="A chair.">
                        </img>
                        <div>
                            <div className={FONT_SIZE.sm}>
                                FURNITURE<br></br>
                                DEMOLISHED
                            </div>
                            <div className={FONT_SIZE.xl}>
                                {player.mapDamage}
                            </div>
                        </div>
                    </div>
                    <div className={`${cellClasses} items-center justify-end col-span-2`} style={{ backgroundColor: THEME_COLORS[0] }}>
                        {cellBg}
                        <img className="max-h-[110%] object-contain absolute left-[2%]"
                            src="/blinded.png"
                            alt="A blind terrorist.">
                        </img>
                        <div className="">
                            <div className={FONT_SIZE.sm}>
                                TIME SPENT BLIND
                            </div>
                            <div>
                                <span className={FONT_SIZE.xl}>
                                    {Math.round(player.blindness)}
                                </span>
                                <span className={FONT_SIZE.lg}>
                                    s
                                </span>
                            </div>
                        </div>
                    </div>
                    <div className={`${cellClasses} items-center col-span-2`} style={{ backgroundColor: THEME_COLORS[0] }}>
                        {cellBg}
                        <div>
                            <div className={FONT_SIZE.xl}>
                                {mostUsedWeapon.shots}
                            </div>
                            <div className={FONT_SIZE.sm}>
                                SHOTS HIT
                            </div>
                        </div>
                        <div className={`self-start text-right grow ${FONT_SIZE.sm}`}>
                            FAVORITE WEAPON
                        </div>
                        <img className="max-h-full max-w-[85%] object-contain absolute bottom-[-35%] right-[-3%] z-1"
                            src={`/weapons/${mostUsedWeapon.weapon}.png`}
                            alt={mostUsedWeapon.weapon}
                            onError={(e) => e.currentTarget.src = '/fallbacks/weapon.png'}>
                        </img>
                    </div>
                    <div className={`${cellClasses} items-center`} style={{ backgroundColor: THEME_COLORS[0] }}>
                        {cellBg}
                        <div>
                            <div className={FONT_SIZE.sm}>
                                NADES<br></br>
                                THROWN
                            </div>
                            <div className={FONT_SIZE.xl}>
                                {grenadesThrownTotal}
                            </div>
                        </div>
                        <img className="max-h-full max-w-[50%] object-contain absolute top-[-3%] right-[-4%]"
                            src="/grenades.png"
                            alt="Utility grenades">
                        </img>
                    </div>
                </div>
            )}
        </div>
    )
})

export default PlayerCard;