import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
} from "react";
import ABIs from "../constants/ABI";
import {
  readEthereumTransaction,
  writeEthereumTransaction,
} from "../local-storage/EthereumTransactionManager";
import { useApolloClient, useMutation, useQuery } from "@apollo/client";
import {
  CheckForUpdateMutation,
  CheckForUpdateMutationVariables,
  EthQuotationQuery,
  EthQuotationQueryVariables,
  EthGasQuotationQuery,
  EthGasQuotationQueryVariables,
  AddTxMutation,
  AddTxMutationVariables,
  EventType,
  NotificationOrderTxType,
  NotificationOrderOrderType,
} from "../../generated/graphql";
import CHECK_FOR_UPDATE_MUTATION from "../graphql/mutation/check_update_mutation";
import ETH_QUOTATION_QUERY from "../graphql/query/eth_quotation_query";
import ETH_GAS_QUERY from "../graphql/query/eth_gas_query";
import { useWallet } from "./WalletContext";
import ADD_TRANSACTIONS_QUERY from "../graphql/mutation/add_transaction";
import Big from "big.js";

interface EthereumContextValue {
  buyIPO: (
    transactionInfo: {
      address: string;
      price: Big;
      number: Big;
      title: string;
    },
    onSuccess?: (address: string) => void,
    onError?: (message: string) => void
  ) => void;
  ethQuotation: Big;
  gasQuotation: Big;
  placeOrder: (
    transaction: {
      type: "sell" | "buy";
      amount: Big;
      price: Big;
      address: string;
      title: string;
    },
    onSuccess?: (address: string) => void,
    onError?: (message: string) => void
  ) => void;
  fulfillOrders: (
    transaction: {
      type: "buy" | "sell";
      contractAddress: string;
      addresses: Array<string>;
      prices: Array<Big>;
      amounts: Array<Big>;
      totalPrice: Big;
      averagePrice: Big;
      totalAmount: Big;
      title: string;
    },
    onSuccess?: (address: string) => void,
    onError?: (message: string) => void
  ) => void;
  withdrawOrder: (
    transation: {
      price: Big;
      address: string;
      type: "buy" | "sell";
    },
    onSuccess?: (address: string) => void,
    onError?: (message: string) => void
  ) => void;
}

const NUMBER_FRACTIONS_PER_SHARE = new Big(100000000);
const EthereumContext = createContext<EthereumContextValue>({
  buyIPO: () => undefined,
  placeOrder: () => undefined,
  fulfillOrders: () => undefined,
  ethQuotation: new Big(0),
  gasQuotation: new Big(0),
  withdrawOrder: () => undefined,
});

export const useEthereum = () =>
  useContext<EthereumContextValue>(EthereumContext);

