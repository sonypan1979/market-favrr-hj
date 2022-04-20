import { gql } from "@apollo/client";

const ADDRESS_DATA_QUERY = gql`
  query AddressData($address: String, $title: String) {
    addressData(address: $address, title: $title) {
      fav {
        shares
        equity
        delta
        id
      }
      id
      # todayReturn
      # totalReturn
    }
  }
`;
export default ADDRESS_DATA_QUERY;
