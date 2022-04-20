import { fromPromise, useQuery } from "@apollo/client";
import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import {
  defineMessages,
  FormattedMessage,
  FormattedNumber,
  useIntl,
} from "react-intl";
import {
  Bixee,
  ContractDataQuery,
  ContractDataQueryVariables,
  PpsQuery,
  PpsQueryVariables,
  OrderType as TransactionType,
  AddressDataQuery,
  AddressDataQueryVariables,
} from "../../../generated/graphql";
import Modal from "../modal/Modal";
import closeSrc from "../../assets/images/close.svg";
import "./buySellModal.scss";
import { useEthereum } from "../../context/EthereumContext";
import errorSrc from "../../assets/images/error.svg";

import {
  decimalInputTransformer,
  formatEthPrice,
} from "../../util/stringUtils";
import { useWallet } from "../../context/WalletContext";
import WrongNetworkModal from "../modal/WrongNetworkModal";
import ConnectWalletModal from "../wallet/ConnectWalletModal";
import OrderPlacedModal from "./OrderPlacedModal";
import ModalContent from "../modal/ModalContent";
import { useWatchIPO } from "../../hooks/useWatchIPO";
import OrderTypeToggle, { OrderType } from "./OrderTypeToggle";
import PPS_QUERY from "../../graphql/query/pps_query";
import useOrderToFullfill from "../../hooks/transaction/useOrderToFullfill";
import CONTRACT_DATA_QUERY from "../../graphql/query/contract_data_query";
import OpenWalletModal from "./OpenWalletModal";
import { useTransactionModal } from "../../context/TransactionModalContext";
import Tooltip, { TooltipBody, TooltipTitle } from "../tooltip/Tooltip";
import infoSrc from "../../assets/images/info.svg";
import ADDRESS_DATA_QUERY from "../../graphql/query/address_data_query";
import { Link } from "react-router-dom";
import { howItWorksPath } from "../../routes/pathBuilder";
import Big from "big.js";
import { HashLink } from "react-router-hash-link";
import USDLabel from "../currency/USDLabel";

interface Props {
  fav: Bixee;
  transactionType: "sell" | "buy";
  onClose: () => void;
}

const intlMessages = defineMessages({
  inputErrorZero: {
    defaultMessage: "Shares cannot be zero",
  },
  inputAboveLimit: {
    defaultMessage: "Shares must be less than {sharesLeft}",
  },
  priceAboveLimit: {
    defaultMessage: "Share price cannot exceed {price}",
  },
  priceErrorZero: {
    defaultMessage: "Limit share price cannot be zero",
  },
  orderCannotBeFulfilled: {
    defaultMessage:
      "There are no orders to fulfill this, please place a limit order instead.",
  },
});

