import { FunctionComponent } from "preact";
import { Link, To } from "react-router-dom";

import { Image, Tag } from "../models";
import Chip from "./Chip";
import LoaderImage from "./LoaderImage";

const constTrue = () => true;

const ImageCard: FunctionComponent<{
  image: Image;
  url: To;
  filterTags?: (tag: Tag) => boolean;
}> = ({ image, url, filterTags = constTrue }) => (
  <div className="rounded bg-zinc-300 dark:bg-gray-700 mb-1 shadow shadow-indigo-400 dark:shadow-indigo-800 animate__animated animate__fadeInUp">
    <Link to={url}>
      <div className="relative">
        <LoaderImage
          alt={image.title || image.id.toString()}
          className="w-full h-auto block cursor-pointer rounded"
          src={`/img/${image.filename}`}
        />
        {image.title && <div className="px-1 text-sm text-white whitespace-nowrap absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-b from-transparent to-black/80 text-shadow-xl overflow-hidden">{image.title}</div>}
      </div>
    </Link>
    <div className="overflow-x-scroll flex flex-row flex-nowrap scrollbar-none snap snap-x">
      {image.tags.filter((tag) => !tag.slug.startsWith("artist_") && filterTags(tag)).map((tag) => (
        <Link className="snap-start" key={`${image.id}${tag.slug}`} to={`/tag/${encodeURIComponent(tag.slug)}`}>
          <Chip color={tag.category && tag.category.color} size="small">
            {tag.slug}
          </Chip>
        </Link>
      ))}
    </div>
  </div>
);

export default ImageCard;
