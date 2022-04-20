import { gql } from "@apollo/client";

export const ETH_QUOTATION_QUERY = gql`
  query EthQuotation {
    ethQuotation
  }
`;
export default ETH_QUOTATION_QUERY;
