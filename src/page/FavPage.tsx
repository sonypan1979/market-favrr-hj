import { useQuery } from "@apollo/client";
import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import TagButton from "../components/button/TagButton";
import FavPortrait from "../components/image/FavPortrait";
import NewsList from "../components/news/NewsList";
import AboutText from "../components/text/AboutText";
import BuySellPanel from "../components/transaction/BuySellPanel";
import FAV_QUERY from "../graphql/query/fav_query";
import BasePage from "./BasePage";
import {
  Bixee,
  BixeeImageVar,
  FavQueryQuery,
  FavQueryQueryVariables,
  useFavSharesQuery,
  useFavSharesQueryQuery,
} from "../../generated/graphql";
import "./favPage.scss";
import { useParams, useRouteMatch } from "react-router-dom";
import { printIntrospectionSchema } from "graphql";
import ActivityPanel, {
  FavActivityPanel,
} from "../components/fav/ActivityPanel";
import SimilarFavs from "../components/fav/SimilarFavsCarousel";
import EquityPanel from "../components/assets/EquityPanel";
import FavPriceVolumePanel from "../components/assets/FavPriceVolumePanel";
import { useWallet } from "../context/WalletContext";
import MarketCapRow from "../components/assets/MarketCapRow";
import FavEquityPanel from "../components/assets/FavEquityPanel";
import Big from "big.js";

const FavPage = () => {
  const { favId } = useParams<{ favId: string }>();
  const [buyPanelPinned, setBuyPanelPinned] = useState(false);
  const { data: favData } = useQuery<FavQueryQuery, FavQueryQueryVariables>(
    FAV_QUERY,
    { variables: { title: favId } }
  );

  //Keep updating pps, shares and relevant shares info for fav
  useFavSharesQuery({ variables: { title: favId }, pollInterval: 10000 });

  const { isConnected, walletAddresses } = useWallet();

  useEffect(() => {
    const updateBuyPanelPinned = () => {
      const favPortraitElement = document.querySelector(".fav-portrait");
      const favPortraitBottom = favPortraitElement
        ? favPortraitElement?.getBoundingClientRect().y +
          favPortraitElement?.getBoundingClientRect().height
        : 0;

      const shouldBePinned = favPortraitBottom < 50 && window.innerWidth < 1024;
      if (buyPanelPinned !== shouldBePinned) {
        setBuyPanelPinned(shouldBePinned);
      }
    };

    updateBuyPanelPinned();
    window.addEventListener("scroll", updateBuyPanelPinned);
    window.addEventListener("resize", updateBuyPanelPinned);
    return () => {
      window.removeEventListener("scroll", updateBuyPanelPinned);
      window.removeEventListener("resize", updateBuyPanelPinned);
    };
  }, [buyPanelPinned]);

  return (
    <BasePage
      className="fav-page"
      style={{
        paddingBottom: buyPanelPinned
          ? "120px"
          : undefined /* Avoid pinned overlay footer*/,
      }}
    >
      <BuySellPanel
        fav={favData?.fav as Bixee}
        className={`pinned-panel ${buyPanelPinned ? "" : "hidden"}`}
        type="row"
      />
      <div className="top-module">
        <h1 className="fav-identifier">
          <span className="fav-name">{favData?.fav?.displayName}</span>
          <span className="fav-share-name">{favData?.fav?.coin}</span>
        </h1>
        <FavPortrait
          image={favData?.fav?.images as Array<BixeeImageVar>}
          fav={favData?.fav as Bixee | undefined}
        />
        <BuySellPanel
          fav={favData?.fav as Bixee}
          className={`${buyPanelPinned ? "hidden" : ""}`}
        />
        <div className="bottom-content">
          <FavPriceVolumePanel favTitle={favId} />

          <hr />
          {favData && <MarketCapRow fav={favData.fav as Bixee} />}
          {isConnected ? (
            <FavEquityPanel
              fav={favData?.fav as Bixee}
              address={(walletAddresses as Array<string>)[0] as string}
              title={favId}
            />
          ) : null}

          <div className="about-section">
            <h2 className="section-title about-title">
              <FormattedMessage
                defaultMessage="about {name}"
                values={{ name: favData?.fav?.displayName }}
              />
            </h2>
            <AboutText fullText={favData?.fav?.about || null} />
          </div>

          <h2 className="section-title">
            <FormattedMessage defaultMessage="Activity" />
          </h2>
          {favData?.fav && <FavActivityPanel fav={favData?.fav as Bixee} />}
          <h2 className="section-title">
            <FormattedMessage defaultMessage="News" />
          </h2>
          <NewsList
            skip={!favData?.fav?.key}
            filter={{
              bixees: favData?.fav?.key ? [favData.fav.key as string] : null,
            }}
            sizeLimit={30}
          />
          {favData?.fav?.key ? <SimilarFavs title={favId as string} /> : null}
        </div>
      </div>
    </BasePage>
  );
};

export default FavPage;
