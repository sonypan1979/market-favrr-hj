import { gql } from "@apollo/client";

export const CONTRACT_DATA_QUERY = gql`
  query ContractData($order: OrderType, $title: String) {
    contractData(order: $order, title: $title) {
      shares
      weightedPrice
      totalPrice
      fees
    }
  }
`;
export default CONTRACT_DATA_QUERY;
