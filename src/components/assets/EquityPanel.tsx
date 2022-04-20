import Big from "big.js";
import React from "react";
import { FormattedMessage, FormattedNumber } from "react-intl";
import { useEthereum } from "../../context/EthereumContext";
import { formatEthPrice } from "../../util/stringUtils";
import "./equityPanel.scss";

const EquityPanel = (props: {
  favs?: number;

  shares: Big;
  sharesPoolSize?: Big;
  equityEth: Big;
  equityUSD: Big;
  todayReturnEth: Big;
  todayReturnPercentage: Big;
  totalReturnEth: Big;
  totalReturnPercentage: Big;
  costEth?: Big;
  costUSD?: Big;
  expandedVersion?: boolean;

  coin?: string;
  currentSharePriceETH?: Big;
  currentSharePriceUSD?: Big;
}) => {
  const {
    favs,
    shares,
    sharesPoolSize,
    equityEth,
    equityUSD,
    todayReturnEth,
    todayReturnPercentage,
    totalReturnEth,
    totalReturnPercentage,
    costEth,
    costUSD,
    coin,
    expandedVersion,
    currentSharePriceETH,
    currentSharePriceUSD,
  } = props;

  return (
    <div className="equity-panel">
      <div className="equity-section">
        <div className="upper-section">
          <div className="title-section">
            <FormattedMessage
              defaultMessage="Your {coin, select, null {Total} other {{coin}}} Equity"
              values={{ coin: coin || null }}
            />
          </div>
          <span className="main-values-container">
            <span className="main-value">{`
            ${new Big(equityEth).round(8).toFixed()} ETH`}</span>
            <span className="usd-value">
              <FormattedNumber
                style="currency"
                currency="USD"
                value={parseFloat(equityUSD.toFixed())}
              />
            </span>
          </span>
        </div>
        {expandedVersion && (
          <div className="bottom-section">
            <div className="field-row">
              <span className="field-name">
                <FormattedMessage defaultMessage="Today's Return" />
              </span>
              <span className="field-value">
                <span
                  className={`eth-value ${
                    todayReturnEth.gte(0) ? "positive" : "negative"
                  }`}
                >
                  {todayReturnEth.round(8).toFixed()} ETH
                </span>
                <span>{todayReturnPercentage.round(0).toFixed()}%</span>
              </span>
            </div>
            <div className="field-row">
              <span className="field-name">
                <FormattedMessage defaultMessage="Total Return" />
              </span>
              <span className="field-value">
                <span
                  className={`eth-value ${
                    totalReturnEth.gte(0) ? "positive" : "negative"
                  }`}
                >
                  {totalReturnEth.round(8).toFixed()} ETH
                </span>
                <span>{totalReturnPercentage.round(2).toFixed()}%</span>
              </span>
            </div>
          </div>
        )}
      </div>
      <div className="panel-separator" />
      <div className="equity-section">
        <div className="upper-section">
          <div className="title-section">
            {expandedVersion ? (
              <FormattedMessage
                defaultMessage="Your {coin, select, null {Total} other {{coin} Average}} Cost"
                values={{ coin: coin || null }}
              />
            ) : favs == null || favs == undefined ? (
              <FormattedMessage defaultMessage="Yours shares" />
            ) : (
              <FormattedMessage defaultMessage="Yours FAVs" />
            )}
          </div>
          <div>
            <span className="main-values-container">
              <span className="main-value">
                {costEth?.round(8).toFixed()} ETH
              </span>
              <span className="secondary-value">
                <FormattedNumber
                  style="currency"
                  currency="USD"
                  value={Number(costUSD?.round(2).toFixed())}
                />
              </span>
            </span>
          </div>
        </div>
        {expandedVersion &&
          (favs == null || favs == undefined ? (
            <div className="bottom-section">
              <div className="field-row">
                <span className="field-name">
                  <FormattedMessage defaultMessage="Shares" />
                </span>
                <span className="field-value">
                  <span className="white">{shares + " "}</span>
                  <span>
                    <FormattedMessage
                      defaultMessage="of {sharesPool}"
                      values={{
                        sharesPool: sharesPoolSize?.round(0).toFixed(),
                      }}
                    />
                  </span>
                </span>
              </div>
              <div className="field-row">
                <span className="field-name">
                  <FormattedMessage defaultMessage="Current Price" />
                </span>
                <span className="field-value">
                  <span className="eth-value">
                    {currentSharePriceETH?.round(8).toFixed()} ETH
                  </span>{" "}
                  <span>
                    <FormattedNumber
                      style="currency"
                      currency="USD"
                      value={Number(currentSharePriceUSD?.round(2).toFixed())}
                    />
                  </span>
                </span>
              </div>
            </div>
          ) : (
            <div className="bottom-section">
              <div className="field-row">
                <span className="field-name">
                  <FormattedMessage
                    defaultMessage="Total {assetName}"
                    values={{
                      assetName:
                        process.env.OCEANA_ENV == "true"
                          ? "Social NFTs"
                          : "FAVs",
                    }}
                  />
                </span>
                <span className="field-value white">
                  <span>{favs}</span>
                </span>
              </div>
              <div className="field-row">
                <span className="field-name">
                  <FormattedMessage defaultMessage="Total Shares" />
                </span>
                <span className="field-value white">
                  <span>{shares.round(8).toFixed()}</span>
                </span>
              </div>
            </div>
          ))}
        {/* <span className="main-value">
          <FormattedMessage
            defaultMessage="{favs} FAVs"
            values={{ favs: favs }}
          />
        </span>
        <span className="secondary-value">
          <FormattedMessage
            defaultMessage="{shares} shares"
            values={{ shares: shares }}
          /> */}
        {/* </span> */}
      </div>
    </div>
  );
};

export default EquityPanel;
