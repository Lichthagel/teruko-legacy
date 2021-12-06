import clsx from "clsx";
import { FunctionComponent, useState } from "react";

const LoaderImage: FunctionComponent<React.DetailedHTMLProps<React.ImgHTMLAttributes<HTMLImageElement>, HTMLImageElement>> = (props) => {
    const [loaded, setLoaded] = useState(false);

    const { className } = props;

    return (
        <div className="relative">
            <div className="w-full block bg-gray-700 absolute inset-0 h-full animate-pulse z-0" />
            <img {...props} className={clsx(className, "relative transition-opacity z-10", { "opacity-0": !loaded })} onLoad={() => setLoaded(true)} />
        </div>);
};

export default LoaderImage;