import Big from "big.js";
import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useState,
} from "react";
import OrderPlacedModal from "../components/transaction/OrderPlacedModal";
import { OrderType } from "../components/transaction/OrderTypeToggle";

interface Transaction {
  address: string;
  orderType?: OrderType;
  transactionType: "buy" | "sell" | "withdraw";
  amount?: Big;
  totalPrice?: Big;
  coin?: string;
  partialWithdraw?: boolean;
}

interface TransactionModalContextValue {
  displayTransaction: (transaction: Transaction) => void;
  hideTransaction: (transaction: Transaction) => void;
}

const TransactionModalContext = createContext<TransactionModalContextValue>({
  displayTransaction: () => undefined,
  hideTransaction: () => undefined,
});
export const useTransactionModal = () =>
  useContext<TransactionModalContextValue>(TransactionModalContext);
export const TransactionModalProvider = (props: PropsWithChildren<unknown>) => {
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  return (
    <>
      {transaction && (
        <OrderPlacedModal
          transactionAddress={transaction.address}
          orderType={transaction.orderType}
          transactionType={transaction.transactionType}
          tokenNumber={transaction.amount}
          totalPrice={transaction.totalPrice}
          onClose={() => setTransaction(null)}
          tokenName={transaction.coin}
          partialWithdraw={transaction.partialWithdraw}
        />
      )}
      <TransactionModalContext.Provider
        value={{
          displayTransaction: (transaction: Transaction) =>
            setTransaction(transaction),
          hideTransaction: () => setTransaction(null),
        }}
      >
        {props.children}
      </TransactionModalContext.Provider>
    </>
  );
};
