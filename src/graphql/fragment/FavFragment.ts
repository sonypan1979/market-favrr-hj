import { gql } from "@apollo/client";

export default gql`
  fragment FavFragment on Bixee {
    id
    key
    displayName
    title
    fullName
    address
    pps
    coin
    sharesLeft
    sharesTotal
    description
    favorite
    added
    images {
      key
      image
    }
    icons {
      key
      image
    }
    IPOEndDate
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
