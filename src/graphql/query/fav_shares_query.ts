import { gql } from "@apollo/client";
import FavSharesFragment from "../fragment/FavSharesFragment";

export const FAV_SHARES_QUERY = gql`
  query FavShares($key: String, $title: String) {
    fav(key: $key, title: $title) {
      ...FavSharesFragment
      about
    }
  }
  ${FavSharesFragment}
`;
export default FAV_SHARES_QUERY;
