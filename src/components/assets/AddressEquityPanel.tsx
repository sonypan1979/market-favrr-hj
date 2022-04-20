import React from "react";
import { useQuery } from "@apollo/client";
import {
  AddressPortfolioQuery,
  AddressPortfolioQueryVariables,
} from "../../../generated/graphql";
import ADDRESS_DATA_QUERY from "../../graphql/query/address_data_query";
import EquityPanel from "./EquityPanel";
import "./equityPanel.scss";
import ADDRESS_PORTFOLIO_QUERY from "../../graphql/query/address_portfolio";
import { useEthereum } from "../../context/EthereumContext";
import Big from "big.js";

const AddressEquityPanel = (props: { address: string }) => {
  const { data } = useQuery<
    AddressPortfolioQuery,
    AddressPortfolioQueryVariables
  >(ADDRESS_PORTFOLIO_QUERY, {
    variables: {
      address: props.address,
    },
  });
  const { ethQuotation } = useEthereum();
  return (
    <EquityPanel
      shares={new Big(data?.addressPortfolio?.shares || 0)}
      favs={data?.addressPortfolio?.favs || 0}
      equityEth={new Big(data?.addressPortfolio?.equity || 0)}
      equityUSD={new Big(data?.addressPortfolio?.equity || 0).times(
        ethQuotation
      )}
      expandedVersion
      costEth={new Big(data?.addressPortfolio?.totalCostETH || 0)}
      costUSD={new Big(data?.addressPortfolio?.totalCostUSD || 0)}
      todayReturnEth={new Big(data?.addressPortfolio?.todayReturn || 0)}
      todayReturnPercentage={
        new Big(data?.addressPortfolio?.todaysReturnPercentage || 0)
      }
      totalReturnEth={new Big(data?.addressPortfolio?.totalReturn || 0)}
      totalReturnPercentage={
        new Big(data?.addressPortfolio?.totalReturnPercentage || 0)
      }
    />
  );
};

export default AddressEquityPanel;
