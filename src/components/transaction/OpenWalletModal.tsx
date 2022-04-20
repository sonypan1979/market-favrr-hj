import React from "react";
import Modal from "../modal/Modal";
import closeSrc from "../../assets/images/close.svg";
import { FormattedMessage } from "react-intl";
import "./orderPlacedModal.scss";
import ModalContent from "../modal/ModalContent";
import BorderedButton from "../button/BorderedButton";
import { Bixee, TxStatus } from "../../../generated/graphql";
import { OrderType } from "./OrderTypeToggle";
import { formatEthPrice } from "../../util/stringUtils";
import favIcon from "../../assets/images/loader.svg";
import infoIcon from "../../assets/images/info-purple.svg";
import "./openWalletModal.scss";
import InfoBox from "../info/InfoBox";
import Loader from "../loader/Loader";
import Big from "big.js";

const OpenWalletModal = (props: {
  onClose: () => void;
  transactionType: "buy" | "sell" | "withdraw";
  orderType?: OrderType; //Undefined means IPO
  totalPrice?: Big;
  fav?: Bixee;
}) => {
  const { onClose, orderType, transactionType, totalPrice } = props;

  return (
    <Modal>
      <ModalContent className="open-wallet-modal">
        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <BorderedButton
            buttonProps={{ className: "close-button", onClick: onClose }}
            iconSrc={closeSrc}
          />
        </div>
        <Loader />
        <h2 className="title">
          <FormattedMessage defaultMessage="Opening Wallet" />
        </h2>
        <div className="subtitle">
          <FormattedMessage
            defaultMessage="Follow wallet instructions to complete your {action, select, withdraw {withdraw} other {order}}."
            values={{
              action: transactionType == "withdraw" ? "withdraw" : "order",
            }}
          />
        </div>
        {totalPrice ? (
          <InfoBox>
            <FormattedMessage
              defaultMessage="You are placing {orderType, select, null {an} other {a}} {orderType} order to {transactionType} {price} ETH of {coin}. Your pending {orderType} order, if executed, will execute at your requested share price or better."
              values={{
                price: totalPrice.round(8).toFixed(),
                orderType:
                  orderType == OrderType.LIMIT
                    ? "limit"
                    : orderType == OrderType.MARKET
                    ? "market"
                    : null,
                transactionType,
                coin: props.fav?.coin,
              }}
            />
          </InfoBox>
        ) : null}
        <button
          className="action-button blue-button done-btn"
          onClick={props.onClose}
        >
          <FormattedMessage defaultMessage="OK" />
        </button>
      </ModalContent>
    </Modal>
  );
};

export default OpenWalletModal;
