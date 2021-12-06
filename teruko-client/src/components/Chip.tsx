import clsx from "clsx";
import React, { FunctionComponent, HTMLAttributes } from "react";

interface ChipProps extends HTMLAttributes<HTMLDivElement> {
    color?: string;
    size?: "small" | "normal";
}

const Chip: FunctionComponent<ChipProps> = ({ children, color, size = "normal", className, style, ...props }) =>
    <div
        {...props}
        className={clsx("inline-block rounded m-0.5 whitespace-nowrap text-white px-1 bg-gray-500 filter hover:brightness-70 transition", { "text-sm": size === "small" }, className)}
        style={{ ...style, backgroundColor: color }}>
        {children}
    </div>;

export default Chip;