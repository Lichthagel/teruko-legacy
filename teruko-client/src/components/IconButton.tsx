import clsx from "clsx";
import { FunctionComponent, HTMLAttributes } from "react";

const IconButton: FunctionComponent<HTMLAttributes<HTMLDivElement>> = ({ children, ...props }) =>
    <div className={clsx("h-10 w-10 m-1 bg-dark-700 hover:bg-gray-700 rounded transition", { "cursor-pointer": props.onClick }, props.className)} {...props}>
        {children}
    </div>;

export default IconButton;