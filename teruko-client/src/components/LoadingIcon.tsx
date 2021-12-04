import { RefreshIcon } from "@heroicons/react/outline";
import classNames from "classnames";
import { Fragment, FunctionComponent } from "react";

const LoadingIcon: FunctionComponent<{ loading: boolean; className: string }> = ({ children, loading, className }) => {

    if (loading) {
        return <RefreshIcon className={classNames(className, "animate-spin")} />;
    }

    return (
        <Fragment>
            {children}
        </Fragment>
    );

};

export default LoadingIcon;