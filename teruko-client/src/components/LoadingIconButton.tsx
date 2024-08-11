import { ArrowPathIcon } from "@heroicons/react/24/outline";
import clsx from "clsx";
import { FunctionComponent, JSX } from "preact";

type LoadingIconButtonProps = {
    loading: boolean;
} & Omit<JSX.HTMLAttributes<HTMLDivElement>, "loading">

const LoadingIconButton: FunctionComponent<LoadingIconButtonProps> = ({ loading, children, ...props }) => {
    if (loading) {
        return <div className={clsx("h-10 w-10 m-1 hover:bg-black/20 rounded transition", { "cursor-pointer": props.onClick }, props.className)} {...props}>
            <ArrowPathIcon className="animate-spin" />
        </div>;
    }

    return <div className={clsx("h-10 w-10 m-1 hover:bg-black/20 rounded transition", { "cursor-pointer": props.onClick }, props.className)} {...props}>
        {children}
    </div>;
};

export default LoadingIconButton;