import { gql } from "@apollo/client";

export const FULFILL_SELL_ORDER = gql`
  query FulfillSellOrder($title: String, $amount: String) {
    fulfillSellOrder(title: $title, amount: $amount) {
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
export default FULFILL_SELL_ORDER;
