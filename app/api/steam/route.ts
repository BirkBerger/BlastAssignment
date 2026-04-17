import { SteamInfo } from "@/types/steam.types";
import { NextRequest, NextResponse } from "next/server";

const STEAM_API_BASE_URL = "https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v2/";

export async function GET(req: NextRequest): Promise<NextResponse<{ data: SteamInfo | null }>> {
    try {

        const id = req.nextUrl.searchParams.get('id');
        if (!id) return NextResponse.json({ data: null }, { status: 400, statusText: "Player ID missing in request."});

        if(!process.env.STEAM_API_KEY) {
            console.warn("Missing Steam Api-key.");
            return NextResponse.json({ data: null }, { status: 200, statusText: "Fetched no Steam player." });
        }

        const res = await fetch(`${STEAM_API_BASE_URL}?key=${process.env.STEAM_API_KEY}&steamids=${id}`, {
            next: { revalidate: 3600 } // cache for 1 hour
        });
        const data = await res?.json();

        if (!res || !data) return NextResponse.json({ data: null }, { status: 500, statusText: "Failed to fetch Steam player." });

        const player = data.response.players[0];
        const steamInfo: SteamInfo = {
            playerName: player.personaname,
            playerAvatar: player.avatarfull,
            playerSteamUrl: player.profileurl
        }

        return NextResponse.json({ data: steamInfo }, { status: 200, statusText: "Succesfully fetched Steam player." });

    } catch (err) {
        console.error(err);
        return NextResponse.json({ data: null }, { status: 500, statusText: "Failed to fetch Steam player." })
    }
}