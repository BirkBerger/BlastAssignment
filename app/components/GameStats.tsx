'use client'

import { useSearchParams } from "next/navigation";
import { GameData, Player } from "@/types/log.types";
import PlayerCard from "./PlayerCard";
import ScoreBoard from "./ScoreBoard";
import GameChart from "./GameChart";
import { useEffect, useState } from "react";

interface Props {
    data: GameData;
}

function GameStats({ data }: Props) {

    const searchParams = useSearchParams();
    const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null)

    useEffect(() => {
        const queryParamId = searchParams.get('player');
        const initialSelectedPlayer = data.players.find((player) => player.id == queryParamId) || data.players[0];
        setSelectedPlayer(initialSelectedPlayer);
    }, [searchParams]);

    return (
        <div className="max-w-[1000px] w-full flex flex-col gap-8">
            <ScoreBoard data={data} onPlayerSelect={(p) => setSelectedPlayer(p)}></ScoreBoard>
            <PlayerCard player={selectedPlayer}></PlayerCard>
            {/* <GameChart></GameChart> */}
        </div>
    )

}

export default GameStats;