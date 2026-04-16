'use client'

import { GameData } from "@/types/log.types";
import React, { useEffect, useRef, useState } from "react";
import { SIDE_COLORS, TEAM_COLORS, TEAM_COLORS_DARK, THEME_COLORS } from "../constants/colors";
import { FONT_SIZE } from "../constants/font-size";
import TeamLogo from "./TeamLogo";

interface Props {
    data: GameData;
}

class Point {
    x: number = 0;
    y: number = 0;
    color?: string = SIDE_COLORS.CT;
    yLabel?: string = "";

    constructor(planeHeight: number) {
        this.y = planeHeight;
    }
}

function GameChart( { data }: Props) {

    const containerRef = useRef<HTMLDivElement>(null);
    const [gridGraph, setGridGraph] = useState<Point[]>();
    const [scoreGraphs, setScoreGraphs] = useState<[Point[], Point[]]>([[],[]]);
    const [purchaseGraphs, setPurchaseGraphs] = useState<[Point[], Point[]]>([[],[]]);
    const [barHoverIdx, setBarHoverIdx] = useState({graph: -1, point: -1});
    const [turningPoint, setTurningPoint] = useState<Point | null>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            const { width, height } = entries[0].contentRect;
            initChart(width, height);
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    const initChart = (planeWidth: number, planeHeight: number) => {
        const scoreGraphs: [Point[], Point[]] = [[ new Point(planeHeight)],[ new Point(planeHeight)]];
        const purchaseBars: [Point[], Point[]] = [[],[]];
        let turningPoint: Point | null = null;

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
            // Set turning point
            const hasTeamSidesChanged = round.status.teamSides[0] == 1;
            if (!turningPoint && hasTeamSidesChanged) {
                turningPoint = { x, y: planeHeight };
            }

            // Draw bars at the beginning of round
            purchaseBars.forEach((graph, j) => {
                const moneySpend = round.status.moneySpend[j];
                graph.push({
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
                graph.push({
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
        setTurningPoint(turningPoint)
    }

    return (
        <div className="rounded-[15] py-8 px-10 flex flex-col gap-8" style={{backgroundColor: THEME_COLORS[0]}}>
            <div className={FONT_SIZE.lg}>
                Bang for Your Buck
            </div>
            <div ref={containerRef} className="h-[500px] relative mx-8 rounded-[15] rounded-tr-none" style={{backgroundColor: THEME_COLORS[1]}}>
                <svg className="w-full max-w-full h-full absolute overflow-visible pointer-events-none">
                    <defs>
                        {/* Bar animation */}
                        <clipPath id="bar-reveal">
                            <rect x="-100%" y="100%" width="200%" height="100%">
                                <animate
                                    attributeName="y"
                                    from="100%"
                                    to="0%"
                                    dur="1.5s"
                                    calcMode="spline"
                                    keyTimes="0;1"
                                    keySplines="0.4 0 0.2 1"
                                    fill="freeze"
                                />
                            </rect>
                        </clipPath>
                    </defs>
                    {/* Grid lines */}
                    { gridGraph && gridGraph.map((point, j) => (
                        <line key={`gridline_${j}`} className="opacity-30"
                            x1={point.x}
                            x2={point.x}
                            y1={gridGraph[0].y}
                            y2={gridGraph[gridGraph.length-1].y}
                            stroke={THEME_COLORS[0]}
                            strokeWidth="1"
                        ></line>
                    ))}
                    {/* Turning point line */}
                    { turningPoint && (
                        <line className="animate-fadeIn"
                            x1={turningPoint?.x}
                            x2={turningPoint?.x}
                            y1="100%"
                            y2="0"
                            strokeDasharray="8 6"
                            stroke={THEME_COLORS[3]}
                            strokeWidth="2"
                        ></line>
                    )}
                    { purchaseGraphs.length > 0 && purchaseGraphs.map((graph, i) => (
                        <g key={`purchase_graph_bars_${i}`}>
                            { graph.map((point, j) => (
                                <React.Fragment key={`purchase_bars_${i}_${j}`}>
                                    {/* Purchase bars */}
                                    <line clipPath="url(#bar-reveal)" className="hover:stroke-white pointer-events-auto cursor-pointer  opacity-60"
                                        x1={point.x + 3 + (6 * i)}
                                        x2={point.x + 3 + (6 * i)}
                                        y1="100%"
                                        y2={point.y}
                                        stroke={point.color}
                                        strokeWidth="0.5vw"
                                        onMouseEnter={() => setBarHoverIdx({graph: i, point: j})}
                                        onMouseLeave={() => setBarHoverIdx({graph: -1, point: -1})}
                                    ></line>
                                </React.Fragment >
                            ))}
                        </g>
                    ))}
                    { scoreGraphs.length > 0 && scoreGraphs.map((graph, i) => (
                        <g key={`score_graph_curves_${i}`}>
                            { graph.map((point, j) => (
                                <React.Fragment key={`score_curve_${i}_${j}`}>
                                    {/* Graph curve */}
                                    { j < graph.length-1 && (
                                        <line className="animate-slowFadeIn"
                                            x1={graph[j+1].x}
                                            x2={point.x}
                                            y1={graph[j+1].y}
                                            y2={point.y}
                                            stroke="white"
                                            strokeWidth="2"
                                        ></line>
                                    )}
                                    {/* Graph points */}
                                    { j > 0 && (point.y < graph[j-1].y) && (
                                        <circle className="animate-slowFadeIn"
                                            cx={point.x}
                                            cy={point.y}
                                            r={8}
                                            fill={point.color}
                                        />
                                    ) }
                                    {/* X-axis ticks */}
                                    { j > 0 && (
                                        <text
                                            x={point.x - ((point.x - graph[j-1].x) / 2)}
                                            y={graph[0].y + 20}
                                            fill={THEME_COLORS[3]}
                                            fontSize="clamp(8px, 1vw, 10px)"
                                            textAnchor="middle">
                                            {j}
                                        </text>
                                    )}
                                    {/* Curve labels */}
                                    { j == graph.length - 1 && (
                                        <foreignObject x={point.x + 10} y={point.y - 10} width={35} height={30}>
                                            <TeamLogo name={data.teamNames[i]} />
                                        </foreignObject>
                                    )}
                                    {/* Y-axis ticks */}
                                    <text
                                        x={-14}
                                        y={point.y}
                                        fontSize="12"
                                        fill={THEME_COLORS[3]}
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
                            { graph.map((point, j) => (
                                <g key={`purchase_label_${i}_${j}`}>
                                    {/* Bar tooltip */}
                                    { barHoverIdx.graph == i && barHoverIdx.point == j && point.yLabel && (
                                        <g>
                                            <rect
                                                x={point.x - (point.yLabel.length * 10) / 2 + 2 + (4 * i)}
                                                y={point.y - 11}
                                                width={point.yLabel.length * 10}
                                                height={20}
                                                fill="white"
                                                rx={5}
                                            />
                                            <text
                                                x={point.x + 2 + (4 * i)}
                                                y={point.y}
                                                fontSize={14}
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
                    {/* Axis legends */}
                    <g className="animate-fadeIn">
                        <text
                            x="-40"
                            y="50%"
                            fontSize="14px"
                            fill={THEME_COLORS[3]}
                            dominantBaseline="middle"
                            textAnchor="middle"
                            writingMode="vertical-rl">
                            Score
                        </text>
                        <text
                            x="50%"
                            y="108%"
                            fontSize="14px"
                            fill={THEME_COLORS[3]}
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
                            <div>{ key } win</div>
                        </React.Fragment>
                    )) }
                </div>
            </div>
        </div>
    )
}

export default GameChart;