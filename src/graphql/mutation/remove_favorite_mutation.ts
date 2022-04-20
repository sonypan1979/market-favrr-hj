import { gql } from "@apollo/client";

export const REMOVE_FAVORITE_MUTATION = gql`
  mutation RemoveFromFavorites($title: String!) {
    removeFromFavorites(title: $title) {
      shares
      equity
      delta
      fav {
        id
        key
        title
        favorite
      }
      id
    }
  }
`;
export default REMOVE_FAVORITE_MUTATION;
