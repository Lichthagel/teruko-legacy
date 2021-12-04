import Button from "./Button";
import { FunctionComponent } from "react";

const Tag: FunctionComponent<{
    tag: { slug: string; category?: { slug: string; color?: string } };
    onClick?: (tag:{ slug: string; category?: { slug: string; color?: string } }) => void;
}> = ({ tag, onClick }) =>
    <Button
        text={tag.slug}
        color={tag.category && tag.category.color}
        onClick={() => onClick && onClick(tag)}
        className="break-all" />;
export default Tag;