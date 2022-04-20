import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ReactComponent as StarIcon } from "../../assets/images/star.svg";
import { ReactComponent as OutterStarIcon } from "../../assets/images/outter-star.svg";
import "./likeButton.scss";
import { CSSTransition } from "react-transition-group";
import { useWallet } from "../../context/WalletContext";
import ConnectWalletModal from "../wallet/ConnectWalletModal";
import {
  ApolloClient,
  InMemoryCache,
  useApolloClient,
  useMutation,
} from "@apollo/client";
import {
  AddToFavoriteMutation,
  AddToFavoriteMutationVariables,
  RemoveFromFavoritesMutation,
  RemoveFromFavoritesMutationVariables,
} from "../../../generated/graphql";
import ADD_FAVORITE_MUTATION from "../../graphql/mutation/add_favorite_mutation";
import {
  addFavoriteCache,
  removeFavoriteCache,
} from "../cache/favCacheManiputaltion";
import REMOVE_FAVORITE_MUTATION from "../../graphql/mutation/remove_favorite_mutation";
import FAVS_EQUITY_QUERY from "../../graphql/query/favs_equity_query";

const LikeButton = (props: {
  isFavorite: boolean;
  title: string;
  favId: string;
}) => {
  const { walletAddresses, isConnected } = useWallet();
  const [displayConnectModal, setDisplayConnectModal] = useState(false);
  const address = isConnected ? (walletAddresses as Array<string>)[0] : null;
  const loadingRef = useRef(false);
  const [optimisticFavorite, setOptmisticFavorite] = useState(props.isFavorite);

  useEffect(() => {
    setOptmisticFavorite(props.isFavorite);
  }, [props.isFavorite]);

  const apolloClient = useApolloClient();
  const updateMyWatchlistQuery = useCallback(() => {
    apolloClient.query({
      query: FAVS_EQUITY_QUERY,
      fetchPolicy: "network-only",
      variables: {
        filter: {
          favorited: walletAddresses?.length ? walletAddresses[0] : undefined,
        },
        pagination: {
          perPage: 99999,
        },
      },
    });
  }, [walletAddresses, apolloClient]);

  const [addToFavorite] = useMutation<
    AddToFavoriteMutation,
    AddToFavoriteMutationVariables
  >(ADD_FAVORITE_MUTATION, { refetchQueries: [FAVS_EQUITY_QUERY] });

  const [removeFromFavorite] = useMutation<
    RemoveFromFavoritesMutation,
    RemoveFromFavoritesMutationVariables
  >(REMOVE_FAVORITE_MUTATION, { refetchQueries: [FAVS_EQUITY_QUERY] });

  const toggle = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();

    if (loadingRef.current) {
      return;
    }

    if (!isConnected) {
      setDisplayConnectModal(true);
      return;
    }

    loadingRef.current = true;
    if (optimisticFavorite) {
      removeFromFavorite({
        variables: { title: props.title },
      })
        // .then(updateMyWatchlistQuery)
        .finally(() => {
          loadingRef.current = false;
        });
      setOptmisticFavorite(false);
      // removeFavoriteCache(client, props.favId);
    } else {
      addToFavorite({ variables: { title: props.title } })
        // .then(updateMyWatchlistQuery)
        .finally(() => {
          loadingRef.current = false;
        });
      setOptmisticFavorite(true);
      // addFavoriteCache(client, props.favId);
    }
  };

  if (displayConnectModal) {
    return <ConnectWalletModal onClose={() => setDisplayConnectModal(false)} />;
  }

  return (
    <button
      className={`like-button ${optimisticFavorite ? "highlighted" : ""}`}
      onClick={toggle}
    >
      <StarIcon />
      <CSSTransition
        in={optimisticFavorite}
        timeout={600}
        classNames="like-transition"
      >
        <OutterStarIcon className="colorfull-icon" />
      </CSSTransition>
    </button>
  );
};

export default LikeButton;
