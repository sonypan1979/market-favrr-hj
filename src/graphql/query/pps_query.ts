import { gql } from "@apollo/client";

export const PPS_QUERY = gql`
  query PPS($title: String) {
    pps(title: $title) {
      pps
      minimal
      maximal
    }
  }
`;
export default PPS_QUERY;
