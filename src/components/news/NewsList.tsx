import React, { useContext, useEffect, useState } from "react";
import NewsTile from "./NewsTile";
import "./newsList.scss";
import { useQuery } from "@apollo/client";
import {
  NewsFilter,
  NewsQuery,
  NewsQueryVariables,
} from "../../../generated/graphql";
import { News } from "../../../generated/graphql";
import NEWS_QUERY from "../../graphql/query/news_query";
import { FormattedMessage } from "react-intl";
import Loader from "../loader/Loader";
import emptyNewsSrc from "../../assets/images/news.svg";
import LoadMoreButton from "../button/LoadMoreButton";

const NEWS_PER_PAGE = 5;
const NewsList = (props: {
  filter: NewsFilter;
  skip?: boolean;
  sizeLimit?: number;
}) => {
  const { sizeLimit = 99999 } = props;
  const [horizontal, setHorizontal] = useState(false);
  useEffect(() => {
    const newHorizontal = window.innerWidth >= 660;
    if (newHorizontal != horizontal) {
      setHorizontal(newHorizontal);
    }
  });
  const { data, fetchMore, loading } = useQuery<NewsQuery, NewsQueryVariables>(
    NEWS_QUERY,
    {
      fetchPolicy: "network-only",
      nextFetchPolicy: "cache-first",
      skip: props.skip,
      variables: {
        filter: props.filter,
        pagination: { perPage: NEWS_PER_PAGE, page: 1 },
      },
      notifyOnNetworkStatusChange: true,
    }
  );

  const loadMore = () => {
    fetchMore({
      variables: {
        filter: props.filter,
        pagination: {
          perPage: NEWS_PER_PAGE,
          page: data?.news?.page ? data.news.page + 1 : 1,
        },
      },
      updateQuery: (prev, { fetchMoreResult }) => {
        const mergedResult = {
          ...fetchMoreResult,
          news: {
            ...fetchMoreResult?.news,
            results: (prev.news?.results || []).concat(
              fetchMoreResult?.news?.results || []
            ),
          },
        };
        return mergedResult;
      },
    });
  };

  const tileOrientation = horizontal ? "row" : "column";

  const isNewsEmpty = data?.news?.count == 0;

  return (
    <div className={`news-list ${isNewsEmpty ? "empty" : ""}`}>
      {isNewsEmpty ? (
        <>
          <img src={emptyNewsSrc} className="empty-news" />
          <span className="empty-news-label">
            <FormattedMessage defaultMessage="No News Yet" />
          </span>
        </>
      ) : (
        <>
          {data?.news?.results?.map((news) => {
            return (
              <NewsTile
                key={news?.code}
                orientation={tileOrientation}
                newsInfo={news as News}
              />
            );
          })}
          {data?.news?.results?.length != data?.news?.count &&
            data!.news!.results!.length < sizeLimit && (
              <div className="load-more-container">
                {loading ? <Loader /> : <LoadMoreButton onClick={loadMore} />}
              </div>
            )}
        </>
      )}
    </div>
  );
};

export default NewsList;
