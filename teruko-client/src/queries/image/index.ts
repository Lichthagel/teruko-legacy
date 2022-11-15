import { gql } from "@apollo/client";

import GET_IMAGE_RAW from "./GET_IMAGE.graphql?raw";
import GET_IMAGES_RAW from "./GET_IMAGES.graphql?raw";
import GET_IMAGE_COUNT_RAW from "./GET_IMAGE_COUNT.graphql?raw";
import NEW_IMAGE_RAW from "./NEW_IMAGE.graphql?raw";
import NEW_IMAGE_FROM_URL_RAW from "./NEW_IMAGE_FROM_URL.graphql?raw";
import UPDATE_IMAGE_RAW from "./UPDATE_IMAGE.graphql?raw";
import UPDATE_IMAGE_PIXIV_RAW from "./UPDATE_IMAGE_PIXIV.graphql?raw";
import DELETE_IMAGE_RAW from "./DELETE_IMAGE.graphql?raw";

export const GET_IMAGE = gql(GET_IMAGE_RAW);
export const GET_IMAGES = gql(GET_IMAGES_RAW);
export const GET_IMAGE_COUNT = gql(GET_IMAGE_COUNT_RAW);
export const NEW_IMAGE = gql(NEW_IMAGE_RAW);
export const NEW_IMAGE_FROM_URL = gql(NEW_IMAGE_FROM_URL_RAW);
export const UPDATE_IMAGE = gql(UPDATE_IMAGE_RAW);
export const UPDATE_IMAGE_PIXIV = gql(UPDATE_IMAGE_PIXIV_RAW);
export const DELETE_IMAGE = gql(DELETE_IMAGE_RAW);