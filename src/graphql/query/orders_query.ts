import { gql } from "@apollo/client";

export const ORDERS_QUERY = gql`
  query OrdersQuery(
    $type: OrderType
    $pagination: CursorPagination
    $title: String
  ) {
    orders(type: $type, title: $title, pagination: $pagination) {
      orders {
        pps
        shares
        date
        type
        address
      }
      count
      cursor
    }
  }
`;
export default ORDERS_QUERY;
