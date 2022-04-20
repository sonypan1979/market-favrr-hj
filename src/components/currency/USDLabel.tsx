import React from "react";
import Big from "big.js";
import { FormattedNumber } from "react-intl";

const USDLabel = (props: { value: Big }) => {
  const { value } = props;
  return (
    <FormattedNumber
      style="currency"
      currency="USD"
      value={Number(value.toFixed())}
    />
  );
};

export default USDLabel;
