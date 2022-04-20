import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { FormattedMessage, FormattedNumber } from "react-intl";
import {
  BixeeImageVar,
  Order,
  OrderDataQuery,
  OrderDataQueryVariables,
  OrderState,
  OrderType as TransactionType,
} from "../../../generated/graphql";
import { useEthereum } from "../../context/EthereumContext";
import BorderedButton from "../button/BorderedButton";
import FavThumb from "../fav/FavThumb";
import InfoBox from "../info/InfoBox";
import Modal from "../modal/Modal";
import ModalContent from "../modal/ModalContent";
import ModalTitle from "../modal/ModalTitle";
import OrderStatusLabel from "./OrderStatusLabel";
import backSrc from "../../assets/images/left-arrow.svg";
import { OrderType } from "../transaction/OrderTypeToggle";
import OpenWalletModal from "../transaction/OpenWalletModal";
import "./orderSummaryModal.scss";
import { useTransactionModal } from "../../context/TransactionModalContext";
import { useQuery } from "@apollo/client";
import ORDER_DATA_QUERY from "../../graphql/query/order_data_query";
import Loader from "../loader/Loader";
import Big, { RoundingMode } from "big.js";
import { Link } from "react-router-dom";
import { favPath } from "../../routes/pathBuilder";

interface Props {
  order: Order;
  onClose: () => void;
}

