'use client'

import { Player } from "@/types/log.types";
import React from "react";

interface Props {
    player: Player | null,
    cardColor: string,
    teamName: string
}

const PlayerCard = React.memo(function PlayerCard({ player, cardColor, teamName }: Props) {

    return (
        <div className="m-12 max-w-[800px] aspect-3/2">
            { player && (
                <div className={`w-full h-full grid grid-cols-[25%_12%_28%_35%] grid-rows-[40%_30%_30%]`} style={{ boxShadow: `0 0 8px 2px ${cardColor}`, borderColor: cardColor }}>
                    <div className="border-inherit">
                    </div>
                    <div className="col-span-2 border border-inherit">
                        {player.name}
                        {teamName}
                    </div>
                    <div className="row-span-3 border border-inherit">
                        [man]
                    </div>
                    <div className="col-span-2 border border-inherit">
                        [X]
                    </div>
                    <div className="border border-inherit">
                        [Y]
                    </div>
                    <div className="border border-inherit">
                        [Z]
                    </div>
                    <div className="col-span-2 border border-inherit">
                        [W]
                    </div>
                </div>
            )}
        </div>
    )
})

export default PlayerCard;