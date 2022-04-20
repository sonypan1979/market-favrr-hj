import { gql } from "@apollo/client";

export const CHECK_FOR_UPDATE_MUTATION = gql`
  mutation checkForUpdate($key: String!) {
    checkForUpdate(key: $key) {
      key
      sharesLeft
      pps
    }
  }
`;
export default CHECK_FOR_UPDATE_MUTATION;
