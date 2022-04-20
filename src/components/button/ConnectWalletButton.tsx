import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import { useHistory } from "react-router-dom";
import { homePath } from "../../routes/pathBuilder";
import ConnectWalletModal from "../wallet/ConnectWalletModal";
import "./connectWalletButton.scss";

const ConnectWalletButton = (props: { onConnect?: () => void }) => {
  const [connectModalVisible, setConnectModalVisible] = useState(false);
  const history = useHistory();
  return (
    <>
      <button
        className="connect-wallet-button"
        onClickCapture={() => setConnectModalVisible(true)}
      >
        <FormattedMessage defaultMessage="Connect Wallet" />
      </button>
      {connectModalVisible && (
        <ConnectWalletModal
          onClose={() => {
            setConnectModalVisible(false);
            if (props.onConnect) {
              props.onConnect();
            }
          }}
        />
      )}
    </>
  );
};

export default ConnectWalletButton;
