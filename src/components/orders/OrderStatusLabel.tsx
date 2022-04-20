import React from "react";
import { FormattedMessage } from "react-intl";
import { OrderState } from "../../../generated/graphql";
import "./orderStatusLabel.scss";

const statusMessages = {
  [OrderState.Pending]: <FormattedMessage defaultMessage="Processing" />,
  [OrderState.Completed]: <FormattedMessage defaultMessage="Completed" />,
  [OrderState.Withdrawn]: <FormattedMessage defaultMessage="Withdrawn" />,
  [OrderState.Filled]: <FormattedMessage defaultMessage="Filled" />,
  [OrderState.Failed]: <FormattedMessage defaultMessage="Failed" />,
};

const OrderStatusLabel = (props: {
  state: OrderState;
  filledProgress?: number;
  displayText?: JSX.Element;
}) => {
  const { state, filledProgress, displayText } = props;
  return (
    <span className={`order-status-label ${state}`}>
      {displayText || (
        <>
          {props.state == OrderState.Filled &&
            filledProgress != undefined &&
            `${filledProgress}% `}
          {statusMessages[state]}
        </>
      )}
    </span>
  );
};

export default OrderStatusLabel;
