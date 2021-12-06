import { RefreshIcon } from "@heroicons/react/outline";
import clsx from "clsx";
import { Fragment, FunctionComponent } from "react";

const LoadingIcon: FunctionComponent<{ loading: boolean; className: string }> = ({ children, loading, className }) => {

    if (loading) {
        return <RefreshIcon className={clsx(className, "animate-spin")} />;
    }

    return (
        <Fragment>
            {children}
        </Fragment>
    );

};

export default LoadingIcon;