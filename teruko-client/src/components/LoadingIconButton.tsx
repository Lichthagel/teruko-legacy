import { RefreshIcon } from "@heroicons/react/outline";
import clsx from "clsx";
import { FunctionComponent, HTMLAttributes } from "react";

const LoadingIconButton: FunctionComponent<{ loading: boolean } & HTMLAttributes<HTMLDivElement>> = ({ loading, children, ...props }) => {
    if (loading) {
        return <div className={clsx("h-10 w-10 m-1 hover:bg-black/20 rounded transition", { "cursor-pointer": props.onClick }, props.className)} {...props}>
            <RefreshIcon className="animate-spin" />
        </div>;
    }

    return <div className={clsx("h-10 w-10 m-1 hover:bg-black/20 rounded transition", { "cursor-pointer": props.onClick }, props.className)} {...props}>
        {children}
    </div>;
};

export default LoadingIconButton;