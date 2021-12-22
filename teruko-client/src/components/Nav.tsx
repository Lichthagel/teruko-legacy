import { HomeIcon, PlusIcon } from "@heroicons/react/outline";
import clsx from "clsx";
import { FunctionComponent } from "preact";
import { Link, useSearchParams } from "react-router-dom";
import useIsImageView from "../hooks/useIsImageView";
import IconButton from "./IconButton";

const Nav: FunctionComponent = () => {

    const [searchParams] = useSearchParams();
    const isImageView = useIsImageView();

    return <div className={clsx("left-0 right-0 top-0 z-50 mb-2 shadow-indigo-700/50  border-indigo-700 transition hover:opacity-100", { "fixed bg-transparent": isImageView, "sticky bg-neutral-100 dark:bg-neutral-900 shadow border-b": !isImageView })}>
        <div className="container mx-auto flex flex-col md:flex-row items-center">
            <div className={clsx("pointer-events-auto flex flex-row items-center w-min p-1 rounded", { "bg-neutral-100/70 dark:bg-neutral-900/70": isImageView })}>
                <Link to={{ pathname: "/", search: `?${searchParams.toString()}` }}> {/* TODO only tags and sort */}
                    <IconButton>
                        <HomeIcon className="w-10 h-10" />
                    </IconButton>
                </Link>
                <Link to="/new">
                    <IconButton>
                        <PlusIcon className="w-10 h-10" />
                    </IconButton>
                </Link>
            </div>
            <div id="navContent" className="flex-grow"></div>
        </div>
    </div>;
};
export default Nav;