const BuySellModal = (props: Props) => {
  const [currentOrderType, setCurrentOrderType] = useState(OrderType.MARKET);

  const [marketShareInputText, setMarketShareInputText] = useState("");
  const [limitShareInputText, setLimitShareInputText] = useState("");
  const tokenInputText =
    currentOrderType == OrderType.MARKET
      ? marketShareInputText
      : limitShareInputText;
  const setTokenInputText =
    currentOrderType == OrderType.MARKET
      ? setMarketShareInputText
      : setLimitShareInputText;

  const [transactionErrorMessage, setTransactionErrorMessage] = useState("");
  const [inputErrorMessage, setInputErrorMessage] = useState("");
  const [inputPriceErrorMessage, setInputPriceErrorMessage] = useState("");
  // const [transactionAddress, setTransactionAddress] = useState(
  //   null as null | string
  // );
  const [displayOpenWallet, setDisplayOpenWallet] = useState(false);
  const [sharePriceInput, setSharePriceInput] = useState("");
  const [confirmedLimitPrice, setConfirmedLimitPrice] = useState(false);

  const fav = props.fav;

  const { buyIPO, ethQuotation, placeOrder, fulfillOrders } = useEthereum();
  const { wrongNetwork, isConnected, walletAddresses } = useWallet();

  const isIPO = useWatchIPO({ bixee: fav });

  const tokenNumber = new Big(tokenInputText || 0);

  const { data: ppsData } = useQuery<PpsQuery, PpsQueryVariables>(PPS_QUERY, {
    skip: isIPO,
    variables: { title: fav.title as string },
  });

  const { data: ordersData, loading: ordersLoading } = useOrderToFullfill({
    type: props.transactionType,
    title: fav.title as string,
    amount: tokenNumber,
    skip: currentOrderType != OrderType.MARKET,
  });

  const { data: contractData, loading: contractDataLoading } = useQuery<
    ContractDataQuery,
    ContractDataQueryVariables
  >(CONTRACT_DATA_QUERY, {
    fetchPolicy: "network-only",
    skip: currentOrderType != OrderType.MARKET,
    variables: {
      order:
        props.transactionType == "buy"
          ? TransactionType.Buy
          : TransactionType.Sell,
      title: fav.title,
    },
  });

  const { data: addressData } = useQuery<
    AddressDataQuery,
    AddressDataQueryVariables
  >(ADDRESS_DATA_QUERY, {
    skip: !isConnected || props.transactionType != "sell",
    fetchPolicy: "network-only",
    variables: {
      address: isConnected ? (walletAddresses as Array<string>)[0] : undefined,
      title: props.fav.title as string,
    },
  });

  const { displayTransaction } = useTransactionModal();

  let pricePerShare = new Big("0");
  if (isIPO) {
    pricePerShare = new Big(fav.pps as string);
  } else {
    if (currentOrderType == OrderType.LIMIT) {
      pricePerShare = new Big(sharePriceInput || 0);
    } else {
      pricePerShare = new Big(ordersData?.weightedPrice || "0");
    }
  }

  const maximalPPS = new Big(ppsData?.pps?.maximal || 0);
  const minimalPPS = new Big(ppsData?.pps?.minimal || 0);

  const totalPrice = pricePerShare.times(tokenNumber);
  const totalPriceUSD = totalPrice.times(ethQuotation);

  const addressDataShares = new Big(addressData?.addressData?.fav?.shares || 0);

  let availableShares = new Big(0);
  if (isIPO) {
    availableShares = new Big(fav.sharesLeft as number);
  } else if (currentOrderType == OrderType.MARKET) {
    availableShares = new Big(contractData?.contractData?.shares || 0);
    if (
      props.transactionType == "sell" &&
      addressDataShares.lt(availableShares)
    ) {
      availableShares = addressDataShares;
    }
  } else {
    if (props.transactionType == "buy") {
      availableShares = new Big(props.fav.sharesTotal || 0);
    } else {
      availableShares = addressDataShares;
    }
  }

  const intl = useIntl();

  useEffect(() => {
    setInputPriceErrorMessage("");
    setTransactionErrorMessage("");
    setInputErrorMessage("");
    // setSharePriceInput("");
    // setTokenInputText("");
    // setConfirmedLimitPrice(false);
  }, [currentOrderType]);

  const validatePriceInput = () => {
    if (currentOrderType == OrderType.LIMIT && pricePerShare.gt(maximalPPS)) {
      setInputPriceErrorMessage(
        intl.formatMessage(intlMessages.priceAboveLimit, {
          price: maximalPPS.round(8, Big.roundDown).toFixed(),
        })
      );
      return false;
    }

    if (pricePerShare.eq(0)) {
      setInputPriceErrorMessage(
        intl.formatMessage(intlMessages.priceErrorZero)
      );
      return false;
    }

    if (inputPriceErrorMessage) {
      setInputPriceErrorMessage("");
    }

    return true;
  };
  const validateInput = () => {
    if (tokenNumber.eq(0)) {
      setInputErrorMessage(intl.formatMessage(intlMessages.inputErrorZero));
      return false;
    }
    if (tokenNumber.gt(availableShares)) {
      setInputErrorMessage(
        intl.formatMessage(intlMessages.inputAboveLimit, {
          sharesLeft: availableShares.round(8, Big.roundDown).toFixed(),
        })
      );
      return false;
    }

    if (inputErrorMessage) {
      setInputErrorMessage("");
    }

    return true;
  };

  const walletConfirmTransaction = (address: string) => {
    props.onClose();
    displayTransaction({
      address,
      orderType: isIPO ? undefined : currentOrderType,
      transactionType: props.transactionType,
      amount: tokenNumber,
      totalPrice,
      coin: fav.coin as string,
    });
  };
  const walletRejectTransaction = (message: string) => {
    // setDisplayOpenWallet(false);
    // setTransactionErrorMessage(message);
  };
  const submit = () => {
    if (currentOrderType == OrderType.MARKET && !ordersData?.fulfilled) {
      setInputErrorMessage(
        intl.formatMessage(intlMessages.orderCannotBeFulfilled)
      );
    }

    if (!validatePriceInput()) {
      return;
    }
    if (currentOrderType == OrderType.LIMIT && !confirmedLimitPrice) {
      setConfirmedLimitPrice(true);
      return;
    }
    if (!validateInput()) {
      return;
    }
    setTransactionErrorMessage("");

    setDisplayOpenWallet(true);
    if (isIPO) {
      buyIPO(
        {
          price: new Big(fav.pps as number),
          number: tokenNumber,
          address: fav.address as string,
          title: fav.title as string,
        },
        walletConfirmTransaction,
        walletRejectTransaction
      );
    } else if (currentOrderType == OrderType.LIMIT) {
      placeOrder(
        {
          type: props.transactionType,
          amount: tokenNumber,
          price: pricePerShare,
          address: fav.address as string,
          title: fav.title as string,
        },
        walletConfirmTransaction,
        walletRejectTransaction
      );
    } else if (currentOrderType == OrderType.MARKET) {
      fulfillOrders(
        {
          type: props.transactionType,
          contractAddress: fav.address as string,
          addresses: ordersData?.address as Array<string>,
          prices: ordersData?.price?.map(
            (price) => new Big(price as string)
          ) as Array<Big>,
          amounts: ordersData?.amount?.map(
            (amount) => new Big(amount as string)
          ) as Array<Big>,
          totalPrice: new Big(ordersData?.totalPrice as string),
          averagePrice: new Big(ordersData?.weightedPrice as string),
          totalAmount: new Big(ordersData?.totalAmount as string),
          title: fav.title as string,
        },
        walletConfirmTransaction,
        walletRejectTransaction
      );
    }
  };

  const confirmButtonLabel = useMemo(() => {
    if (currentOrderType == OrderType.LIMIT) {
      if (confirmedLimitPrice) {
        return <FormattedMessage defaultMessage="Place Order" />;
      } else {
        return <FormattedMessage defaultMessage="Set Limit Price" />;
      }
    } else {
      if (props.transactionType == "sell") {
        return <FormattedMessage defaultMessage="Sell" />;
      } else {
        return <FormattedMessage defaultMessage="Buy" />;
      }
    }
  }, [currentOrderType, confirmedLimitPrice]);

  if (wrongNetwork) {
    return <WrongNetworkModal onClose={props.onClose} />;
  }
  if (!isConnected) {
    return <ConnectWalletModal onClose={props.onClose} />;
  }

  if (displayOpenWallet) {
    return (
      <OpenWalletModal
        orderType={isIPO ? undefined : currentOrderType}
        transactionType={props.transactionType}
        totalPrice={pricePerShare.times(tokenNumber)}
        onClose={props.onClose}
        fav={props.fav}
      />
    );
  }
  return (
    <Modal>
      <ModalContent className="buy-sell-modal">
        <h2 style={{ display: "flex", marginBottom: 10 }}>
          <span className="buy-title">
            <FormattedMessage
              defaultMessage="{transactionType, select, buy {Buy} other {Sell}} {token}"
              values={{
                token: fav.coin,
                transactionType: props.transactionType,
              }}
            />
          </span>
          <button className="close-button" onClick={props.onClose}>
            <img src={closeSrc} />
          </button>
        </h2>
        {isIPO ? null : (
          <>
            <div className="last-transaction">
              <FormattedMessage
                defaultMessage="Share Price {price} ETH"
                values={{ price: ppsData?.pps?.pps || 0 }}
              />
            </div>
            <OrderTypeToggle
              buySell={props.transactionType}
              orderType={currentOrderType}
              onChange={(newType) => setCurrentOrderType(newType)}
              style={{ margin: "24px 0px" }}
            />
          </>
        )}

        {currentOrderType == OrderType.LIMIT ? (
          <div>
            <input
              className="token-price-input"
              value={sharePriceInput}
              autoFocus
              placeholder="0"
              onChange={(e) => {
                setSharePriceInput(decimalInputTransformer(e.target.value, 8));
              }}
              type="number"
            />
            <div>
              <FormattedMessage defaultMessage="Enter Limit Share Price" />
            </div>
            <div className="limit-price-change">
              <FormattedMessage
                defaultMessage="{price} ETH  Maximum Price"
                values={{
                  price: maximalPPS.round(8, Big.roundDown).toFixed(),
                }}
              />
            </div>
            {inputPriceErrorMessage && (
              <div className="input-error-label">{inputPriceErrorMessage}</div>
            )}
            <hr
              style={{
                maxWidth: confirmedLimitPrice ? 325 : undefined,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            />
          </div>
        ) : null}
        {currentOrderType == OrderType.LIMIT && !confirmedLimitPrice ? (
          <>
            <div className="explanation-title">
              <FormattedMessage
                defaultMessage="What's a limit {transactionType, select, buy {buy} other {sell}}?"
                values={{ transactionType: props.transactionType }}
              />
            </div>
            <div className="explanation-text">
              {props.transactionType == "buy" ? (
                <FormattedMessage defaultMessage="A limit buy lets you specify the price per share you’d like to pay. Your pending limit order, if executed, will execute at your requested share price or better." />
              ) : (
                <FormattedMessage defaultMessage="A limit sell lets you specify the sale price per share you’d like to receive. Limit sells will not complete (fill) until a buyer is willing to buy your shares at the limit sell price you set, or higher. It is possible your sell order may not fill, or only partially fill." />
              )}
            </div>
          </>
        ) : (
          <>
            <input
              className="number-tokens-input"
              value={tokenInputText}
              autoFocus
              placeholder="0"
              onChange={(e) => {
                setTokenInputText(decimalInputTransformer(e.target.value, 8));
              }}
              type="number"
            />
            <div>
              <FormattedMessage
                defaultMessage="Enter Value in <blue>Shares</blue>"
                values={{
                  blue: (content: JSX.Element) => (
                    <span className="almost-white">{content}</span>
                  ),
                }}
              />
            </div>
            {inputErrorMessage ? (
              <div className="input-error-label">{inputErrorMessage}</div>
            ) : (
              <div className="remaining-shares-count">
                <FormattedMessage
                  defaultMessage="{tokens} Available"
                  values={{ tokens: availableShares.toFixed() }}
                />
              </div>
            )}
            <hr />
            {(currentOrderType == OrderType.MARKET || isIPO) && (
              <div className="price-row">
                <span className="price-field">
                  {isIPO ? (
                    <FormattedMessage defaultMessage="Price Per Share" />
                  ) : (
                    <FormattedMessage defaultMessage="Average Share Price" />
                  )}
                  {!isIPO && currentOrderType == OrderType.MARKET && (
                    <Tooltip
                      position="top"
                      tooltip={
                        <>
                          <TooltipTitle>
                            <FormattedMessage defaultMessage="What’s average share price?" />
                          </TooltipTitle>
                          <TooltipBody>
                            <FormattedMessage
                              defaultMessage="The average share price of  buy orders in the ‘Order book’. This may differ from the last sold price due to market fluctuation. <Link>Learn more</Link>"
                              values={{
                                Link: (content: JSX.Element) => (
                                  <HashLink
                                    to={howItWorksPath("order-book")}
                                    className="learn-more"
                                  >
                                    {content}
                                  </HashLink>
                                ),
                              }}
                            />
                          </TooltipBody>
                        </>
                      }
                    >
                      <img
                        src={infoSrc}
                        className="info-icon"
                        style={{ verticalAlign: "middle", marginLeft: 5 }}
                      />
                    </Tooltip>
                  )}
                </span>
                <span className="price-value">{`${pricePerShare
                  .round(8, Big.roundUp)
                  .toFixed()} ETH`}</span>
              </div>
            )}
            <div className="price-row total-price-row">
              <span className="price-field">
                <FormattedMessage defaultMessage="Total Price" />
              </span>
              <span className="price-value total-value">
                {`${totalPrice.round(8).toFixed()} ETH`}
                <span className="usd-value">
                  <USDLabel value={totalPriceUSD} />
                  {` USD`}
                </span>
              </span>
            </div>
          </>
        )}
        {transactionErrorMessage ? (
          <div className="error-box">
            <img className="error-icon" src={errorSrc} />
            <div className="error-messages">
              <div className="error-title">
                <FormattedMessage defaultMessage="Order failed" />
              </div>
              <div>{transactionErrorMessage}</div>
            </div>
          </div>
        ) : null}
        <div className="action-buttons-container">
          <button
            className="action-button cancel-button"
            onClick={props.onClose}
          >
            <FormattedMessage defaultMessage="Cancel" />
          </button>
          <button className="action-button buy-button" onClick={submit}>
            {confirmButtonLabel}
          </button>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default BuySellModal;