export const EthereumProvider = (props: PropsWithChildren<unknown>) => {
  const { walletAddresses, web3 } = useWallet();

  // const [updateFavMutation] = useMutation<
  //   CheckForUpdateMutation,
  //   CheckForUpdateMutationVariables
  // >(CHECK_FOR_UPDATE_MUTATION);

  const ethQuotationData = useQuery<
    EthQuotationQuery,
    EthQuotationQueryVariables
  >(ETH_QUOTATION_QUERY, {
    pollInterval: 5 * 60 * 1000,
  });
  // const gasQuotationData = useQuery<
  //   EthGasQuotationQuery,
  //   EthGasQuotationQueryVariables
  // >(ETH_GAS_QUERY, {
  //   pollInterval: 5 * 60 * 1000,
  // });

  const [addTx] = useMutation<AddTxMutation, AddTxMutationVariables>(
    ADD_TRANSACTIONS_QUERY
  );

  const fulfillOrders = (
    transactionInfo: {
      type: "buy" | "sell";
      contractAddress: string;
      addresses: Array<string>;
      prices: Array<Big>;
      amounts: Array<Big>;
      totalPrice: Big;
      averagePrice: Big;
      totalAmount: Big;
      title: string;
    },
    onSuccess?: (address: string) => void,
    onError?: (message: string) => void
  ) => {
    if (!web3 || !walletAddresses) {
      return;
    }

    const {
      type,
      contractAddress,
      addresses,
      prices,
      amounts,
      totalPrice,
      averagePrice,
      totalAmount,
      title,
    } = transactionInfo;
    const contract = new web3.eth.Contract(ABIs.v3 as any, contractAddress);

    const transaction =
      type == "buy"
        ? contract.methods.buyFromSellOrder(
            addresses,
            prices.map((ethPrice) => web3.utils.toWei(ethPrice.toFixed())),
            amounts.map((amount) =>
              amount.times(NUMBER_FRACTIONS_PER_SHARE).toFixed()
            )
          )
        : contract.methods.sellToBuyOrder(
            addresses,
            prices.map((ethPrice) => web3.utils.toWei(ethPrice.toFixed())),
            amounts.map((amount) =>
              amount.times(NUMBER_FRACTIONS_PER_SHARE).toFixed()
            )
          );

    const totalPriceWei = web3.utils.toWei(totalPrice.toFixed());
    transaction.send(
      {
        from: walletAddresses[0],
        value: type == "sell" ? 0 : totalPriceWei,
      },
      (error: any, hash: any) => {
        if (!error) {
          addTx({
            variables: {
              hash: hash,
              title: title,
              type: NotificationOrderOrderType.Market,
              event:
                type == "buy"
                  ? NotificationOrderTxType.Buy
                  : NotificationOrderTxType.Sell,
              price: averagePrice.toFixed(),
              amount: totalAmount.times(NUMBER_FRACTIONS_PER_SHARE).toFixed(),
            },
          });
          if (onSuccess) {
            onSuccess(hash);
          }
        } else {
          if (onError) {
            onError(error.message);
          }
        }
      }
    );
  };

  const placeOrder = (
    transactionProps: {
      type: "sell" | "buy";
      amount: Big;
      price: Big;
      address: string;
      title: string;
    },
    onSuccess?: (address: string) => void,
    onError?: (message: string) => void
  ) => {
    if (!web3 || !walletAddresses) {
      return;
    }

    const { type, amount, price, address, title } = transactionProps;
    const weiPrice = web3.utils.toWei(price.toFixed());
    const contract = new web3.eth.Contract(ABIs.v3 as any, address);
    const transaction =
      type == "buy"
        ? contract.methods.placeBuyOrder(
            amount.times(NUMBER_FRACTIONS_PER_SHARE).toFixed(),
            weiPrice
          )
        : contract.methods.placeSellOrder(
            amount.times(NUMBER_FRACTIONS_PER_SHARE).toFixed(),
            weiPrice
          );
    transaction.send(
      {
        from: walletAddresses[0],
        value: type == "sell" ? 0 : amount.times(weiPrice).toFixed(),
      },
      (error: any, hash: any) => {
        if (!error) {
          addTx({
            variables: {
              hash: hash,
              title: title,
              type: NotificationOrderOrderType.Limit,
              event:
                type == "buy"
                  ? NotificationOrderTxType.Buy
                  : NotificationOrderTxType.Sell,
              price: price.toFixed(),
              amount: amount.toFixed(),
            },
          });
          if (onSuccess) {
            onSuccess(hash);
          }
        } else {
          if (onError) {
            onError(error.message);
          }
        }
      }
    );
  };
  const buyIPO = (
    {
      price,
      number,
      address,
      title,
    }: {
      price: Big;
      number: Big;
      address: string;
      title: string;
    },

    onSuccess?: (address: string) => void,
    onError?: (message: string) => void
  ) => {
    if (!web3 || !walletAddresses) {
      return;
    }
    const weiPrice = web3.utils.toWei(price.toFixed());

    const contract = new web3.eth.Contract(ABIs.v3 as any, address);

    const transaction = contract.methods.buyFromIPO(
      number.times(NUMBER_FRACTIONS_PER_SHARE).toFixed(),
      weiPrice
    );

    return transaction.send(
      {
        from: walletAddresses[0],
        value: number.times(weiPrice).toFixed(),
      },
      (error: any, hash: any) => {
        if (!error) {
          addTx({
            variables: {
              hash: hash,
              title: title,
              type: NotificationOrderOrderType.Ipo,
              event: NotificationOrderTxType.Buy,
              price: price.toFixed(),
              amount: number.toFixed(),
            },
          });
          if (onSuccess) {
            onSuccess(hash);
          }
        } else {
          if (onError) {
            onError(error.message);
          }
        }
      }
    );
  };

  const withdrawOrder = (
    {
      price,
      address,
      type,
    }: {
      price: Big;
      address: string;
      type: "buy" | "sell";
    },
    onSuccess?: (address: string) => void,
    onError?: (message: string) => void
  ) => {
    if (!web3 || !walletAddresses) {
      return;
    }
    const contract = new web3.eth.Contract(ABIs.v3 as any, address);

    const weiPrice = web3.utils.toWei(price.toFixed());
    const withdrawBuyOrderTransaction =
      type == "buy"
        ? contract.methods.withdrawBuyOrder(weiPrice)
        : contract.methods.withdrawSellOrder(weiPrice);
    return withdrawBuyOrderTransaction.send(
      {
        from: walletAddresses[0],
        value: 0,
      },
      (error: any, hash: any) => {
        if (!error) {
          if (onSuccess) {
            onSuccess(hash);
          }
        } else {
          if (onError) {
            onError(error.message);
          }
        }
      }
    );
  };
  const ethQuotation = ethQuotationData.data?.ethQuotation
    ? new Big(ethQuotationData.data?.ethQuotation)
    : new Big(0);

  return (
    <EthereumContext.Provider
      value={{
        buyIPO,
        ethQuotation,
        gasQuotation: new Big(0),
        placeOrder,
        fulfillOrders,
        withdrawOrder,
        // ( gasQuotationData.data?.ethGaz?.average || 0) * Math.pow(10, -9),
      }}
    >
      {props.children}
    </EthereumContext.Provider>
  );
};
