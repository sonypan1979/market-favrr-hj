import { gql } from "@apollo/client";

export const ADD_FAVORITE_MUTATION = gql`
  mutation AddToFavorite($title: String!) {
    addToFavorites(title: $title) {
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
export default ADD_FAVORITE_MUTATION;
