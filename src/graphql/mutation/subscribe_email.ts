import { gql } from "@apollo/client";

export const SUBSCRIBE_EMAIL_MUTATION = gql`
  mutation subscribeEmail($email: String) {
    subscribe(email: $email)
  }
`;
export default SUBSCRIBE_EMAIL_MUTATION;
