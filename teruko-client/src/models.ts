export type TagCategory = {
  slug: string;
  color?: string;
};

export type Tag = {
  slug: string;
  category?: TagCategory;
};

export type Image = {
  id: number;
  filename: string;
  title?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
  tags: Tag[];
};
