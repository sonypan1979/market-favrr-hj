import { gql } from "@apollo/client";
import FavFragment from "../fragment/FavFragment";

export const FAVS_EQUITY_QUERY = gql`
  query EquityFavs(
    $pagination: Pagination
    $filter: BixeeFilter
    $sort: Sorting
  ) {
    favs(pagination: $pagination, filter: $filter, sort: $sort) {
      count
      result {
        shares
        equity
        fav {
          ...FavFragment
        }
      }
    }
  }
  ${FavFragment}
`;
export default FAVS_EQUITY_QUERY;
