const STORAGE_TOKEN_KEY = "AUTHORIZATION_TOKEN";
const STORAGE_LAST_ADDRESS_KEY = "LAST_ADDRESS";
const STORAGE_API_URL_KEY = "API_URL_KEY";
const STORAGE_API_SUBSCRIPTION_URL_KEY = "API_SUBSCRIPTION_URL_KEY";

export const storeLocalToken = (token: string) => {
  localStorage.setItem(STORAGE_TOKEN_KEY, token);
};

export const removeLocalToken = () => {
  localStorage.removeItem(STORAGE_TOKEN_KEY);
};

export const getLocalLastAddress = () => {
  return localStorage.getItem(STORAGE_LAST_ADDRESS_KEY);
};

export const storeLocalLastAddress = (address: string) => {
  localStorage.setItem(STORAGE_LAST_ADDRESS_KEY, address.toLowerCase());
};

export const removeLocalLastAddress = () => {
  localStorage.removeItem(STORAGE_LAST_ADDRESS_KEY);
};

export const getLocalAPIUrl = () => {
  return {
    apiUrl: localStorage.getItem(STORAGE_API_URL_KEY),
    apiSubscriptionUrl: localStorage.getItem(STORAGE_API_SUBSCRIPTION_URL_KEY),
  };
};
