import { gql } from "@apollo/client";

export const MY_ORDERS_QUERY = gql`
  query MyOrders($state: OrderState, $pagination: CursorPagination) {
    MyOrders(state: $state, pagination: $pagination) {
      count
      cursor
      orders {
        pps
        shares
        totalShares
        date
        type
        state
        address
        tx
        uuid
        fav {
          key
          id
          title
          displayName
          coin
          address
          images {
            key
            image
          }
          icons {
            key
            image
          }
        }
      }
    }
  }
`;
export default MY_ORDERS_QUERY;
