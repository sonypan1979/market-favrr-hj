export const howItWorksPath = (anchor?: "wallet" | "order-book") => {
  return `/how-it-works${anchor ? `#${anchor}` : ""}`;
};

export const homePath = () => {
  return "/";
};

export const portfolioPath = () => {
  return "/portfolio";
};

export const privacyPath = () => {
  return "/privacy-policy";
};

export const termsPath = () => {
  return "/terms-of-service";
};

export const favPath = (title: string) => {
  return `/${title}`;
};

export const nftMintPath = () => {
  return `/nft/create`;
};
