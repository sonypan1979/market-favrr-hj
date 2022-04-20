import { gql } from "@apollo/client";

export default gql`
  fragment FavSharesFragment on Bixee {
    id
    key
    pps
    sharesLeft
    sharesTotal
    delta
    deltaPercent
    volume
    priceVolume
    equity {
      shares
      equity
    }
    volumeDeltaPercentage
  }
`;
