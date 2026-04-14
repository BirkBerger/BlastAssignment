'use client'

import { useRouter, useSearchParams } from "next/navigation";
import { GameData, Player } from "@/types/log.types";
import React, { useEffect } from "react";
import { useState } from "react";
import { TEAM_COLORS } from "../constants/colors";
import ArrowButton from "./ArrowButton";
import PlayerCard from "./PlayerCard";

interface Props {
    data: GameData;
}

enum Field {
    kills = 'kills',
    assists = 'assists',
    deaths = 'deaths'
}

function ScoreBoard({ data }: Props) {

    const router = useRouter();
    const searchParams = useSearchParams();
    const [sortBy, setSortBy] = useState<{ field: Field, dir: 1 | -1 }>({ field: Field.kills, dir: 1 });
    const [activePlayer, setActivePlayer] = useState<Player | null>(null);
    const [hoveredPlayer, setHoveredPlayer] = useState<Player | null>(null);

    const teams: [Player[], Player[]] = data.players.reduce((acc: [Player[], Player[]], player) => {
        player.teamIndex == 0 ? acc[0].push(player) : acc[1].push(player);
        return acc;
    }, [[], []]);

    teams.forEach((team) => {
        team.sort((p1, p2) => (p2[sortBy.field] - p1[sortBy.field]) * sortBy.dir);
    });

    const playerBgClasses = (playerId: string) => `py-1 px-2 cursor-pointer ${playerId == hoveredPlayer?.id ? 'bg-[#3838b2]' : ""} ${playerId == activePlayer?.id ? 'bg-[#3c3c3c]' : ""}`

    const handleSort = (field: Field) => {
        setSortBy((prev) => ({
            field,
            dir: prev.field == field && prev.dir == 1 ? -1 : 1
        }))
    };

    useEffect(() => {
        const queryParamId = searchParams.get('player');
        const initialActivePlayer = data.players.find((player) => player.id == queryParamId) || teams[0][0];
        setActivePlayer(initialActivePlayer);
    }, [searchParams]);

    const handlePlayerClick = (player: Player) => {
        setActivePlayer(player);
        router.replace(`?player=${player.id}`, { scroll: false })
    }

    return (
        <div>
            <div className="grid grid-cols-4 m-12 gap-y-[0.5] text-center max-w-[1000px]">
                <div></div>
                { Object.values(Field).map((field, i) => (
                    <ArrowButton key={`field_${i}`}
                        field={field}
                        clickedButton={sortBy}
                        onClick={() => handleSort(field)}
                        ></ArrowButton>
                )) }
                { teams.map((team, i) => (
                    <React.Fragment key={`team_${i}`}>
                        <h2 className="col-span-4 pt-4 text-left" style={{ borderBottom: `2px solid ${TEAM_COLORS[i]}`, color: `${TEAM_COLORS[i]}` }}>
                            {data.teamNames[i]}
                        </h2>
                        { team.map((player, j) => (
                            <div key={`player_${j}`} className="contents" onClick={() => handlePlayerClick(player)} onMouseEnter={() => setHoveredPlayer(player)} onMouseLeave={() => setHoveredPlayer(null)}>
                                <div className={`text-left ${playerBgClasses(player.id)}`}>
                                    {player.name}
                                </div>
                                <div className={playerBgClasses(player.id)}>
                                    {player.kills}
                                </div>
                                <div className={playerBgClasses(player.id)}>
                                    {player.assists}
                                </div>
                                <div className={playerBgClasses(player.id)}>
                                    {player.deaths}
                                </div>
                            </div>
                        )) }
                    </React.Fragment>
                )) }
            </div>
            <PlayerCard player={activePlayer} cardColor={TEAM_COLORS[activePlayer?.teamIndex || 0]} teamName={data.teamNames[activePlayer?.teamIndex || 0]}></PlayerCard>
        </div>
    )
}

export default ScoreBoard;