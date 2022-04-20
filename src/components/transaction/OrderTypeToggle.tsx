import React, { useState } from "react";
import { FormattedMessage } from "react-intl";
import "./orderTypeToggle.scss";

export enum OrderType {
  MARKET,
  LIMIT,
}

const OrderTypeToggle = (props: {
  buySell: "buy" | "sell";
  orderType: OrderType;
  onChange?: (newOrder: OrderType) => void;
  style: React.CSSProperties;
}) => {
  const { buySell, orderType, onChange, style } = props;

  const selectedIndex = orderType == OrderType.MARKET ? 0 : 1;

  return (
    <div className="order-type-toggle" style={style}>
      <div className="inner-container">
        <div
          className="active-button-background"
          style={{ left: `${selectedIndex * 50}%` }}
        />
        <button
          className={`${orderType == OrderType.MARKET ? "active-tab" : ""}`}
          onClick={() => {
            if (onChange && orderType != OrderType.MARKET)
              onChange(OrderType.MARKET);
          }}
        >
          <FormattedMessage
            defaultMessage="Market {type, select, buy {Buy} other {Sell}}"
            values={{ type: buySell }}
          />
        </button>
        <button
          className={`${orderType == OrderType.LIMIT ? "active-tab" : ""}`}
          onClick={() => {
            if (onChange && orderType != OrderType.LIMIT)
              onChange(OrderType.LIMIT);
          }}
        >
          <FormattedMessage
            defaultMessage="Limit {type, select, buy {Buy} other {Sell}}"
            values={{ type: buySell }}
          />
        </button>
      </div>
    </div>
  );
};

export default OrderTypeToggle;
