import { gql } from "@apollo/client";
import FavFragment from "../fragment/FavFragment";

export const SIMILAR_FAVS_QUERY = gql`
  query SimilarFavs($title: String) {
    similarFavs(title: $title) {
      page
      pages
      search
      count
      results {
        ...FavFragment
      }
    }
  }
  ${FavFragment}
`;
export default SIMILAR_FAVS_QUERY;
