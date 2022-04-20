import React from "react";
import { FormattedMessage, useIntl } from "react-intl";
import Modal from "./Modal";
import loaderSrc from "../../assets/images/loader.svg";
import closeSrc from "../../assets/images/close.svg";
import commons from "../../localization/commons";
import "./wrongNetworkModal.scss";
import Loader from "../loader/Loader";

const WrongNetworkModal = (props: { onClose?: () => void }) => {
  return (
    <Modal>
      <div className="wrong-network-modal">
        <div className="first-section">
          <Loader />
          <button className="close-button" onClick={props.onClose}>
            <img src={closeSrc} />
          </button>
        </div>
        <h2 className="title">
          <FormattedMessage defaultMessage="Wrong Network" />
        </h2>
        <div className="description">
          <FormattedMessage
            defaultMessage="Please change your network to <Network>Rinkeby Test Network</Network>"
            values={{
              Network: (content: JSX.Element) => (
                <>
                  <br />
                  <span className="network-name">{content}</span>
                </>
              ),
            }}
          />
        </div>
        <button className="action-button" onClick={props.onClose}>
          <FormattedMessage defaultMessage="Ok" />
        </button>
      </div>
    </Modal>
  );
};

export default WrongNetworkModal;
