'use client'

import { GameData, Player } from "@/types/log.types";
import React from "react";
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

    const [sortBy, setSortBy] = useState<{ field: Field, dir: 1 | -1 }>({ field: Field.kills, dir: 1 });

    const teams: [Player[], Player[]] = data.players.reduce((acc: [Player[], Player[]], player) => {
        player.teamName == data.teamNames[0] ? acc[0].push(player) : acc[1].push(player);
        return acc;
    }, [[], []]);

    const [activePlayer, setActivePlayer] = useState<Player>(teams[0][0]);
    const [hoveredPlayer, setHoveredPlayer] = useState<Player | null>(null);
    const playerBgClasses = (playerId: string) => `py-1 px-2 cursor-pointer transition-bg duration-100 ${playerId == hoveredPlayer?.id ? 'bg-[#3838b2]' : ""} ${playerId == activePlayer.id ? 'bg-[#3c3c3c]' : ""}`

    teams.forEach((team) => {
        team.sort((p1, p2) => (p2[sortBy.field] - p1[sortBy.field]) * sortBy.dir);
    });

    const handleSort = (field: Field) => {
        setSortBy((prev) => ({
            field,
            dir: prev.field == field && prev.dir == 1 ? -1 : 1
        }))
    };

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
                            <div key={`player_${j}`} className="contents" onClick={() => setActivePlayer(player)} onMouseEnter={() => setHoveredPlayer(player)} onMouseLeave={() => setHoveredPlayer(null)}>
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
            <PlayerCard player={activePlayer}></PlayerCard>
        </div>
    )
}

export default ScoreBoard;