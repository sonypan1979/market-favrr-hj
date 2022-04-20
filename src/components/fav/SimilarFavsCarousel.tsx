import { useQuery } from "@apollo/client";
import React from "react";
import { FormattedMessage } from "react-intl";
import {
  Bixee,
  SimilarFavsQuery,
  SimilarFavsQueryVariables,
} from "../../../generated/graphql";
import SIMILAR_FAVS_QUERY from "../../graphql/query/similar_favs_query";
import FavsCarousel from "./FavsCarousel";
const SimilarFavsCarousel = (props: { title: string }) => {
  const { data } = useQuery<SimilarFavsQuery, SimilarFavsQueryVariables>(
    SIMILAR_FAVS_QUERY,
    { variables: { title: props.title } }
  );

  return (
    <FavsCarousel
      favs={data?.similarFavs?.results as Array<Bixee> | undefined}
      titleElement={
        <FormattedMessage
          defaultMessage="Similar {assetName}"
          values={{
            assetName: process.env.OCEANA_ENV == "true" ? "NFTs" : "FAVs",
          }}
        />
      }
    />
  );
};

export default SimilarFavsCarousel;
