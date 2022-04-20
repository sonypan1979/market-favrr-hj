import { useQuery } from "@apollo/client";
import React, { useEffect, useRef, useState } from "react";
import { Bixee } from "../../../generated/graphql";
import FavTile from "./FavTile";
import leftArrowSrc from "../../assets/images/left-arrow.svg";
import Slider from "react-slick";
import "./favsCarousel.scss";
import "../../style/vendor/slick.css";
import "../../style/vendor/slick-theme.css";

const FavsCarousel = (props: {
  favs?: Array<Bixee>;
  titleElement: JSX.Element;
}) => {
  const sliderRef = useRef<Slider>(null);

  const tilesPerPage = window.innerWidth < 660 ? 1 : 2;
  // const tilesPerPage = 1;

  const totalItems = props.favs?.length || 0;
  const numberSlides = totalItems / tilesPerPage;

  // const [disabledLeft, setDisabledLeft] = useState(true);

  // const [disabledRight, setDisabledRight] = useState(false);

  // useEffect(() => {
  //   if (props.favs?.length == 1) {
  //     setDisabledRight(true);
  //   }
  // }, [props.favs?.length]);

  return (
    <>
      <h2 className="section-title similar-favs-section-title">
        <span>{props.titleElement}</span>
        <button
          className={`left-arrow arrow-btn`}
          onClick={sliderRef.current?.slickPrev}
          // disabled={disabledLeft}
        >
          <img src={leftArrowSrc} />
        </button>
        <button
          className={`right-arrow arrow-btn`}
          onClick={sliderRef.current?.slickNext}
          // disabled={disabledRight}
        >
          <img src={leftArrowSrc} />
        </button>
      </h2>
      <Slider
        className={`similar-favs ${tilesPerPage == 1 ? "single-tile" : ""}`}
        arrows={false}
        dots={false}
        infinite={true}
        slidesPerRow={tilesPerPage}
        beforeChange={(oldIndex, newIndex) => {
          const newDisabledLeft = newIndex == 0;
          const newDisabledRight = numberSlides - 1 == newIndex;
          // if (newDisabledLeft != disabledLeft) {
          //   setDisabledLeft(newDisabledLeft);
          // }
          // if (newDisabledRight != disabledRight) {
          //   setDisabledRight(newDisabledRight);
          // }
        }}
        ref={sliderRef}
      >
        {props.favs?.map((fav) => (
          <FavTile
            key={fav?.key}
            fav={fav as Bixee}
            className={tilesPerPage == 1 ? "single-tile" : ""}
          />
        ))}
      </Slider>
    </>
  );
};

export default FavsCarousel;
