import { gql } from "@apollo/client";

export const GET_NOTIFICATIONS_QUERY = gql`
  query GetNotifications($address: String, $pagination: CursorPagination) {
    getNotifications(address: $address, pagination: $pagination) {
      count
      cursor
      unread
      events {
        id
        type
        fav {
          key
          id
          title
          coin
          images {
            key
            image
          }
          icons {
            key
            image
          }
        }
        read
        created
        order {
          type
          transactionType
          amount
          totalAmount
          pps
          tx
        }
        IPO {
          type
        }
      }
    }
  }
`;
export default GET_NOTIFICATIONS_QUERY;
