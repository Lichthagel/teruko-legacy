import clsx from "clsx";
import { FunctionComponent, JSX } from "preact";

type ChipProps = {
    color?: string;
    size?: "small" | "normal";
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, "size">

// eslint-disable-next-line react/prop-types
const Chip: FunctionComponent<ChipProps> = ({ children, color, size = "normal", className, style, ...props }) =>
    <div
        {...props}
        className={clsx(
            "inline-block rounded m-0.5 whitespace-nowrap text-white bg-gray-500 hover:brightness-75 transition select-none",
            {
                "text-sm px-1": size === "small",
                "py-1 px-2": size === "normal",
                "cursor-pointer": props.onClick
            },
            className
        )}
        style={{ ...(style as JSX.CSSProperties), backgroundColor: color }}>
        {children}
    </div>;

export default Chip;