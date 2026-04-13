'use client'

import { GameData, Player } from "@/types/log.types";
import React from "react";
import { useState } from "react";
import { TEAM_COLORS } from "../constants/colors";
import ArrowButton from "./ArrowButton";

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

    const teams: [Player[], Player[]] = Object.values(data.players).reduce((acc: [Player[], Player[]], player) => {
        player.teamName == data.teamNames[0] ? acc[0].push(player) : acc[1].push(player);
        return acc;
    }, [[], []]);

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
            <div className="grid grid-cols-4 gap-y-3 m-12 text-center max-w-[1000px]">
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
                        <h2 className="col-span-4 mt-4 text-left" style={{ borderBottom: `2px solid ${TEAM_COLORS[i]}`, color: `${TEAM_COLORS[i]}` }}>
                            {data.teamNames[i]}
                        </h2>
                        { team.map((player, j) => (
                            <div key={`player_${j}`} className="contents">
                                <div className="text-left">
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
        </div>
    )
}

export default ScoreBoard;