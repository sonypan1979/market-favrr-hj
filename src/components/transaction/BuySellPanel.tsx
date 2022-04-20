import { useQuery } from "@apollo/client";
import Big from "big.js";
import React, { forwardRef, useState } from "react";
import { FormattedMessage, FormattedNumber } from "react-intl";
import {
  AddressDataQuery,
  AddressDataQueryVariables,
  Bixee,
} from "../../../generated/graphql";
import infoSrc from "../../assets/images/info.svg";
import { useEthereum } from "../../context/EthereumContext";
import { useWallet } from "../../context/WalletContext";
import ADDRESS_DATA_QUERY from "../../graphql/query/address_data_query";
import { useWatchIPO } from "../../hooks/useWatchIPO";
import { favPath } from "../../routes/pathBuilder";
import ProgressBar from "../fav/ProgressBar";
import Countdown from "../time/Countdown";
import Tooltip from "../tooltip/Tooltip";
import BuyModal from "./BuySellModal";
import "./buySellPanel.scss";

interface Props {
  type?: "panel" | "row";
  fav?: Bixee;
  className?: string;
}
const BuySellPanel = (props: Props) => {
  const [displayTransactionModal, setDisplayTransactionModal] = useState<
    "sell" | "buy" | null
  >(null);
  const type = props.type || "panel";
  const { ethQuotation } = useEthereum();

  const dollarPrice = ethQuotation.times(props.fav?.pps || 0);
  const isIPO = useWatchIPO({ bixee: props.fav });

  const { isConnected, walletAddresses } = useWallet();

  const { data: addressData } = useQuery<
    AddressDataQuery,
    AddressDataQueryVariables
  >(ADDRESS_DATA_QUERY, {
    skip: !isConnected || isIPO || !props.fav?.title,
    fetchPolicy: "network-only",
    variables: {
      address: isConnected ? (walletAddresses as Array<string>)[0] : undefined,
      title: props.fav?.title as string,
    },
  });

  const shares = new Big(addressData?.addressData?.fav?.shares || 0);
  const sharesLeft = new Big(props.fav?.sharesLeft || 0);
  const sharesTotal = new Big(props.fav?.sharesTotal || 0);

  const displaySellButton = !isIPO && !shares.eq(0);

  return (
    <>
      <div className={`buy-sell-panel ${type} ${props.className || ""}`}>
        {type == "panel" && (
          <div className="pre-trade-label">
            <span className="share-title">
              {isIPO ? (
                <FormattedMessage defaultMessage="IPO Price" />
              ) : (
                <FormattedMessage defaultMessage="Share Price" />
              )}
            </span>
            {isIPO && (
              <Tooltip
                position="top"
                tooltip={
                  <>
                    <div className="pretrade-tooltip-title">
                      <FormattedMessage defaultMessage="What's an IPO Price?" />
                    </div>
                    <div className="pretrade-tooltip-subtitle">
                      <FormattedMessage defaultMessage="The current price per share available to investors during the limited IPO phase." />
                    </div>
                  </>
                }
              >
                <img src={infoSrc} className="info-icon" />
              </Tooltip>
            )}
          </div>
        )}
        <div>
          <div className="ethereum-price">{`${
            props.fav?.pps?.slice(0, 8) || 0
          } ETH`}</div>
          <div className="usd-price">
            <FormattedNumber
              value={Number(dollarPrice.round(2).toFixed())}
              style="currency"
              currency="USD"
            />
            {` USD`}
          </div>
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            maxWidth: 322,
            margin: "0px auto",
            marginTop: props.type == "row" ? 3 : 48,
            gap: 15,
          }}
        >
          {!displaySellButton ? null : (
            <button
              className="action-button sell-button"
              onClick={() => setDisplayTransactionModal("sell")}
            >
              {props.type == "row" ? (
                <FormattedMessage
                  defaultMessage="Sell {coin}"
                  values={{ coin: props.fav?.coin }}
                />
              ) : (
                <FormattedMessage defaultMessage="Sell" />
              )}
            </button>
          )}
          <button
            className="action-button buy-button"
            onClick={() => setDisplayTransactionModal("buy")}
            style={{
              width: displaySellButton ? undefined : 288,
              margin: displaySellButton ? undefined : "auto",
            }}
          >
            {props.type == "row" ? (
              <FormattedMessage
                defaultMessage="Buy {coin}"
                values={{ coin: props.fav?.coin }}
              />
            ) : (
              <FormattedMessage defaultMessage="Buy" />
            )}
          </button>
        </div>
        {isIPO && (
          <>
            {props.type != "row" ? (
              <>
                <br />
                <Countdown endDate={props.fav?.IPOEndDate as string} />
              </>
            ) : null}
            <span className="progress-bar-container">
              <ProgressBar
                sharesLeft={Number(sharesLeft.toFixed())}
                sharesTotal={Number(sharesTotal.toFixed())}
              />
            </span>
          </>
        )}
      </div>
      {displayTransactionModal && props.fav && (
        <BuyModal
          onClose={() => setDisplayTransactionModal(null)}
          fav={props.fav}
          transactionType={displayTransactionModal}
        />
      )}
    </>
  );
};

export default BuySellPanel;
