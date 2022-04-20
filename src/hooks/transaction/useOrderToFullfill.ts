import { useQuery } from "@apollo/client";
import Big from "big.js";
import {
  FulfillBuyOrderQuery,
  FulfillBuyOrderQueryVariables,
  FulfillSellOrderQuery,
  FulfillSellOrderQueryVariables,
} from "../../../generated/graphql";
import FULFILL_BUY_ORDER from "../../graphql/query/fullfill_buy_order";
import FULFILL_SELL_ORDER from "../../graphql/query/fullfill_sell_order";

const useOrderToFullfill = (props: {
  type: "sell" | "buy";
  title: string;
  amount: Big;
  skip?: boolean;
}) => {
  const { type, amount, title, skip } = props;

  const { data: buyData, loading: buyLoading } = useQuery<
    FulfillBuyOrderQuery,
    FulfillBuyOrderQueryVariables
  >(FULFILL_BUY_ORDER, {
    skip: type != "buy" || skip,
    fetchPolicy: "network-only",
    variables: {
      title,
      amount: amount.toFixed(),
    },
  });
  const { data: sellData, loading: sellLoading } = useQuery<
    FulfillSellOrderQuery,
    FulfillSellOrderQueryVariables
  >(FULFILL_SELL_ORDER, {
    skip: type != "sell" || skip,
    fetchPolicy: "network-only",
    variables: {
      title,
      amount: amount.toFixed(),
    },
  });

  if (skip) {
    return {
      data: null,
      loading: false,
    };
  }
  return {
    data: type == "buy" ? buyData?.fulfillBuyOrder : sellData?.fulfillSellOrder,
    loading: type == "buy" ? buyLoading : sellLoading,
  };
};

export default useOrderToFullfill;
