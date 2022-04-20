import React from "react";
import { Bixee, SortingField, useFavsQuery } from "../../../generated/graphql";
import FavRowsPanel from "./FavRowsPanel";

const TopFavsPanel = () => {
  const { data } = useFavsQuery({
    variables: {
      pagination: { perPage: 15 },
      filter: { isIPO: false },
      sort: { field: SortingField.MarketCap, order: "DESC" },
    },
  });
  return (
    <FavRowsPanel
      favs={((data?.favs?.results || undefined) as Array<Bixee>) || undefined}
    />
  );
};

export default TopFavsPanel;
