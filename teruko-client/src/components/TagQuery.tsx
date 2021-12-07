import { useQuery } from "@apollo/client";
import React, { FunctionComponent } from "react";
import { Tag as TagModel } from "../models";
import { GET_TAG } from "../queries/tag";
import Chip from "./Chip";
import Tag from "./Tag";

const TagQuery: FunctionComponent<{
    slug: string;
    onClick?: (tag: TagModel) => void;
}> = ({ slug, onClick }) => {
    const { data, loading } = useQuery(GET_TAG, {
        variables: {
            slug
        }
    });

    if (loading || !data) {
        return <Chip className="break-all">...</Chip>;
    }

    return <Tag tag={data.tag} onClick={onClick} />;
};

export default TagQuery;