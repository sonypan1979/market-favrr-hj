import { gql } from "@apollo/client";
import FavFragment from "../fragment/FavFragment";

export const FAVS_QUERY = gql`
  query Favs(
    $pagination: Pagination
    $filter: BixeeFilter
    $sort: Sorting
    $dataToShow: FavsDisplayData
  ) {
    favs(
      pagination: $pagination
      filter: $filter
      sort: $sort
      dataToShow: $dataToShow
    ) {
      count
      page
      pages
      results {
        ...FavFragment
        marketCap
      }
    }
  }
  ${FavFragment}
`;
export default FAVS_QUERY;
