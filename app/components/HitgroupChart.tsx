'use client'

import { HitgroupShots } from "@/types/log.types";
import React, { useState } from "react";
import { FONT_SIZE } from "../constants/font-size";

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
        { label: "Head", shots: getShots("head"), left: 36, top: 2, diameter: shotsToDiameter("head") },
        { label: "Neck", shots: getShots("neck"), left: 45, top: 15, diameter: shotsToDiameter("neck") },
        { label: "Chest", shots: getShots("chest"), left: 35, top: 22, diameter: shotsToDiameter("chest") },
        { label: "Stomach", shots: getShots("stomach"), left: 45, top: 33, diameter: shotsToDiameter("stomach") },
        { label: "Left arm", shots: getShots("left arm"), left: 10, top: 35, diameter: shotsToDiameter("left arm") },
        { label: "Right arm", shots: getShots("right arm"), left: 70, top: 40, diameter: shotsToDiameter("right arm") },
        { label: "Left leg", shots: getShots("left leg"), left: 28, top: 62, diameter: shotsToDiameter("left leg") },
        { label: "Right leg", shots: getShots("right leg"), left: 67, top: 75, diameter: shotsToDiameter("right leg") },
    ]

    return (
        <div className="w-full h-full flex flex-col justify-between">
            <div className="max-w-[80%] self-center relative pointer-events-none">
                <img className="object-contain" src="/soldier_phoenix.png"
                    alt="Illustration of how player's shots are split across hitgroups.">
                </img>
                { shotAreas.map((area, i) => (
                    <React.Fragment key={`area_${i}`}>
                        <div className="absolute rounded-full pointer-events-auto cursor-pointer" 
                            style={{ left: `${area.left}%`, top: `${area.top}%`, width: area.diameter, height: area.diameter, background: `radial-gradient(circle, ${areaHovered == i ? "gold" : "red"} 40%, transparent 70%` }}
                            onMouseEnter={() => setAreaHovered(i)}
                            onMouseLeave={() => setAreaHovered(-1)}>
                        </div>
                        { areaHovered == i && (
                            <div className="absolute bg-[#e6e6e6] text-black text-nowrap text-sm px-2 rounded-md animate-fadeIn" style={{ left: `${area.left}%`, top: `${area.top - 3}%`}}>
                                {area.label} <strong>{area.shots}</strong>
                            </div>
                        )}
                    </React.Fragment>
                ))}
            </div>
            <div className={FONT_SIZE.sm}>
                Unspecified shots <strong>{ getShots("generic") }</strong>
            </div>
        </div>
    )
}

export default HitgroupChart;