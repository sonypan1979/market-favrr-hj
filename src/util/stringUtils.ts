import Big from "big.js";

const ETH_PRICE_SIGNIFICANT_DIGITS = 6;
export const formatEthPrice = (price: number) => {
  const parsed = price.toPrecision(10).replace(/\.?0*$/g, "");

  let firstSignificantDigit = 0;
  while (
    parsed[firstSignificantDigit] == "0" ||
    (parsed[firstSignificantDigit] == "." &&
      firstSignificantDigit < parsed.length - 1)
  ) {
    firstSignificantDigit++;
  }
  return parsed.slice(
    0,
    Math.max(ETH_PRICE_SIGNIFICANT_DIGITS, firstSignificantDigit + 1)
  );
};

const MAX_USERNAME_SIZE = 13;
export const formatUserDisplay = (address: string, username?: string) => {
  if (username) {
    return username.length > MAX_USERNAME_SIZE
      ? `${username.slice(0, MAX_USERNAME_SIZE - 3)}...`
      : username;
  } else {
    return `${address.toUpperCase().slice(0, 6)}...${address
      .toUpperCase()
      .slice(9 - MAX_USERNAME_SIZE)}`;
  }
};

export const decimalInputTransformer = (
  value: string,
  maxDecimalPlaces: number
) => {
  const parts = value.split(".");
  return parts.length > 1
    ? parts[0] + "." + parts[1].slice(0, maxDecimalPlaces)
    : parts[0];
};
