import { ChevronUpIcon, HomeIcon, PlusIcon } from "@heroicons/react/outline";
import { Route, Routes, Link } from "react-router-dom";
import Home from "./routes/index";
import React, { Fragment } from "react";
import Image from "./routes/image";
import EditImage from "./routes/image/edit";
import Tag from "./routes/tag";
import New from "./routes/new";
import { useQuery } from "@apollo/client";
import { GET_IMAGE_COUNT } from "./queries/image";

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
                <Route path=":id" element={<Image />} />
                <Route path=":id/edit" element={<EditImage />} />
                <Route path="tag/:slug" element={<Tag />} />
                <Route path="new" element={<New />} />
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