import React from "react";
import "./marketCapRow.scss";
import infoSrc from "../../assets/images/info.svg";

import { FormattedMessage } from "react-intl";
import Tooltip from "../tooltip/Tooltip";
import { Bixee } from "../../../generated/graphql";
import Big from "big.js";
import { useWatchIPO } from "../../hooks/useWatchIPO";
const MarketCapRow = (props: { fav: Bixee }) => {
  const { fav } = props;
  const pps = new Big(fav.pps || 0);
  const sharesLeft = new Big(fav.sharesLeft || 0);
  const sharesTotal = new Big(fav.sharesTotal || 0);
  const equity = new Big(fav.equity?.equity || 0);
  const priceVolume = new Big(fav.priceVolume || 0);
  const volume = new Big(fav.volume || 0);

  const isIPO = useWatchIPO({ bixee: fav });
  return (
    <div className="market-cap-row">
      <div className="field">
        <span>{equity.round(8).toFixed()} ETH</span>
        <span className="field-name">
          <FormattedMessage defaultMessage="Market Cap" />
          <Tooltip
            tooltip={
              <>
                <div className="tooltip-title">
                  <FormattedMessage defaultMessage="What is Market Cap?" />
                </div>
                <div className="tooltip-text">
                  <FormattedMessage defaultMessage="The current price per share multiplied by the current circulating supply of shares." />
                </div>
              </>
            }
            position="top"
          >
            <img src={infoSrc} />
          </Tooltip>
        </span>
      </div>
      {isIPO ? (
        <div className="field">
          <span>
            <FormattedMessage
              defaultMessage="{left} of {total}"
              values={{
                left: sharesLeft.round(8).toFixed(),
                total: sharesTotal.round(8).toFixed(),
              }}
            />
          </span>
          <span className="field-name">
            <FormattedMessage defaultMessage="Shares Available" />
            <Tooltip
              tooltip={
                <>
                  <div className="tooltip-title">
                    <FormattedMessage defaultMessage="What is Shares Available?" />
                  </div>
                  <div className="tooltip-text">
                    <FormattedMessage defaultMessage="The number of shares that are still available in the IPO phase." />
                  </div>
                </>
              }
              position="top"
            >
              <img src={infoSrc} />
            </Tooltip>
          </span>
        </div>
      ) : (
        <div className="field">
          <span>
            <FormattedMessage
              defaultMessage="{shares} {shares, select, 1 {Share} other {Shares}}"
              values={{ shares: volume.round(8).toFixed() }}
            />
          </span>
          {/* Replace this with volume in shares */}
          <span className="field-name">
            <FormattedMessage defaultMessage="Volume (24h)" />
            <Tooltip
              tooltip={
                <>
                  <div className="tooltip-title">
                    <FormattedMessage defaultMessage="What is Volume?" />
                  </div>
                  <div className="tooltip-text">
                    <FormattedMessage
                      defaultMessage="The number of{oceana, select, true {} other { FAV}} shares traded over the past 24 hours."
                      values={{ oceana: process.env.OCEANA_ENV }}
                    />
                  </div>
                </>
              }
              position="top"
            >
              <img src={infoSrc} />
            </Tooltip>
          </span>
        </div>
      )}

      <div className="field">
        <span>{priceVolume.round(8).toFixed()} ETH</span>
        <span className="field-name">
          <FormattedMessage defaultMessage="Volume (24h)" />
          <Tooltip
            tooltip={
              <>
                <div className="tooltip-title">
                  <FormattedMessage defaultMessage="What is Volume?" />
                </div>
                <div className="tooltip-text">
                  <FormattedMessage
                    defaultMessage="The value of{oceana, select, true {} other { FAV}} shares traded over the past 24 hours."
                    values={{ oceana: process.env.OCEANA_ENV }}
                  />
                </div>
              </>
            }
            position="top"
          >
            <img src={infoSrc} />
          </Tooltip>
        </span>
      </div>
    </div>
  );
};

export default MarketCapRow;
