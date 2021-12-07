import clsx from "clsx";
import React, { FunctionComponent, HTMLAttributes } from "react";

interface ChipProps extends HTMLAttributes<HTMLDivElement> {
    color?: string;
    size?: "small" | "normal";
}

const Chip: FunctionComponent<ChipProps> = ({ children, color, size = "normal", className, style, ...props }) =>
    <div
        {...props}
        className={clsx(
            "inline-block rounded m-0.5 whitespace-nowrap text-white bg-gray-500 filter hover:brightness-70 transition",
            {
                "text-sm px-1": size === "small",
                "py-1 px-2": size === "normal",
                "cursor-pointer": props.onClick
            },
            className
        )}
        style={{ ...style, backgroundColor: color }}>
        {children}
    </div>;

export default Chip;