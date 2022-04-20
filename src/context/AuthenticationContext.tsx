import React, { createContext, PropsWithChildren, useState } from "react";
import {
  removeLocalToken,
  storeLocalToken,
} from "../local-storage/localStorageUtil";

interface AuthenticationContextValues {
  token: string | null;
  setToken: (token: string) => void;
  removeToken: () => void;
}

export const AuthenticationContext = createContext<AuthenticationContextValues>(
  {
    token: "" as string | null,
    setToken: () => undefined,
    removeToken: () => undefined,
  }
);

export const STORAGE_TOKEN_KEY = "AUTHORIZATION_TOKEN";
export const AuthenticationProvider = (props: PropsWithChildren<unknown>) => {
  const [token, innerSetToken] = useState(
    localStorage.getItem(STORAGE_TOKEN_KEY)
  );

  const setToken = (newToken: string | null) => {
    if (newToken) {
      storeLocalToken(newToken);
    } else {
      removeLocalToken();
    }
    innerSetToken(newToken);
  };
  return (
    <AuthenticationContext.Provider
      value={{
        token,
        setToken,
        removeToken: () => setToken(null),
      }}
    >
      {props.children}
    </AuthenticationContext.Provider>
  );
};
