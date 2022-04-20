import { gql } from "@apollo/client";

export const TX_STATUS_QUERY = gql`
  query TxStatus($tx: String) {
    txStatus(tx: $tx)
  }
`;
export default TX_STATUS_QUERY;
