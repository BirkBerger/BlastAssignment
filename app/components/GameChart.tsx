'use client'

import { GameData } from "@/types/log.types";
import React, { useEffect, useState } from "react";
import { SIDE_COLORS, TEAM_COLORS, TEAM_COLORS_DARK } from "../constants/colors";

interface Props {
    data: GameData;
}

class Point {
    x: number = 0;
    y: number = 0;
    color: string = SIDE_COLORS.CT;
    yLabel: string = "";

    constructor(planeHeight: number) {
        this.y = planeHeight;
    }
}

class Chart {
    points: Point[] = [];
    color: string = "";

    constructor(color: string, firstPoint?: Point) {
        this.color = color;
        if (firstPoint) this.points.push(firstPoint);
    }
}

function GameChart( { data }: Props) {

    const [gridGraph, setGridGraph] = useState<Chart>();
    const [scoreGraphs, setScoreGraphs] = useState<Chart[]>([]);
    const [purchaseGraphs, setPurchaseGraphs] = useState<Chart[]>([]);
    const [barHoverIdx, setBarHoverIdx] = useState({graph: -1, point: -1});

    const gridColor = "#585858";
    const axisLabelColor = "#d5d5d5";
    
    useEffect(() => {
        const chartWidth = Math.min((window.innerWidth / 100) * 70, 1000);
        const chartHeight = 500;
        initChart(chartWidth, chartHeight);
    }, []);

    const initChart = (planeWidth: number, planeHeight: number) => {
        const scoreGraphs = Array.from({ length: 2 }, (_, i) => 
            new Chart(TEAM_COLORS[i], new Point(planeHeight))
        );
        const purchaseBars = Array.from({ length: 2 }, (_, i) =>
            new Chart(TEAM_COLORS_DARK[i])
        );

        // Scale data to chart size
        const totalGameTime = data.rounds.reduce((acc, round) => acc + round.duration, 0);
        const maxWins = Math.max(...data.rounds[data.rounds.length-1].status.score);
        const maxMoneySpend = data.rounds.reduce((acc, round) => {
            const maxTeamSpending = Math.max(...round.status.moneySpend);
            return acc > maxTeamSpending ? acc : maxTeamSpending;
        }, 0);

        const oneX = planeWidth / totalGameTime;
        const oneYLeft = planeHeight / maxWins; 
        const oneYRight = planeHeight / maxMoneySpend;
        let x = 0;

        // Build chart
        data.rounds.forEach((round) => {
            // Draw bars at the beginning of round
            purchaseBars.forEach((graph, j) => {
                const moneySpend = round.status.moneySpend[j];
                graph.points.push({
                    x,
                    y: planeHeight - oneYRight * moneySpend,
                    yLabel: `$${moneySpend}`,
                    color: round.status.teamSides[0] == j ? SIDE_COLORS.CT : SIDE_COLORS.TERRORIST
                })
            })
            // Draw graph points at the end of round
            x += (oneX * round.duration);
            scoreGraphs.forEach((graph, j) => {
                const score = round.status.score[j];
                graph.points.push({
                    x,
                    y: planeHeight - oneYLeft * score,
                    color: round.status.teamSides[0] == j ? SIDE_COLORS.CT : SIDE_COLORS.TERRORIST,
                    yLabel: score ? score.toString() : "",
                })
            })
        })

        setGridGraph(scoreGraphs[0]);
        setScoreGraphs(scoreGraphs);
        setPurchaseGraphs(purchaseBars);
    }

    return (
        <div>
            <div className="h-[500px] w-[70%] max-w-[1000px] relative my-12 ml-16 mr-auto">
                <svg className="w-full h-full absolute overflow-visible pointer-events-none">
                    {/* Grid lines */}
                    { gridGraph && gridGraph.points.map((point, j) => (
                        <g key={`gridline_${j}`}>
                            <line
                                x1={point.x}
                                x2={point.x}
                                y1={gridGraph.points[0].y}
                                y2={gridGraph.points[gridGraph.points.length-1].y}
                                stroke={gridColor}
                                strokeWidth="1"
                            ></line>
                            <line
                                x1={gridGraph.points[0].x}
                                x2={gridGraph.points[gridGraph.points.length-1].x}
                                y1={point.y}
                                y2={point.y}
                                stroke={gridColor}
                                strokeWidth="1"
                            ></line>
                        </g>
                    ))}
                    { purchaseGraphs.length > 0 && purchaseGraphs.map((graph, i) => (
                        <g key={`purchase_graph_bars_${i}`}>
                            { graph.points.map((point, j) => (
                                <React.Fragment key={`purchase_bars_${i}_${j}`}>
                                    {/* Purchase bars */}
                                    <line className="hover:stroke-[#e6e6e6] pointer-events-auto cursor-pointer"
                                        x1={point.x + 2 + (4 * i)}
                                        x2={point.x + 2 + (4 * i)}
                                        y1="100%"
                                        y2={point.y}
                                        stroke={graph.color}
                                        strokeWidth={4}
                                        onMouseEnter={() => setBarHoverIdx({graph: i, point: j})}
                                        onMouseLeave={() => setBarHoverIdx({graph: -1, point: -1})}
                                    ></line>
                                </React.Fragment >
                            ))}
                        </g>
                    ))}
                    { scoreGraphs.length > 0 && scoreGraphs.map((graph, i) => (
                        <g key={`score_graph_curves_${i}`}>
                            { graph.points.map((point, j) => (
                                <React.Fragment key={`score_curve_${i}_${j}`}>
                                    {/* Graph curve */}
                                    { j < graph.points.length-1 && (
                                        <line
                                            x1={graph.points[j+1].x}
                                            x2={point.x}
                                            y1={graph.points[j+1].y}
                                            y2={point.y}
                                            stroke={graph.color}
                                            strokeWidth="2"
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
                                            fontSize="clamp(8px, 1vw, 10px)"
                                            textAnchor="middle">
                                            {j}
                                        </text>
                                    )}
                                    {/* Curve labels */}
                                    { j == graph.points.length - 1 && (
                                        <g>
                                            <text
                                                x={point.x + 15}
                                                y={point.y}
                                                fill={graph.color}
                                                fontSize="clamp(10px, 2.3vw, 25px)"
                                                dominantBaseline="middle">
                                                {data.teamNames[i]}
                                            </text>
                                            <text
                                                x={point.x + 15}
                                                y={point.y - 18}
                                                fill="#96dafe"
                                                fontSize="clamp(9px, 1.5vw, 20px)">
                                                {point.y == 0 ? "Game winner" : "Game loser"}
                                            </text>
                                        </g>
                                    )}
                                    {/* Y-axis labels */}
                                    <text
                                        x={-14}
                                        y={point.y}
                                        fill={axisLabelColor}
                                        fontSize="12"
                                        textAnchor="middle"
                                        dominantBaseline="middle">
                                        { point.yLabel }
                                    </text>
                                </React.Fragment>
                            ))}
                        </g>
                    ))}
                    { purchaseGraphs.length > 0 && purchaseGraphs.map((graph, i) => (
                        <g key={`purchase_graph_label_${i}`}>
                            { graph.points.map((point, j) => (
                                <g key={`purchase_label_${i}_${j}`}>
                                    {/* Bar labels */}
                                    { barHoverIdx.graph == i && barHoverIdx.point == j && (
                                        <g>
                                            <rect
                                                x={point.x - (point.yLabel.length * 10) / 2 + 2 + (4 * i)}
                                                y={point.y - 11}
                                                width={point.yLabel.length * 10}
                                                height={20}
                                                fill="#e6e6e6"
                                                rx={5}
                                            />
                                            <text
                                                x={point.x + 2 + (4 * i)}
                                                y={point.y}
                                                fontSize={14}
                                                fill="black"
                                                textAnchor="middle"
                                                dominantBaseline="middle">
                                                {point.yLabel}
                                            </text>
                                        </g>
                                    )}
                                </g>
                            ))}
                        </g>
                    ))}
                    <g>
                        <text
                            x="-40"
                            y="50%"
                            fill={axisLabelColor}
                            fontSize="14px"
                            dominantBaseline="middle"
                            textAnchor="middle"
                            writingMode="vertical-rl">
                            Score
                        </text>
                        <text
                            x="50%"
                            y="108%"
                            fill={axisLabelColor}
                            fontSize="14px"
                            textAnchor="middle"
                            dominantBaseline="middle">
                            Rounds
                        </text>
                    </g>
                </svg>
            </div>
            <div className="flex ml-15">
                <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-1 items-center">
                    { Object.entries(SIDE_COLORS).map(([key, value], i) => (
                        <React.Fragment key={`side_color_${i}`}>
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: value }}></div>
                            <div>{ key }</div>
                        </React.Fragment>
                    )) }
                </div>
            </div>
        </div>
    )
}

export default GameChart;