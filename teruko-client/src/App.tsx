import { ChevronDownIcon, ChevronUpIcon, HomeIcon, PlusIcon } from "@heroicons/react/outline";
import { Route, Routes, Link, useMatch } from "react-router-dom";
import Home from "./routes/index";
import React, { Fragment, lazy, Suspense, useEffect, useState } from "react";
import IconButton from "./components/IconButton";
import clsx from "clsx";

const Image = lazy(() => import("./routes/image"));
const EditImage = lazy(() => import("./routes/image/edit"));
const Tag = lazy(() => import("./routes/tag"));
const New = lazy(() => import("./routes/new"));

const App = () => {
    const isImageView = useMatch(":id");

    const [showToTop, setShowToTop] = useState(false);
    const [showToBottom, setShowToBottom] = useState(true);

    useEffect(() => {
        const scrollListener = () => {
            const pos = window.scrollY;
            if (pos > 50) {
                setShowToTop(true);
            } else {
                setShowToTop(false);
            }

            if (pos + window.innerHeight < document.body.scrollHeight - 50) {
                setShowToBottom(true);
            } else {
                setShowToBottom(false);
            }
        };

        window.addEventListener("scroll", scrollListener);

        return () => {
            window.removeEventListener("scroll", scrollListener);
        };
    }, []);

    return <Fragment>
        <div className="fixed top-2 right-0 left-0 z-20 pointer-events-none">
            <div className="container mx-auto px-3">
                <div className={clsx("pointer-events-auto flex flex-row inline-block items-center w-min bg-dark-500 rounded-xl p-1 transition hover:opacity-100", { "opacity-20": isImageView })}>
                    <Link to="/">
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
            </div>
        </div>
        <div className="container mx-auto">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path=":id" element={<Suspense fallback={"..."}><Image /></Suspense>} />
                <Route path=":id/edit" element={<Suspense fallback={"..."}><EditImage /></Suspense>} />
                <Route path="tag/:slug" element={<Suspense fallback={"..."}><Tag /></Suspense>} />
                <Route path="new" element={<Suspense fallback={"..."}><New /></Suspense>} />
            </Routes>
        </div>
        <div className="fixed bottom-3 right-0 left-0 z-10 pointer-events-none">
            <div className="container mx-auto px-3">
                <div className={clsx("pointer-events-auto flex flex-row ml-auto mr-0 inline-block w-min bg-dark-500 rounded-xl p-1 transition hover:opacity-100", { "opacity-20": isImageView })}>
                    <IconButton
                        hidden={!showToTop}
                        onClick={() => {
                            window.scrollTo({ behavior: "smooth", top: 0 });
                        } }>
                        <ChevronUpIcon className="w-10 h-10" />
                    </IconButton>
                    <IconButton
                        hidden={!showToBottom}
                        onClick={() => {
                            window.scrollTo({ behavior: "smooth", top: window.document.body.scrollHeight });
                        } }>
                        <ChevronDownIcon className="w-10 h-10" />
                    </IconButton>
                </div>
            </div>
        </div>
    </Fragment>;
};

export default App;