import { gql } from "@apollo/client";

export const NEWS_QUERY = gql`
  query News($filter: NewsFilter, $pagination: Pagination) {
    news(filter: $filter, pagination: $pagination) {
      page
      pages
      count
      results {
        image
        title
        source
        date
        link
        code
        bixees {
          id
          key
          title
          icons {
            key
            image
          }
        }
      }
    }
  }
`;
export default NEWS_QUERY;
