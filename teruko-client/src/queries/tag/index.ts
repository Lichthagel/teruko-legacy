import { gql } from "@apollo/client";

import GET_TAG_RAW from "./GET_TAG.graphql?raw";
import GET_TAG_SUGGESTIONS_RAW from "./GET_TAG_SUGGESTIONS.graphql?raw";
import ADD_TAG_RAW from "./ADD_TAG.graphql?raw";
import REMOVE_TAG_RAW from "./REMOVE_TAG.graphql?raw";
import UPDATE_TAG_RAW from "./UPDATE_TAG.graphql?raw";
import DELETE_TAG_RAW from "./DELETE_TAG.graphql?raw";

export const GET_TAG = gql(GET_TAG_RAW);

export const GET_TAG_SUGGESTIONS = gql(GET_TAG_SUGGESTIONS_RAW);

export const ADD_TAG = gql(ADD_TAG_RAW);

export const REMOVE_TAG = gql(REMOVE_TAG_RAW);

export const UPDATE_TAG = gql(UPDATE_TAG_RAW);

export const DELETE_TAG = gql(DELETE_TAG_RAW);