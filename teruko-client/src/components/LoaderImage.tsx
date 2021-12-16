import clsx from "clsx";
import { FunctionComponent, JSX } from "preact";
import { useState } from "preact/hooks";

const LoaderImage: FunctionComponent<JSX.HTMLAttributes<HTMLImageElement>> = ({ className, ...props }) => {
    const [loaded, setLoaded] = useState(false);
    return (
        <div className={clsx("relative", { "min-h-80": !loaded })}>
            <div className="w-full block bg-dark-900 absolute inset-0 h-full animate-pulse z-0" />
            <img {...props} className={clsx(className, "relative transition-opacity z-10", { "opacity-0": !loaded })} onLoad={() => setLoaded(true)} />
        </div>);
};

export default LoaderImage;