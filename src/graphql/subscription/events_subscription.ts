import { gql } from "@apollo/client";

const EVENTS_SUBSCRIPTION = gql`
  subscription Events($address: String) {
    events(address: $address) {
      type
      id
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
`;
export default EVENTS_SUBSCRIPTION;
