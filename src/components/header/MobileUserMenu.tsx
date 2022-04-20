import { responsePathAsArray } from "graphql";
import React, { useContext, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import { Link, useLocation } from "react-router-dom";
import { useWallet } from "../../context/WalletContext";
import PopupFullpageResponsive from "../modal/PopupFullpageResponsive";
import "./mobileUserMenu.scss";

const MobileUserMenu = (props: {
  onClose?: () => void;
  hideNotifications?: boolean;
}) => {
  const location = useLocation();
  const { disconnect } = useWallet();
  return (
    <PopupFullpageResponsive
      className="mobile-user-menu"
      onClose={props.onClose}
    >
      <Link
        to="/portfolio"
        className={`menu-item ${
          location.pathname.startsWith("/portfolio") ? "active-row" : ""
        }`}
        onClick={props.onClose}
      >
        <FormattedMessage defaultMessage="Portfolio" />
      </Link>
      {!props.hideNotifications && (
        <Link
          to="/notifications"
          className={`menu-item ${
            location.pathname.startsWith("/notifications") ? "active-row" : ""
          }`}
          onClick={props.onClose}
        >
          <FormattedMessage defaultMessage="Notifications" />
        </Link>
      )}
      <button
        className={`menu-item`}
        onClick={() => {
          disconnect();
          if (props.onClose) {
            props.onClose();
          }
        }}
      >
        <FormattedMessage defaultMessage="Disconnect" />
      </button>
    </PopupFullpageResponsive>
  );
};

export default MobileUserMenu;
