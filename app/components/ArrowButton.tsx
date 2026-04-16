import React from "react";

interface Props {
    field: string,
    clickedButton: { field: string, dir: -1 | 1}
    onClick: () => void
}

function ArrowButton({ field, clickedButton, onClick }: Props) {

    const arrowDir = clickedButton.field == field && clickedButton.dir == 1 ? 90 : -90;

    return (
        <button className="flex gap-2 items-center justify-center cursor-pointer font-bold" onClick={onClick}>
            { field[0].toUpperCase() }
            <svg className="transition-transform duration-200" viewBox="10 7 5 10" width="10" height="10" fill="currentColor" stroke="currentColor" strokeWidth="1" transform={`rotate(${arrowDir})`}>
                <path d="M15 7L10 12L15 17"></path>
            </svg>
        </button>
    )

}

export default ArrowButton;