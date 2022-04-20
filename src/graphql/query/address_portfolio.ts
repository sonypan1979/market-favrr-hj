import { gql } from "@apollo/client";

const ADDRESS_PORTFOLIO_QUERY = gql`
  query AddressPortfolio($address: String) {
    addressPortfolio(address: $address) {
      shares
      equity
      favs
      delta
      todayReturn
      totalReturn
      todaysReturnPercentage
      totalReturnPercentage
      totalCostETH
      totalCostUSD
    }
  }
`;
export default ADDRESS_PORTFOLIO_QUERY;
