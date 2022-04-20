import React from "react";
import { useQuery } from "@apollo/client";
import {
  AddressDataQuery,
  AddressDataQueryVariables,
  Bixee,
  EquityDataQuery,
  EquityDataQueryVariables,
} from "../../../generated/graphql";
import ADDRESS_DATA_QUERY from "../../graphql/query/address_data_query";
import EquityPanel from "./EquityPanel";
import "./equityPanel.scss";
import { useWallet } from "../../context/WalletContext";
import { useWatchIPO } from "../../hooks/useWatchIPO";
import { useEthereum } from "../../context/EthereumContext";
import Big from "big.js";
import EQUITY_DATA_QUERY from "../../graphql/query/equity_data";

const FavEquityPanel = (props: {
  address: string;
  title: string;
  fav?: Bixee;
}) => {
  const { data } = useQuery<AddressDataQuery, AddressDataQueryVariables>(
    ADDRESS_DATA_QUERY,
    {
      variables: {
        address: props.address,
        title: props.title,
      },
    }
  );
  const { data: equityData } = useQuery<
    EquityDataQuery,
    EquityDataQueryVariables
  >(EQUITY_DATA_QUERY, {
    variables: {
      title: props.title,
    },
  });

  const { ethQuotation } = useEthereum();

  const isIPO = useWatchIPO({ bixee: props.fav });

  const shares = new Big(equityData?.equityData?.shares || "0");

  if (shares.eq(0)) {
    return null;
  }
  return (
    <EquityPanel
      shares={shares}
      equityEth={new Big(data?.addressData?.fav?.equity || "0")}
      equityUSD={new Big(data?.addressData?.fav?.equity || "0").times(
        ethQuotation
      )}
      sharesPoolSize={new Big(props.fav?.sharesTotal || 0)}
      coin={props.fav?.coin || ""}
      expandedVersion={!isIPO}
      costEth={
        shares.eq(0)
          ? new Big(0)
          : new Big(equityData?.equityData?.totalCostETH || 0).div(shares)
      }
      costUSD={
        shares.eq(0)
          ? new Big(0)
          : new Big(equityData?.equityData?.totalCostUSD || 0).div(
              equityData?.equityData?.shares || "1"
            )
      }
      todayReturnEth={new Big(equityData?.equityData?.todaysReturn || 0)}
      todayReturnPercentage={
        new Big(equityData?.equityData?.todaysReturnPercentage || 0)
      }
      totalReturnEth={new Big(equityData?.equityData?.return || 0)}
      totalReturnPercentage={
        new Big(equityData?.equityData?.returnPercentage || 0)
      }
      currentSharePriceETH={new Big(equityData?.equityData?.pps || 0)}
      currentSharePriceUSD={new Big(equityData?.equityData?.pps || 0).times(
        ethQuotation
      )}
    />
  );
};

export default FavEquityPanel;
