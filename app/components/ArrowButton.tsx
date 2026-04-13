import { SIDE_COLORS } from "../constants/colors";

interface Props {
    field: string,
    clickedButton: { field: string, dir: -1 | 1}
    onClick: () => void
}

function ArrowButton({ field, clickedButton, onClick }: Props) {

    const arrowDir = clickedButton.field == field && clickedButton.dir == 1 ? 90 : -90;

    return (
        <button className="flex gap-4 items-center justify-center cursor-pointer text-[#848bff]" onClick={onClick}>
            { field[0].toUpperCase() + field.slice(1) }
            <svg className="transition-transform duration-200" viewBox="10 7 5 10" width="10" height="10" fill="currentColor" stroke="currentColor" strokeWidth="1" transform={`rotate(${arrowDir})`}>
                <path d="M15 7L10 12L15 17"></path>
            </svg>
        </button>
    )

}

export default ArrowButton;