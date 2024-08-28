import addTag from "./addTag.js";
import createImage from "./createImage.js";
import createImageFromUrl from "./createImageFromUrl.js";
import deleteImage from "./deleteImage.js";
import deleteTag from "./deleteTag.js";
import removeTag from "./removeTag.js";
import updateImage from "./updateImage.js";
import updateImagePixiv from "./updateImagePixiv.js";
import updateTag from "./updateTag.js";
import updateTagCategory from "./updateTagCategory.js";

const Mutation = {
  createImage,
  createImageFromUrl,
  updateImage,
  updateImagePixiv,
  deleteImage,
  addTag,
  removeTag,
  updateTag,
  deleteTag,
  updateTagCategory,
};

export default Mutation;
