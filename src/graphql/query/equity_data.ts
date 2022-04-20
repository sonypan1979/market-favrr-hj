import { gql } from "@apollo/client";

export const EQUITY_DATA_QUERY = gql`
  query EquityData($title: String) {
    equityData(title: $title) {
      shares
      pps
      totalPrice
      return
      returnPercentage
      todaysReturn
      todaysReturnPercentage
      totalCostETH
      totalCostUSD
    }
  }
`;
export default EQUITY_DATA_QUERY;
