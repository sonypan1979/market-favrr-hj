import { gql } from "@apollo/client";

//UUID is actually TX
export const ORDER_DATA_QUERY = gql`
  query OrderData($uuid: String) {
    orderData(uuid: $uuid) {
      uuid
      pps
      shares
      totalShares
      date
      tx
      type
      state
      address
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
`;
export default ORDER_DATA_QUERY;
