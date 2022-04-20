import { useQuery } from "@apollo/client";
import React from "react";
import { FormattedMessage } from "react-intl";
import { Redirect } from "react-router-dom";
import {
  FavVolumeChartDocument,
  MyOrdersQuery,
  MyOrdersQueryVariables,
} from "../../generated/graphql";
import AddressEquityPanel from "../components/assets/AddressEquityPanel";
import EquityChart from "../components/assets/EquityChart";
import EquityPanel from "../components/assets/EquityPanel";
import MyFavsPanel from "../components/assets/MyFavsPanel";
import MyOrdersPanel from "../components/orders/MyOrdersPanel";
import ActivityPanel, {
  PortfolioActivityPanel,
} from "../components/fav/ActivityPanel";
import SimilarFavs from "../components/fav/SimilarFavs";
import TrendingFavsCarousel from "../components/fav/TrendingFavsCarousel";
import NewsList from "../components/news/NewsList";
import { useWallet } from "../context/WalletContext";
import MY_ORDERS_QUERY from "../graphql/query/my_orders_query";
import BasePage from "./BasePage";
import "./portfolioPage.scss";

const PortfolioPage = () => {
  const { isConnected, walletAddresses } = useWallet();
  if (!isConnected) {
    return <Redirect to="/" />;
  }

  const address = (walletAddresses as Array<string>)[0];

  return (
    <BasePage className="portfolio-page">
      <div className="section">
        <EquityChart address={address} className="section" />
        <hr />
        <AddressEquityPanel address={address} />
      </div>
      <MyFavsPanel />

      <div className="section">
        <h2 className="section-title">
          <FormattedMessage defaultMessage="My Orders" />
        </h2>
        <MyOrdersPanel />
      </div>

      {/* <div className="section">
        <h2 className="section-title">
          <FormattedMessage defaultMessage="Activity" />
        </h2>
        <PortfolioActivityPanel address={address} />
      </div> */}

      <div className="section">
        <h2 className="section-title">
          <FormattedMessage defaultMessage="News" />
        </h2>
        <NewsList filter={{ address: address }} sizeLimit={30} />
      </div>

      <div className="section">
        <TrendingFavsCarousel address={address} />
      </div>
    </BasePage>
  );
};

export default PortfolioPage;
