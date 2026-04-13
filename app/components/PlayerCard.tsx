import { Player } from "@/types/log.types";

interface Props {
    player: Player | null
}

function PlayerCard({ player }: Props) {
    return (
        <div className="m-12 bg-[#3d836c]">
            { player && (
                <div className="grid">
                    {player?.name}
                </div>
            )}
        </div>
    )
}

export default PlayerCard;