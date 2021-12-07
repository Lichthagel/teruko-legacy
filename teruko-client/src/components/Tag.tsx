import React, { FunctionComponent } from "react";
import { Tag as TagModel } from "../models";
import Chip from "./Chip";

const Tag: FunctionComponent<{
    tag: TagModel;
    onClick?: (tag: TagModel) => void;
}> = ({ tag, onClick }) =>
    <Chip
        color={tag.category && tag.category.color}
        onClick={() => onClick && onClick(tag)}
        className="break-all">{tag.slug}</Chip>;

export default Tag;