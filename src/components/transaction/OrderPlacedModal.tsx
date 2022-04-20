import React, { useEffect, useState } from "react";
import Modal from "../modal/Modal";
import closeSrc from "../../assets/images/close.svg";
import { FormattedMessage } from "react-intl";
import { useQuery } from "@apollo/client";
import "./orderPlacedModal.scss";
import ModalContent from "../modal/ModalContent";
import BorderedButton from "../button/BorderedButton";
import {
  OrderState,
  TxStatus,
  TxStatusQuery,
  TxStatusQueryVariables,
} from "../../../generated/graphql";
import { OrderType } from "./OrderTypeToggle";
import TX_STATUS_QUERY from "../../graphql/query/tx_status_query";
import { formatEthPrice } from "../../util/stringUtils";
import OrderStatusLabel from "../orders/OrderStatusLabel";
import Big from "big.js";

const MAX_USERNAME_SIZE = 13;

const OrderPlacedModal = (props: {
  onClose: () => void;
  tokenNumber?: Big;
  tokenName?: string;
  transactionType: "buy" | "sell" | "withdraw";
  orderType?: OrderType; //Undefined means IPO
  transactionAddress: string;
  totalPrice?: Big;
  partialWithdraw?: boolean;
}) => {
  const {
    tokenNumber,
    tokenName,
    onClose,
    transactionAddress,
    orderType,
    transactionType,
    totalPrice,
    partialWithdraw,
  } = props;

  const [intervalUpdateStatus, setIntervalUpdateStatus] = useState(true);
  const { data: txData } = useQuery<TxStatusQuery, TxStatusQueryVariables>(
    TX_STATUS_QUERY,
    {
      variables: {
        tx: props.transactionAddress,
      },
      pollInterval: intervalUpdateStatus ? 4000 : undefined,
    }
  );

  useEffect(() => {
    if (txData?.txStatus == TxStatus.Completed) {
      setIntervalUpdateStatus(false);
    }
  }, [txData?.txStatus]);

  return (
    <Modal>
      <ModalContent className="order-placed-modal">
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <BorderedButton
            buttonProps={{ className: "close-button", onClick: onClose }}
            iconSrc={closeSrc}
          />
        </div>
        <h2 className="buy-title">
          {transactionType == "withdraw" ? (
            partialWithdraw ? (
              <FormattedMessage defaultMessage="Partial Order Withdrawn" />
            ) : (
              <FormattedMessage defaultMessage="Order Withdrawn" />
            )
          ) : (
            <>
              <span>
                <FormattedMessage
                  defaultMessage="{type, select, market {Market} limit {Limit} other {}}"
                  values={{
                    type:
                      orderType == OrderType.LIMIT
                        ? "Limit"
                        : orderType == OrderType.MARKET
                        ? "Market"
                        : null,
                  }}
                />
              </span>
              {orderType != undefined ? <br /> : null}
              <span>
                <FormattedMessage
                  defaultMessage="Order Placed"
                  values={{
                    type:
                      orderType == OrderType.LIMIT
                        ? "limit"
                        : orderType == OrderType.MARKET
                        ? "market"
                        : null,
                  }}
                />
              </span>
            </>
          )}
        </h2>
        <div className="purchased-token-number">
          {transactionType == "withdraw" ? null : orderType == undefined ? (
            <FormattedMessage
              defaultMessage="You purchased <b>{tokenNumber} {tokenName}</b>"
              values={{
                tokenNumber: tokenNumber?.toFixed(),
                tokenName,
                b: (content: JSX.Element) => <b>{content}</b>,
              }}
            />
          ) : (
            <FormattedMessage
              defaultMessage="{orderType, select, market {Market} limit {Limit} other {}} {transactionType} of <b>{tokenNumber} {tokenName}</b> at <b>{ethPrice} ETH</b>"
              values={{
                tokenNumber: tokenNumber?.toFixed(),
                tokenName,
                b: (content: JSX.Element) => <b>{content}</b>,
                orderType: orderType == OrderType.LIMIT ? "limit" : "market",
                transactionType: transactionType,
                ethPrice: totalPrice?.round(8).toFixed(),
              }}
            />
          )}
        </div>
        <div className="transaction-box">
          <div className="column">
            <span>
              <FormattedMessage defaultMessage="Status" />
            </span>
            <span
              className={`transaction-status ${txData?.txStatus || "pending"}`}
            >
              {(txData?.txStatus == TxStatus.Pending ||
                txData?.txStatus == undefined) &&
                (transactionType == "withdraw" ? (
                  <OrderStatusLabel state={OrderState.Withdrawn} />
                ) : (
                  <OrderStatusLabel state={OrderState.Pending} />
                ))}
              {txData?.txStatus == TxStatus.Completed && (
                <OrderStatusLabel state={OrderState.Completed} />
              )}
              {txData?.txStatus == TxStatus.Rejected && (
                <OrderStatusLabel state={OrderState.Failed} />
              )}
            </span>
          </div>
          <div className="column">
            <span>
              <FormattedMessage defaultMessage="Order ID" />
            </span>
            <span className="transaction-address">
              {`${transactionAddress?.slice(
                0,
                6
              )}...${transactionAddress?.slice(9 - MAX_USERNAME_SIZE)}`}
            </span>
          </div>
        </div>
        <button
          className="action-button blue-button done-btn"
          onClick={props.onClose}
        >
          <FormattedMessage defaultMessage="Done" />
        </button>
      </ModalContent>
    </Modal>
  );
};

export default OrderPlacedModal;
