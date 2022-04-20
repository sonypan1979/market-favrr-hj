import { gql } from "@apollo/client";

export const HISTORY_QUERY = gql`
  query HistoryQuery(
    $key: String
    $pagination: CursorPagination
    $type: HistoryData!
  ) {
    history(key: $key, pagination: $pagination, type: $type) {
      count
      totalCount
      cursor
      results {
        type
        from
        to
        amount
        price
        tx
        date
        isIPO
      }
    }
  }
`;
export default HISTORY_QUERY;
