'use client'

import { HitgroupShots } from "@/types/log.types";
import React, { useState } from "react";
import { FONT_SIZE } from "../constants/font-size";
import { THEME_COLORS } from "../constants/colors";

type Hitgroup = "head" | "neck" | "chest" | "stomach" | "left arm" | "right arm" | "left leg" | "right leg" | "generic";

interface ShotArea {
    label: string,
    shots: number,
    diameter: number,
    left: number,
    top: number
}

interface Props {
    hitgroupShots: HitgroupShots;
}

function HitgroupChart( { hitgroupShots }: Props ) {

    const [areaHovered, setAreaHovered] = useState<number>(-1);

    const shotsToDiameter = (hitgroup: Hitgroup): number => {
        const shots = getShots(hitgroup);

        if (shots == 0) return 0;
        if (shots < 2) return 10;
        if (shots < 4) return 20;
        if (shots < 8) return 25;
        if (shots < 12) return 30;
        if (shots < 16) return 35;
        if (shots < 20) return 40;
        if (shots < 25) return 45;
        if (shots < 30) return 50;
        if (shots >= 30) return 55;
        return 0;
    };

    const getShots = (parsedHitgroup: string): number => {
        const damage = hitgroupShots[parsedHitgroup];
        return damage || 0;
    }

    const shotAreas: ShotArea[] = [
        { label: "Head", shots: getShots("head"), left: 38, top: 6, diameter: shotsToDiameter("head") },
        { label: "Neck", shots: getShots("neck"), left: 45, top: 16, diameter: shotsToDiameter("neck") },
        { label: "Chest", shots: getShots("chest"), left: 35, top: 24, diameter: shotsToDiameter("chest") },
        { label: "Stomach", shots: getShots("stomach"), left: 50, top: 35, diameter: shotsToDiameter("stomach") },
        { label: "Left arm", shots: getShots("left arm"), left: 10, top: 37, diameter: shotsToDiameter("left arm") },
        { label: "Right arm", shots: getShots("right arm"), left: 74, top: 40, diameter: shotsToDiameter("right arm") },
        { label: "Left leg", shots: getShots("left leg"), left: 32, top: 62, diameter: shotsToDiameter("left leg") },
        { label: "Right leg", shots: getShots("right leg"), left: 67, top: 75, diameter: shotsToDiameter("right leg") },
    ]

    const shootGradient = "radial-gradient(circle, #e83a3af0 4%, rgba(255, 97, 97, 0) 14%, #ff5c5c 21%, rgba(230, 69, 69, 0) 30%, #ff5454 42%, rgba(255, 94, 94, 0) 58%)";
    const shootGradientHover = "radial-gradient(circle, #ec7878f0 4%, rgba(255, 97, 97, 0) 14%, #e0a0a0 21%, rgba(230, 69, 69, 0) 30%, #f59393 42%, rgba(255, 94, 94, 0) 58%)";

    return (
        <div className="h-full min-h-0 flex items-center justify-center pointer-events-none">
            <div className="relative w-full max-w-[250px]">
                <img className="object-contain" src="/soldier_phoenix.png"
                    alt="Illustration of how player's shots are split across hitgroups.">
                </img>
                { shotAreas.map((area, i) => (
                    <React.Fragment key={`area_${i}`}>
                        <div className="absolute pointer-events-auto cursor-pointer aspect-square"
                            style={{
                                left: `${area.left}%`, top: `${area.top}%`, width: `${area.diameter}%`,
                                transform: 'translate(-50%, -50%)',
                                background: areaHovered == i ? shootGradientHover : shootGradient }}
                            onMouseEnter={() => setAreaHovered(i)}
                            onMouseLeave={() => setAreaHovered(-1)}>
                        </div>
                        { areaHovered == i && (
                            <div className="absolute bg-white text-nowrap text-sm px-2 rounded-md animate-fadeIn" style={{ left: `${area.left}%`, top: `${area.top - 3}%`}}>
                                <span className="font-normal">{area.label} </span>
                                {area.shots}
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
        </div>
    )
}

export default HitgroupChart;