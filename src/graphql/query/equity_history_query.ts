import { gql } from "@apollo/client";

const EQUITY_HISTORY_QUERY = gql`
  query EquityHistory(
    $address: String
    $dateFilter: DateFilter
    $type: HistoryType
  ) {
    userHistoryGraph(address: $address, dateFilter: $dateFilter, type: $type) {
      data {
        date
        equity
        equityDeltaPercent
        equityDelta
      }
    }
  }
`;
export default EQUITY_HISTORY_QUERY;
