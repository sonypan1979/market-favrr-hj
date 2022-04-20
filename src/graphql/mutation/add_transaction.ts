import { gql } from "@apollo/client";

export const ADD_TRANSACTIONS_QUERY = gql`
  mutation AddTx(
    $hash: String!
    $title: String!
    $type: NotificationOrderOrderType!
    $event: NotificationOrderTxType!
    $amount: String!
    $price: String!
  ) {
    addTx(
      hash: $hash
      title: $title
      event: $event
      amount: $amount
      price: $price
      type: $type
    )
  }
`;
export default ADD_TRANSACTIONS_QUERY;
