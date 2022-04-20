import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { FormattedMessage } from "react-intl";
import CategoriesPicker from "../components/filter/CategoriesPicker";
import FiltersButton from "../components/filter/FiltersButton";
import BasePage from "./BasePage";
import InfiniteScroll from "react-infinite-scroll-component";
import "./homePage.scss";
import FavTile from "../components/fav/FavTile";
import Loader from "../components/loader/Loader";
import { useQuery } from "@apollo/client";
import {
  Bixee,
  FavsQuery,
  FavsQueryVariables,
  FavsWithGraphQuery,
  FavsWithGraphQueryVariables,
  SortingField,
} from "../../generated/graphql";
import FAVS_QUERY from "../graphql/query/favs_query";
import TopFavsPanel from "../components/fav/TopFavsPanel";
import TickersBar from "../components/assets/TickersBar";
import { ResponsiveContext, screenType } from "../context/ResponsiveContext";
import emptyStateSrc from "../assets/images/empty-state.svg";
import FAVS_QUERY_WITH_GRAPH from "../graphql/query/favs_query_with_graph";

const RESULTS_PER_PAGE = 12;
const HEADER_HEIGHT = 82;
const HEADER_HEIGHT_MOBILE = 14;

type SortingOption = "trendy" | "cheap" | "expensive";

const HomePage = () => {
  const [selectedCategories, setSelectedCategories] = useState<Array<string>>(
    []
  );

  const [sortingCriteria, setSortingCriteria] =
    useState<SortingOption>("trendy");

  const [displayIPOS, setDisplayIPOS] = useState(true);

  const favsVariables: FavsQueryVariables = {
    filter: {
      showGraph: true,
      path: selectedCategories.length ? selectedCategories : undefined,
      isIPO: displayIPOS ? undefined : false,
    },
    sort: {
      field:
        sortingCriteria == "trendy" ? SortingField.Trendy : SortingField.Price,
      order:
        sortingCriteria == "trendy" || sortingCriteria == "expensive"
          ? "DESC"
          : "ASC",
    },
    pagination: {
      perPage: RESULTS_PER_PAGE,
    },
  };

  const {
    data: favsData,
    loading: favsLoading,
    fetchMore,
  } = useQuery<FavsWithGraphQuery, FavsWithGraphQueryVariables>(
    FAVS_QUERY_WITH_GRAPH,
    {
      variables: favsVariables,
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
    }
  );

  const loadMore = () => {
    fetchMore({
      variables: {
        ...favsVariables,
        pagination: {
          ...favsVariables.pagination,
          page: (favsData?.favs?.page || 0) + 1,
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        const mergedResult = {
          ...fetchMoreResult,
          favs: {
            ...fetchMoreResult?.favs,
            results: (prev.favs?.results || []).concat(
              fetchMoreResult?.favs?.results || []
            ),
          },
        };
        return mergedResult;
      },
    });
  };

  const exploreTitleRef = useRef<HTMLDivElement | null>(null);

  const { currentScreenType } = useContext(ResponsiveContext);

  useEffect(() => {
    const checkTitleSticky = () => {
      if (exploreTitleRef.current) {
        const rect = exploreTitleRef.current.getBoundingClientRect();
        if (
          currentScreenType == screenType.MOBILE
            ? rect.top <= HEADER_HEIGHT_MOBILE
            : rect.top <= HEADER_HEIGHT
        ) {
          exploreTitleRef.current.classList.add("sticky");
        } else {
          exploreTitleRef.current.classList.remove("sticky");
        }
      }
    };
    checkTitleSticky();
    window.addEventListener("scroll", checkTitleSticky);
    return () => window.removeEventListener("scroll", checkTitleSticky);
  }, [currentScreenType]);

  const numberOfColumns = useMemo(() => {
    if (window.innerWidth <= 620) {
      return 1;
    }
    if (window.innerWidth <= 870) {
      return 2;
    }
    if (window.innerWidth <= 1160) {
      return 3;
    }
    if (window.innerWidth <= 1440) {
      return 4;
    }
    if (window.innerWidth <= 1740) {
      return 5;
    }
    return 6;
  }, [window.innerWidth]);

  const loadedFavsLength = favsData?.favs?.results?.length || 0;
  const hasMore = (favsData?.favs?.page || 0) < (favsData?.favs?.pages || 0);

  const numberOfRows = Math.floor(loadedFavsLength / numberOfColumns);
  const visibleFavsNumber = hasMore
    ? numberOfRows * numberOfColumns
    : loadedFavsLength;

  return (
    <BasePage
      className="home-page"
      style={{ "--number-columns": numberOfColumns } as any}
    >
      <div className="padding-container">
        <h2 className="page-subtitle">
          <FormattedMessage defaultMessage="BUY, SELL & COLLECT RARE SOCIAL NFTS" />
        </h2>
        <h1 className="page-title">
          <FormattedMessage defaultMessage="the Largest Untapped ASSET Class — People" />
        </h1>
        <hr className="section-divider" />
        <h2 className="section-title" style={{ marginBottom: 30 }}>
          <FormattedMessage defaultMessage="TOP NFTs" />
        </h2>
        <TopFavsPanel />
      </div>
      <div className="section-title explore-title" ref={exploreTitleRef}>
        <span className="explore-label">
          <FormattedMessage defaultMessage="Explore" />
        </span>
        <div className="filter-container">
          <CategoriesPicker
            selectedCategories={selectedCategories}
            setSelectedCategories={setSelectedCategories}
          />
          <FiltersButton
            sorting={sortingCriteria}
            onChangeSorting={(sorting) => setSortingCriteria(sorting)}
            includeIPOs={displayIPOS}
            onIncludeIPOsChange={(value) => setDisplayIPOS(value)}
          />
        </div>
      </div>
      <div className="padding-container">
        <InfiniteScroll
          className="explore-cards-container"
          dataLength={visibleFavsNumber}
          hasMore={hasMore}
          loader={
            <span className="initial-loader">
              <Loader />
            </span>
          }
          next={loadMore}
        >
          {favsLoading && (
            <span className="initial-loader">
              <Loader />
            </span>
          )}
          {favsData?.favs?.count == 0 ? (
            <div className="empty-filter-results">
              <img src={emptyStateSrc} />
              <FormattedMessage defaultMessage="No Results Found" />
            </div>
          ) : (
            favsData?.favs?.results
              ?.slice(0, visibleFavsNumber)
              .map((fav, i) => (
                <FavTile key={fav?.key as string} fav={fav as Bixee} />
              ))
          )}
        </InfiniteScroll>
      </div>
      <TickersBar />
    </BasePage>
  );
};

export default HomePage;
