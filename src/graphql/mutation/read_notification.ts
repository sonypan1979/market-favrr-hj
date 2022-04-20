import { gql } from "@apollo/client";

export const READ_NOTIFICATION_MUTATION = gql`
  mutation ReadNotification($address: String, $id: String) {
    readNotification(address: $address, id: $id) {
      unread
    }
  }
`;
export default READ_NOTIFICATION_MUTATION;
