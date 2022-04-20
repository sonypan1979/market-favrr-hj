import { gql } from "@apollo/client";

export const ETH_GAS_QUERY = gql`
  query EthGasQuotation {
    ethGaz {
      average
    }
  }
`;
export default ETH_GAS_QUERY;
