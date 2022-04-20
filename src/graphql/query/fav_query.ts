import { gql } from "@apollo/client";
import FavFragment from "../fragment/FavFragment";

export const FAV_QUERY = gql`
  query FavQuery($key: String, $title: String) {
    fav(key: $key, title: $title) {
      ...FavFragment
      about
    }
  }
  ${FavFragment}
`;
export default FAV_QUERY;
