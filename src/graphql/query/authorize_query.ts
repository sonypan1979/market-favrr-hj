import { gql } from "@apollo/client";

export const AUTHORIZE_QUERY = gql`
  mutation Authorize($address: String, $signature: String) {
    authorize(address: $address, signature: $signature)
  }
`;
export default AUTHORIZE_QUERY;
