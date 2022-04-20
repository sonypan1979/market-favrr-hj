import React, {
  createContext,
  PropsWithChildren,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import WalletLink, { WalletLinkProvider } from "walletlink";
import { ErrorResponse } from "walletlink/dist/relay/Web3Response";
import Web3 from "web3";
import { WalletType } from "../constants/wallet";
import {
  getLocalLastAddress,
  removeLocalLastAddress,
  storeLocalLastAddress,
} from "../local-storage/localStorageUtil";
import { customApolloContext } from "./GraphqlProvider";

interface WalletContextValue {
  connectWallet: (
    walletProvider: WalletType | null
  ) => undefined | Promise<unknown>;
  disconnect: () => void;
  walletAddresses: null | Array<string>;
  web3: Web3 | null;
  supportedWallets: Array<WalletType>;
  wrongNetwork: boolean;
  isConnected: boolean;
}

const WalletContext = createContext<WalletContextValue>({
  connectWallet: () => undefined,
  disconnect: () => undefined,
  walletAddresses: null,
  web3: null,
  supportedWallets: [],
  wrongNetwork: false,
  isConnected: false,
});

const APP_NAME =
  process.env.OCEANA_ENV == "true" ? "Market Oceana" : "Market FAVRR";
const APP_LOGO_URL = "https://example.com/logo.png";
const ETH_JSONRPC_URL =
  "https://rinkeby.infura.io/v3/4e4b3ea82f7e4857b42460d39ebcc987";
const CHAIN_ID = 1;

export const useWallet = () => useContext<WalletContextValue>(WalletContext);
export const WalletProvider = (props: PropsWithChildren<unknown>) => {
  const [web3Instance, setWeb3Instance] = useState<Web3 | null>(null);
  const [isWrongNetwork, setIsWrongNetwork] = useState(false);
  const [walletAddresses, setWalletAddresses] = useState(
    getLocalLastAddress()
      ? [getLocalLastAddress() as string]
      : (null as Array<string> | null)
  );

  const supportedWallets = useMemo(() => {
    const results = [WalletType.COINBASE];

    const supportMetamask =
      (window as any).web3?.currentProvider?.isMetaMask ||
      (window as any).ethereum?.isMetaMask;
    if (supportMetamask) {
      results.push(WalletType.METAMASK);
    }

    return results;
  }, []);

  useEffect(() => {
    if (!web3Instance) {
      return;
    }

    (web3Instance.eth.currentProvider as WalletLinkProvider).on(
      "networkChanged",
      (networkId: string) => {
        const isWrongNetwork = networkId != "4";
        setIsWrongNetwork(isWrongNetwork);
      }
    );

    web3Instance.eth.net.getId().then((networkId) => {
      const updatedIsWrong = networkId != 4;
      if (updatedIsWrong != isWrongNetwork) {
        setIsWrongNetwork(updatedIsWrong);
      }
    });
  }, [web3Instance]);

  const connectWallet = async (walletProvider: WalletType | null) => {
    let provider: null | WalletLinkProvider = null;
    switch (walletProvider) {
      case null:
        if ((window as any).ethereum) {
          provider = (window as any).ethereum;
        }
        break;
      case WalletType.COINBASE:
        const walletLink = new WalletLink({
          appName: APP_NAME,
          appLogoUrl: APP_LOGO_URL,
          darkMode: true,
        });
        provider = walletLink.makeWeb3Provider(ETH_JSONRPC_URL, CHAIN_ID);
        break;
      case WalletType.METAMASK:
        // Checking if Web3 has been injected by the browser (Mist/MetaMask)
        if (
          (window as any).web3?.currentProvider?.isMetaMask ||
          (window as any).ethereum?.isMetaMask
        ) {
          provider =
            (window as any).web3.currentProvider || (window as any).ethereum;
        }
        break;
    }

    if (!provider) {
      setWalletAddresses(null);
      throw "Provider not found";
    }

    const newWeb3Instance = new Web3(provider);
    setWeb3Instance(newWeb3Instance);
    const accounts = await provider.enable();
    setWalletAddresses(accounts.map((str) => str.toLowerCase()));
  };

  const disconnectWallet = () => {
    setWalletAddresses(null);
    removeLocalLastAddress();
  };

  useEffect(() => {
    //Initial connect attempt
    const lastAddress = getLocalLastAddress();
    if (lastAddress) {
      connectWallet(null);
    }
  }, []);
  const isConnected = !!walletAddresses?.length;

  const { setAddressHeader } = useContext(customApolloContext);
  useEffect(() => {
    const address = walletAddresses?.length ? walletAddresses[0] : null;
    if (address) {
      storeLocalLastAddress(address);
    } else {
      removeLocalLastAddress();
    }
    setAddressHeader(address);
  }, [walletAddresses]);

  return (
    <WalletContext.Provider
      value={{
        connectWallet,
        disconnect: disconnectWallet,
        web3: web3Instance,
        supportedWallets,
        wrongNetwork: isConnected && isWrongNetwork,
        isConnected,
        walletAddresses,
        // isConnected: true,
        // walletAddresses: ["0x36A31357B3C777372E00ca70ee159119408e779b"],
        // walletAddresses: ["0x066d0cd6fe4c9A5ed119d5F78E9f3E0c73C9c82d"], //Fake address without any data
      }}
    >
      {props.children}
    </WalletContext.Provider>
  );
};
