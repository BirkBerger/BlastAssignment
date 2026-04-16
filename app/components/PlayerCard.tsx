'use client'

import { Player } from "@/types/log.types";
import React, { useEffect, useState } from "react";
import steamService from '../services/steam-service';
import { SteamInfo } from "@/types/steam.types";
import HitgroupChart from "./HitgroupChart";
import { FONT_SIZE } from "../constants/font-size";
import { THEME_COLORS } from "../constants/colors";

interface Props {
    player: Player | null
}

const PlayerCard = React.memo(function PlayerCard({ player }: Props) {

    const [steamInfo, setSteamInfo] = useState<SteamInfo | null>();

    const mostUsedWeapon = Object.entries(player?.weaponShots || {}).reduce((acc, [weapon, shots]) => {
        return acc.shots > shots ? acc : { weapon, shots };
    }, { weapon: "", shots: 0 });

    const grenadesThrownTotal = Object.values(player?.grenadesThrown || {}).reduce((acc, throws) => {
        return acc + throws;
    }, 0)

    useEffect(() => {
        setSteamInfo(null);
        if (!player) return;
        steamService.getPlayerInfo(player.id)
        .then((steamInfo) => setSteamInfo(steamInfo));


    }, [player?.id]);

    const cellClasses = "flex relative rounded-[20] p-8"
    const cellBg = <div className="absolute z-[-1] top-3 left-3 bottom-3 right-3 rounded-[20] animate-fadeIn" ></div>;
    const cellInCell = (stat: number, statName: string) => (
        <div className="rounded-[15] flex flex-col items-center justify-center w-full animate-fadeIn" style={{ backgroundColor: THEME_COLORS[1] }}>
            <div className={`${FONT_SIZE.lg}`}>
                {stat}
            </div>
            <div className={`${FONT_SIZE.sm}`}>
                {statName}
            </div>
        </div>
    )

    return (
        <div>
            { player && (
                <div className="grid grid-cols-4 grid-cols-[32fr_8fr_25fr_35fr] gap-5 grid-rows-[minmax(140px,240px)_minmax(100px,200px)_minmax(100px,200px)] text-center">
                    <div className={`col-span-3 flex relative rounded-[20] flex-col gap-3 p-4`} style={{ backgroundColor: THEME_COLORS[0] }}>
                        {cellBg}
                        <div className="flex justify-between">
                            <div className={FONT_SIZE.xl}>
                                {player.name}
                            </div>
                            <div className="relative">
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
                            </div>
                        </div>
                        <div className="flex gap-3 h-full">
                            {cellInCell(player.kills, "Kills")}
                            {cellInCell(player.deaths, "Deaths")}
                            {cellInCell(player.assists, "Assists")}
                        </div>
                    </div>
                    <div className={`row-span-3 ${cellClasses} flex-col`} style={{ backgroundColor: THEME_COLORS[0] }}>
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
                        <img className="max-h-full object-contain absolute top-[3%] left-[10px]"
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
                        <img className="max-h-[110%] object-contain absolute left-[20px]"
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
                        <img className="max-h-35 object-contain absolute bottom-[-40] right-[-10]"
                            src={`/weapons/${mostUsedWeapon.weapon}.png`}
                            alt={mostUsedWeapon.weapon}>
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
                        <img className="min-w-[30px] max-h-full object-contain absolute right-[-10] top-[-5px]"
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