import { SteamInfo } from "../../types/steam.types";

class SteamService {

    private cache: { [ id: string]: SteamInfo } = {};

    public async getPlayerInfo(id: string): Promise<SteamInfo | null> {
        if (this.cache[id]) return this.cache[id];

        return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/steam?id=${id}`)
        .then((res: Response) => res.json())
        .then((resJson) => {
            const steamInfo = resJson.data;
            if (steamInfo) this.cache[id] = steamInfo;
            return steamInfo;
        })
        .catch((err) => {
            console.error(err);
            return null;
        })
    }
}

export default new SteamService();