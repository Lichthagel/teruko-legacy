import { FunctionComponent } from "preact";

import { Tag as TagModel } from "../models";
import Chip from "./Chip";

const Tag: FunctionComponent<{
  tag: TagModel;
  onClick?: (tag: TagModel) => void;
}> = ({ tag, onClick }) => (
  <Chip
    className="break-all shadow"
    color={tag.category && tag.category.color}
    onClick={() => onClick && onClick(tag)}
  >
    {tag.slug}
  </Chip>
);

export default Tag;
