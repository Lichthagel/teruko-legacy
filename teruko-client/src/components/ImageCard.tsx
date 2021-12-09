import React, { FunctionComponent } from "react";
import LoaderImage from "./LoaderImage";
import { Image, Tag } from "../models";
import Chip from "./Chip";
import { Link, To } from "react-router-dom";

const ImageCard: FunctionComponent<{
    image: Image;
    url: To;
    filterTags?: (tag: Tag) => boolean;
}> = ({ image, url, filterTags = () => true }) =>
    <div className="rounded bg-gray-700 mb-1 animated animate-fade-in-up">
        <Link to={url}>
            <div className="relative">
                <LoaderImage
                    src={`http://${window.location.hostname}:3030/img/${image.filename}`}
                    alt={image.title || image.id.toString()}
                    className="w-full h-auto block cursor-pointer rounded" />
                {image.title && <div className="px-1 text-sm text-white whitespace-nowrap absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-b from-transparent to-black/80 text-shadow-xl overflow-hidden">{image.title}</div>}
            </div>
        </Link>
        <div className="overflow-x-scroll flex flex-row flex-nowrap scrollbar-none snap snap-x">
            {image.tags.filter(tag => !tag.slug.startsWith("artist_") && filterTags(tag)).map(tag =>
                <Link key={image.id + tag.slug} to={`/tag/${encodeURIComponent(tag.slug)}`} className="snap-start">
                    <Chip color={tag.category && tag.category.color} size="small">
                        {tag.slug}
                    </Chip>
                </Link>)}
        </div>
    </div>;

export default ImageCard;