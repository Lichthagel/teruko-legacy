import Tag from "./Tag.js";

export type Image = {
  id: string;
  filename: string;
  title: string | undefined;
  source: string | undefined;
  createdAt: Date;
  updatedAt: Date;
  tags: Tag[];
};

export enum ImageSort {
  LastUpdated = "last_updated",
  Newest = "newest",
  Oldest = "oldest",
  Random = "random",
}

export default Image;