const OrderSummaryModal = (props: Props) => {
  const { order } = props;
  const { ethQuotation } = useEthereum();

  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [displayOpenWallet, setDisplayOpenWallet] = useState(false);

  const { withdrawOrder } = useEthereum();

  //TODO remove undefined comparision as query is fixed
  const shares = new Big(
    (order.shares != "undefined" && (order.shares as string)) || 0
  );
  const pps = new Big((order.pps as string) || 0);
  const totalShares = new Big((order.totalShares as string) || 0);
  const filled = totalShares.eq(0)
    ? new Big(0)
    : totalShares.minus(shares).div(totalShares);

  const totalPriceEth = pps.times(totalShares);

  const { displayTransaction } = useTransactionModal();

  const partialWithdraw = !new Big(order.shares || 0).eq(0);

  if (displayOpenWallet) {
    return (
      <OpenWalletModal
        orderType={OrderType.MARKET} //TODO fetch correct order type
        transactionType="withdraw"
        onClose={props.onClose}
      />
    );
  }

  return (
    <Modal>
      <ModalContent className="order-summary-modal">
        <div>
          {isWithdrawing ? (
            <>
              <ModalTitle onClose={props.onClose}>
                <BorderedButton
                  iconSrc={backSrc}
                  buttonProps={{
                    onClick: () => setIsWithdrawing(false),
                  }}
                />
              </ModalTitle>
              <ModalTitle
                titleStyle={{ display: "inline" }}
                style={{ textAlign: "center", display: "block" }}
              >
                <FormattedMessage defaultMessage="Withdraw" />
              </ModalTitle>
            </>
          ) : (
            <ModalTitle onClose={props.onClose}>
              <FormattedMessage defaultMessage="Order Summary" />
            </ModalTitle>
          )}
          {!isWithdrawing && (
            <span className="order-status">
              <OrderStatusLabel
                state={order.state as OrderState}
                displayText={
                  order.state == OrderState.Filled ? (
                    <FormattedMessage defaultMessage="Confirmed on Chain" />
                  ) : undefined
                }
              />
              {order.state == OrderState.Filled ? (
                <>
                  <span style={{ marginLeft: 8, marginRight: 8 }}>•</span>
                  <span className="filled-progress">
                    <FormattedMessage
                      defaultMessage="{filled}% Filled"
                      values={{ filled: filled.times(100).round(0).toFixed() }}
                    />
                  </span>
                </>
              ) : null}
            </span>
          )}
        </div>
        <div className="transaction-info">
          <Link
            to={favPath(order.fav?.title as string)}
            onClick={() => props.onClose()}
          >
            <FavThumb
              images={order.fav?.icons as Array<BixeeImageVar>}
              size={64}
              style={{ borderRadius: 16 }}
            />
          </Link>

          <div>
            <div>
              <Link
                to={favPath(order.fav?.title as string)}
                onClick={() => props.onClose()}
              >
                <span>{order.fav?.displayName}</span>
                <span className="coin-tag">{order.fav?.coin}</span>
              </Link>
            </div>
            <div className="type-date">
              <span className="order-type">
                <FormattedMessage
                  defaultMessage="{orderType, select, limit {Limit} market {Market} other {IPO}} {transactionType, select, buy {Buy} other {Sell}}"
                  values={{ orderType: "market", transactionType: order.type }}
                />
              </span>
              <span className="date-label">{` • ${dayjs(order.date).format(
                "MMM D, h:mma"
              )}`}</span>
            </div>
          </div>
        </div>
        <h3 className="details-title">
          <FormattedMessage defaultMessage="Order Details" />
        </h3>
        <div>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div className="detail-row">
              <span className="field-name">
                <FormattedMessage defaultMessage="Limit Share Price" />
              </span>
              <span className="field-value">{pps.round(8).toFixed()} ETH</span>
            </div>
            <div className="detail-row">
              <span className="field-name">
                <FormattedMessage defaultMessage="Number of Shares" />
              </span>
              <span className="field-value">
                {totalShares.round(8).toFixed()}
              </span>
            </div>
            {partialWithdraw ? (
              <ul>
                <li className="detail-row">
                  <span className="field-name">
                    <FormattedMessage defaultMessage="Filled Shares" />
                  </span>
                  <span className="field-value">
                    {totalShares.minus(shares).round(8).toFixed()}
                  </span>
                </li>
                <li className="detail-row">
                  <span className="field-name">
                    <FormattedMessage defaultMessage="Pending Shares" />
                  </span>
                  <span className="field-value">
                    {shares.round(8).toFixed()}
                  </span>
                </li>
              </ul>
            ) : null}
          </div>
          <hr />
          <div className="detail-row">
            <span className="field-name">
              <FormattedMessage defaultMessage="Total Price" />
            </span>
            <div className="field-value">
              <div>{totalPriceEth.round(8).toFixed()} ETH</div>
              <div className="usd-price">
                {
                  <FormattedNumber
                    style="currency"
                    currency="USD"
                    value={Number(ethQuotation.times(totalPriceEth).toFixed())}
                  />
                }{" "}
                USD
              </div>
            </div>
          </div>
        </div>
        {isWithdrawing && (
          <InfoBox>
            <FormattedMessage
              defaultMessage="You are about to withdraw {filled, select, 0 {} other {the pending portion of}} your order. This action cannot be undone."
              values={{
                filled: filled.times(100).round(0, Big.roundUp).toFixed(),
              }}
            />
          </InfoBox>
        )}
        <div className="buttons-container">
          {isWithdrawing ? (
            <>
              <button
                className="action-button blue-button"
                onClick={() => {
                  setDisplayOpenWallet(true);
                  withdrawOrder(
                    {
                      price: pps,
                      type: order.type as "buy" | "sell",
                      address: order.fav?.address as string,
                      // amount: shares as number,
                      // title: order.fav?.title as string,
                    },
                    (address) => {
                      props.onClose();
                      displayTransaction({
                        partialWithdraw: partialWithdraw,
                        address,
                        transactionType: "withdraw",
                      });
                    },
                    () => {
                      props.onClose();
                    }
                  );
                }}
              >
                <FormattedMessage defaultMessage="Continue Withdraw" />
              </button>
              {order.state == OrderState.Filled && (
                <button
                  className="action-button secondary-button"
                  onClick={() => setIsWithdrawing(false)}
                >
                  <FormattedMessage defaultMessage="Cancel" />
                </button>
              )}
            </>
          ) : (
            <>
              <button
                className="action-button blue-button"
                onClick={props.onClose}
              >
                <FormattedMessage defaultMessage="OK" />
              </button>
              {order.state == OrderState.Filled && (
                <button
                  className="action-button secondary-button"
                  onClick={() => setIsWithdrawing(true)}
                >
                  {shares.eq(totalShares) ? (
                    <FormattedMessage defaultMessage="Withdraw Order" />
                  ) : (
                    <FormattedMessage defaultMessage="Withdraw Pending Shares" />
                  )}
                </button>
              )}
            </>
          )}
          <a
            href={`https://rinkeby.etherscan.io/tx/${order.tx}`}
            target="_blank"
            referrerPolicy="no-referrer"
            style={{ marginTop: 24 }}
            rel="noreferrer"
            className="ether-scan-link"
          >
            <FormattedMessage defaultMessage="View on Etherscan" />
          </a>
        </div>
      </ModalContent>
    </Modal>
  );
};

export default OrderSummaryModal;

export const OrderSummaryWithTx = (props: {
  tx: string;
  onClose: () => void;
}) => {
  const { tx } = props;
  const { data, loading } = useQuery<OrderDataQuery, OrderDataQueryVariables>(
    ORDER_DATA_QUERY,
    {
      fetchPolicy: "network-only",
      variables: {
        uuid: tx,
      },
    }
  );
  if (loading) {
    return (
      <Modal>
        <ModalContent>
          <ModalTitle onClose={props.onClose}></ModalTitle>
          <Loader />
        </ModalContent>
      </Modal>
    );
  }
  return <OrderSummaryModal {...props} order={data?.orderData as Order} />;
};
