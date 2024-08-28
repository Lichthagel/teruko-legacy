import { gql } from "@apollo/client";

import GET_TAG_CATEGORIES_RAW from "./GET_TAG_CATEGORIES.graphql?raw";

export const GET_TAG_CATEGORIES = gql(GET_TAG_CATEGORIES_RAW);
