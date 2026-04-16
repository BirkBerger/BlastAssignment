'use client'

import { useRouter, useSearchParams } from "next/navigation";
import { GameData, Player } from "@/types/log.types";
import React, { useEffect } from "react";
import { useState } from "react";
import { THEME_COLORS } from "../constants/colors";
import ArrowButton from "./ArrowButton";
import PlayerCard from "./PlayerCard";
import { FONT_SIZE } from "../constants/font-size";
import TeamLogo from "./TeamLogo";

interface Props {
    data: GameData;
}

enum Field {
    kills = 'kills',
    assists = 'assists',
    deaths = 'deaths'
}

type SortBy = { field: Field, dir: 1 | -1 };

function ScoreBoard({ data }: Props) {

    const router = useRouter();
    const searchParams = useSearchParams();
    const [sortBy, setSortBy] = useState<[SortBy, SortBy]>([
        { field: Field.kills, dir: 1 },
        { field: Field.kills, dir: 1 }
    ]);
    const [activePlayer, setActivePlayer] = useState<Player | null>(null);
    const [hoveredPlayer, setHoveredPlayer] = useState<Player | null>(null);

    const teams: [Player[], Player[]] = data.players.reduce((acc: [Player[], Player[]], player) => {
        player.teamIndex == 0 ? acc[0].push(player) : acc[1].push(player);
        return acc;
    }, [[], []]);

    teams.forEach((team, i) => {
        team.sort((p1, p2) => (p2[sortBy[i].field] - p1[sortBy[i].field]) * sortBy[i].dir);
    });

    const handleSort = (field: Field, teamIdx: number) => {
        sortBy[teamIdx] = {
            field,
            dir: sortBy[teamIdx].field == field && sortBy[teamIdx].dir == 1 ? -1 : 1
        };
        setSortBy({...sortBy});
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
        <div className="flex flex-col gap-4">
            <div className="p-4 animate-fadeIn flex flex-col gap-4 rounded-[15]" style={{ backgroundColor: THEME_COLORS[0]}}>
                <div className="flex items-center justify-center gap-4 relative">
                    { teams.map((team, i) => (
                        <React.Fragment key={`team_${i}`}>
                            <div className={`flex items-center justify-end gap-4 flex-1 ${ i == 1 ? "flex-row-reverse" : ""}`}>
                                <div className="">
                                    <div className={`w-[10vw] max-w-[110px] absolute bottom-0 ${ i == 1 ? "right-0" : "left-0"}`}>
                                        <TeamLogo name={data.teamNames[i]}></TeamLogo>
                                    </div>
                                </div>
                                <div className={FONT_SIZE.md}>
                                    {data.teamNames[i]}
                                </div>
                                <div className={FONT_SIZE.xl}>
                                    {data.rounds[data.rounds.length-1].status.score[i]}
                                </div>
                            </div>
                            { i == 0 && (
                                <div className={`w-[10%] text-center ${FONT_SIZE.xl}`}>
                                    :
                                </div> 
                            )}
                        </React.Fragment>
                    ))}
                </div>
                <div className="flex gap-8">
                    { teams.map((team, i) => (
                        <div key={`team_${i}`} className="rounded-[15] p-4 flex-1" style={{ backgroundColor: THEME_COLORS[1] }}>
                            <div className="flex">
                                <div className="flex-2"></div>
                                { Object.values(Field).map((field, j) => (
                                    <div key={`field_${j}`} className="flex-1 flex justify-center">
                                        <ArrowButton
                                            field={field}
                                            clickedButton={sortBy[i]}
                                            onClick={() => handleSort(field, i)}
                                            ></ArrowButton>
                                    </div>
                                )) }
                            </div>
                            { team.map((player, j) => (
                                <div key={`player_${j}`} className={`flex text-center cursor-pointer rounded-[8] py-1 px-2 border border-transparent ${FONT_SIZE.md}`} 
                                    style={{
                                        backgroundColor: player.id == hoveredPlayer?.id ? THEME_COLORS[0] : j % 2 == 0 ? THEME_COLORS[2] : "",
                                        borderColor: player.id == hoveredPlayer?.id ? "white" : ""
                                        }} 
                                    onClick={() => handlePlayerClick(player)}
                                    onMouseEnter={() => setHoveredPlayer(player)}
                                    onMouseLeave={() => setHoveredPlayer(null)}
                                    >
                                    <div className="flex-2 text-left font-bold">
                                        {player.name}
                                    </div>
                                    <div className="flex-1">
                                        {player.kills}
                                    </div>
                                    <div className="flex-1">
                                        {player.assists}
                                    </div>
                                    <div className="flex-1">
                                        {player.deaths}
                                    </div>
                                </div>
                            )) }
                        </div>
                    ))}
                </div>
            </div>
            <PlayerCard player={activePlayer}></PlayerCard>
        </div>
    )
}

export default ScoreBoard;