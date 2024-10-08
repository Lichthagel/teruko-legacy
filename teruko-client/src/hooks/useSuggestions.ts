import { useQuery } from "@apollo/client";

import { Tag } from "../models";
import { GET_TAG_SUGGESTIONS } from "../queries/tag";

function useSuggestions(filter: string): Tag[] {
  const { data } = useQuery<{ tagSuggestions: Tag[] }>(GET_TAG_SUGGESTIONS, {
    variables: {
      filter,
    },
    skip: filter.length < 3,
  });

  if (!data || !data.tagSuggestions) {
    return [];
  }

  return data.tagSuggestions;
}

export default useSuggestions;
