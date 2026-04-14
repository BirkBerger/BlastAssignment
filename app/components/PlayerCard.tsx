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
                    <div className={`border border-inherit`}>
                        [Y]
                    </div>
                    <div className={`border border-inherit`}>
                        [Z]
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