import { gql } from "@apollo/client";

export const FAV_VOLUME_CHART_QUERY = gql`
  query FavVolumeChart(
    $dateFilter: DateFilter
    $titles: [String]
    $type: HistoryType
    $displayType: HistoryDisplayType
  ) {
    historyGraph(
      dateFilter: $dateFilter
      titles: $titles
      type: $type
      displayType: $displayType
    ) {
      id
      data {
        volume
        price
        date
      }
    }
  }
`;
export default FAV_VOLUME_CHART_QUERY;
