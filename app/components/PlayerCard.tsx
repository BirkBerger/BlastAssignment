'use client'

import { Player } from "@/types/log.types";
import React, { useEffect, useState } from "react";
import steamService from '../services/steam-service';
import { SteamInfo } from "@/types/steam.types";
import HitgroupChart from "./HitgroupChart";
import { FONT_SIZE } from "../constants/font-size";

interface Props {
    player: Player | null,
    cardColor: string,
    teamName: string
}

const PlayerCard = React.memo(function PlayerCard({ player, cardColor, teamName }: Props) {

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

    const cellClasses = "border border-inherit p-2"

    return (
        <div className="m-12 max-w-[800px] aspect-3/2">
            { player && steamInfo && (
                <div className={`w-full h-full grid grid-cols-[25%_13%_27%_35%] grid-rows-[40%_35%_25%]`} style={{ boxShadow: `0 0 8px 2px ${cardColor}`, borderColor: cardColor }}>
                    <div className="flex border border-inherit overflow-hidden">
                        <img className="object-cover animate-fadeIn"
                            src={steamInfo.playerAvatar}
                            alt="Player STEAM avatar."
                            onError={(e) => e.currentTarget.src = '/fallbacks/avatar.png'}>
                        </img>
                    </div>
                    <div className={`col-span-2 ${cellClasses}`}>
                        <div className={FONT_SIZE.lg}>
                            {teamName}
                        </div>
                        <h1 className={FONT_SIZE.xl}>
                            {player.name}
                        </h1>
                        { steamInfo.playerName && steamInfo.playerName != player.name && (
                            <div className={FONT_SIZE.sm}>
                                ({steamInfo.playerName})
                            </div>
                        )}
                    </div>
                    <div className={`row-span-3 flex flex-col ${cellClasses}`}>
                        <h2 className={`self-center ${FONT_SIZE.lg}`}>
                            SHOTS FIRED
                        </h2>
                        <div className="grow">
                            <HitgroupChart hitgroupShots={player.hitgroupShots}></HitgroupChart>
                        </div>
                    </div>
                    <div className={`col-span-2 ${cellClasses} flex items-center justify-end relative`}>
                        <img className="max-h-full" src={`/weapons/${mostUsedWeapon.weapon}.webp`}
                            alt="The player's most used weapon."
                            onError={(e) => e.currentTarget.src = '/fallbacks/weapon.png'}>
                        </img>
                        <div className="absolute left-2 bottom-2">
                            <div>
                                { mostUsedWeapon.weapon }
                            </div>
                            <h2 className={FONT_SIZE.lg}>
                                Fave Weapon
                            </h2>
                            <div>
                                Hit {mostUsedWeapon.shots} times
                            </div>
                        </div>
                    </div>
                    <div className={`${cellClasses} border border-inherit flex justify-end items-end relative`}>
                        <div className="absolute top-0 left-0 p-[inherit] flex flex-col h-full justify-between">
                            <h2 className={FONT_SIZE.lg}>
                                Grenades thrown
                            </h2>
                            <div className={FONT_SIZE.xl}>
                                #{ grenadesThrownTotal }
                            </div>
                        </div>
                        <img className="max-h-[85%]" src="/weapons/grenades.webp"
                            alt="Different grenade types.">
                        </img>
                    </div>
                    <div className={`border border-inherit`}>
                        <h2 className={FONT_SIZE.lg}>
                            Blinded for
                        </h2>
                        <div>
                            {(player.blindness).toFixed(2)} seconds
                        </div>
                    </div>
                    <div className={`col-span-2 ${cellClasses}`}>
                        [W]
                    </div>
                </div>
            )}
        </div>
    )
})

export default PlayerCard;