import { useMatch } from "react-router-dom";

function useIsImageView(): boolean {
  const match = useMatch(":id");

  if (!match) {
    return false;
  }

  return match.params.id !== "new";
}

export default useIsImageView;
