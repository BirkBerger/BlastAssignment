'use client'

import { GameData } from "@/types/log.types";
import React, { useEffect, useState } from "react";
import { SIDE_COLORS, TEAM_COLORS } from "../constants/colors";

interface Props {
    data: GameData;
}

interface Point {
    x: number,
    y: number,
    color: string
}

class Graph {
    points: Point[] = [];
    color: string = "";

    constructor(color: string, firstPoint: Point) {
        this.color = color;
        this.points.push(firstPoint);
    }
}

function GameGraph( { data }: Props) {

    const [graphs, setGraphs] = useState<Graph[]>([]);
    const winScore = 16;
    const yAxisLabels = Array.from({ length: winScore + 1 }, (_, idx) => winScore - idx)
    const gridColor = "#585858"
    const axisLabelColor = "#d5d5d5"
    
    useEffect(() => {
        const planeWidth = Math.min((window.innerWidth / 100) * 70, 1000);
        const planeHeight = 500;
        initGraphs(planeWidth, planeHeight);
    }, []);

    const initGraphs = (planeWidth: number, planeHeight: number) => {
        const scoreGraphs = Array.from({ length: 2 }, (_, i) => 
            new Graph(TEAM_COLORS[i], { x: 0, y: planeHeight, color: SIDE_COLORS.CT })
        );

        const totalDuration = data.rounds.reduce((acc, round) => acc + round.duration, 0);
        const oneX = planeWidth / totalDuration;
        const oneY = planeHeight / winScore; 
        let x = 0;

        data.rounds.forEach((round, i) => {
            x += (oneX * round.duration) - 1;
            scoreGraphs.forEach((graph, j) => {
                graph.points.push({
                    x: x,
                    y: planeHeight - oneY * round.status.score[j],
                    color: round.status.teamSides[0] == j ? SIDE_COLORS.CT : SIDE_COLORS.TERRORIST
                })
            })
        })

        setGraphs(scoreGraphs);
    }

    return (
        <div className="h-[500px] w-[70%] max-w-[1000px]">
            <div className="flex h-full w-full mt-3 mb-10">
                <div className={`w-[20px] flex flex-col place-content-between leading-0 mx-3 text-[${axisLabelColor}]`}>
                    { yAxisLabels.map((label, i) => (
                        <div key={`yLabel_${i}`}>
                            { label > 0 ? label : "" }
                        </div>
                    ))}
                </div>
                <div className="grow relative">
                    <svg className="w-full h-full absolute overflow-visible">
                        { graphs.length > 0 && graphs.map((graph, i) => (
                            <g key={`graph_gridlines_${i}`}>
                                { graph.points.map((point, j) => (
                                    <g key={`gridline_${i}_${j}`}>
                                        {/* Grid lines */}
                                        <line
                                            x1={point.x}
                                            x2={point.x}
                                            y1={graph.points[0].y}
                                            y2={graph.points[graph.points.length-1].y}
                                            stroke={gridColor}
                                            strokeWidth="1"
                                            ></line>
                                        <line
                                            x1={graph.points[0].x}
                                            x2={graph.points[graph.points.length-1].x}
                                            y1={point.y}
                                            y2={point.y}
                                            stroke={gridColor}
                                            strokeWidth="1"
                                            ></line>
                                    </g>
                                ))}
                            </g>
                        ))}
                        { graphs.length > 0 && graphs.map((graph, i) => (
                            <g key={`graph_curves_${i}`}>
                                { graph.points.map((point, j) => (
                                    <g key={`curve_${i}_${j}`}>
                                        {/* Graph curve */}
                                        { j < graph.points.length-1 && (
                                            <line
                                            x1={graph.points[j+1].x}
                                            x2={point.x}
                                            y1={graph.points[j+1].y}
                                            y2={point.y}
                                            stroke={graph.color}
                                            strokeWidth="1"
                                            ></line>
                                        )}
                                        {/* Graph points */}
                                        <circle
                                            cx={point.x}
                                            cy={point.y}
                                            r={5}
                                            fill={point.color}
                                        />
                                        {/* X-axis labels */}
                                        { j > 0 && (
                                            <text
                                                x={point.x - ((point.x - graph.points[j-1].x) / 2)}
                                                y={graph.points[0].y + 20}
                                                fill={axisLabelColor}
                                                fontSize="9"
                                                textAnchor="middle">
                                                R{j}
                                            </text>
                                        )}
                                        {/* Curve labels */}
                                        { j == graph.points.length - 1 && (
                                            <g>
                                                <text
                                                    x={point.x + 15}
                                                    y={point.y}
                                                    fill={graph.color}
                                                    fontSize="clamp(10px, 2.5vw, 25px)"
                                                    dominantBaseline="middle">
                                                    {data.teamNames[i]}
                                                </text>
                                                <text
                                                    x={point.x + 15}
                                                    y={point.y - 18}
                                                    fill="#96dafe"
                                                    fontSize="clamp(8px, 1.5vw, 20px)">
                                                    {point.y == 0 ? "Game winner" : "Game loser"}
                                                </text>
                                            </g>
                                        )}
                                    </g>
                                ))}
                            </g>
                        ))}
                    </svg>
                </div>
            </div>
            <div className="flex items-center justify-center">
                <div className="grid grid-cols-[auto_1fr] gap-2 items-center">
                    { Object.entries(SIDE_COLORS).map(([key, value], i) => (
                        <React.Fragment key={`side_color_${i}`}>
                            <div className="h-4 w-4 rounded-full" style={{ backgroundColor: value }}></div>
                            <div>{ key }</div>
                        </React.Fragment>
                    )) }
                </div>
            </div>
        </div>
    )
}

export default GameGraph;