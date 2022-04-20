import { gql } from "@apollo/client";

export const FULFILL_BUY_ORDER = gql`
  query FulfillBuyOrder($title: String, $amount: String) {
    fulfillBuyOrder(title: $title, amount: $amount) {
      address
      amount
      price
      weightedPrice
      fulfilled
      totalAmount
      totalPrice
      fees
    }
  }
`;
export default FULFILL_BUY_ORDER;
