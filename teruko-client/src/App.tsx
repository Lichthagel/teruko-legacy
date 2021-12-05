import { ChevronUpIcon, HomeIcon, PlusIcon } from "@heroicons/react/outline";
import { Route, Routes, Link } from "react-router-dom";
import Home from "./routes/index";
import React, { Fragment, lazy, Suspense } from "react";
import { useQuery } from "@apollo/client";
import { GET_IMAGE_COUNT } from "./queries/image";

const Image = lazy(() => import("./routes/image"));
const EditImage = lazy(() => import("./routes/image/edit"));
const Tag = lazy(() => import("./routes/tag"));
const New = lazy(() => import("./routes/new"));

const App = () => {
    const { data: imageCountData } = useQuery(GET_IMAGE_COUNT, { pollInterval: 60000 });

    return <Fragment>
        <div className="container mx-auto">
            <div className="flex flex-row items-center py-3">
                <Link to="/">
                    <HomeIcon className="w-8 h-8" />
                </Link>
                <div className="flex-grow"></div>
                {imageCountData && <div className="mr-3 text-gray-600">{imageCountData.imageCount} images</div>}
                <Link to="/new">
                    <PlusIcon className="w-8 h-8" />
                </Link>
            </div>

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path=":id" element={<Suspense fallback={null}><Image /></Suspense>} />
                <Route path=":id/edit" element={<Suspense fallback={null}><EditImage /></Suspense>} />
                <Route path="tag/:slug" element={<Suspense fallback={null}><Tag /></Suspense>} />
                <Route path="new" element={<Suspense fallback={null}><New /></Suspense>} />
            </Routes>
        </div>
        <div
            className="fixed bottom-3 right-3 cursor-pointer"
            onClick={() => {
                window.scrollTo({ behavior: "smooth", top: 0 });
            } }>
            <ChevronUpIcon className="w-8 h-8" />
        </div>
    </Fragment>;
};

export default App;