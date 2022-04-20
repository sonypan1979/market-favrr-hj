import { gql } from "@apollo/client";

export const PORTFOLIO_QUERY = gql`
  query Portfolio($address: String, $pagination: CursorPagination) {
    portfolio(address: $address, pagination: $pagination) {
      count
      cursor
      totalCount
      results {
        type
        from
        to
        amount
        price
        tx
        date
        coin
        title
      }
    }
  }
`;
export default PORTFOLIO_QUERY;
