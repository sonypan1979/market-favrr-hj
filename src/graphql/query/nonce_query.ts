import { gql } from "@apollo/client";

export const NONCE_QUERY = gql`
  query GetNonce($address: String) {
    getNonce(address: $address)
  }
`;
export default NONCE_QUERY;
