import { useQuery } from "@apollo/client";
import React from "react";
import { FormattedMessage } from "react-intl";
import {
  Bixee,
  FavsQuery,
  FavsQueryVariables,
} from "../../../generated/graphql";
import FAVS_QUERY from "../../graphql/query/favs_query";
import FavsCarousel from "./FavsCarousel";
const TrendingFavsCarousel = (props: { address: string }) => {
  const { data } = useQuery<FavsQuery, FavsQueryVariables>(FAVS_QUERY, {
    variables: {
      filter: {
        // favorited: props.address,
        // owned: props.address,
        isTrendy: true,
        showGraph: true,
      },
    },
  });

  return (
    <FavsCarousel
      favs={data?.favs?.results as Array<Bixee> | undefined}
      titleElement={
        <FormattedMessage
          defaultMessage="Trending {assetName}"
          values={{
            assetName: process.env.OCEANA_ENV == "true" ? "NFTs" : "FAVs",
          }}
        />
      }
    />
  );
};

export default TrendingFavsCarousel;
