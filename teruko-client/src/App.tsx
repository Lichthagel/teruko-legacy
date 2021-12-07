import { ChevronDownIcon, ChevronUpIcon, HomeIcon, PlusIcon } from "@heroicons/react/outline";
import { Route, Routes, Link } from "react-router-dom";
import Home from "./routes/index";
import React, { Fragment, lazy, Suspense } from "react";
import IconButton from "./components/IconButton";

const Image = lazy(() => import("./routes/image"));
const EditImage = lazy(() => import("./routes/image/edit"));
const Tag = lazy(() => import("./routes/tag"));
const New = lazy(() => import("./routes/new"));

const App = () =>
    <Fragment>
        <div className="container mx-auto">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path=":id" element={<Suspense fallback={null}><Image /></Suspense>} />
                <Route path=":id/edit" element={<Suspense fallback={null}><EditImage /></Suspense>} />
                <Route path="tag/:slug" element={<Suspense fallback={null}><Tag /></Suspense>} />
                <Route path="new" element={<Suspense fallback={null}><New /></Suspense>} />
            </Routes>
        </div>
        <div className="fixed bottom-3 right-0 left-0 z-30">
            <div className="container mx-auto px-3">
                <div className="flex flex-row ml-auto mr-0 inline-block w-min bg-dark-700 rounded-xl p-1">
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
                    <IconButton
                        onClick={() => {
                            window.scrollTo({ behavior: "smooth", top: 0 });
                        }}>
                        <ChevronUpIcon className="w-10 h-10" />
                    </IconButton>
                    <IconButton onClick={() => {
                        window.scrollTo({ behavior: "smooth", top: window.document.body.scrollHeight });
                    }}>
                        <ChevronDownIcon className="w-10 h-10" />
                    </IconButton>
                </div>
            </div>
        </div>
    </Fragment>;

export default App;