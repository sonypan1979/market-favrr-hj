import React, {
  PropsWithChildren,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { createPortal } from "react-dom";
import { ResponsiveContext, screenType } from "../../context/ResponsiveContext";
import { useScrollBlock } from "../../context/ScrollBlockContext";
import useClickOutside from "../../hooks/useClickOutside";
import "./popupFullpageResponsive.scss";

const PopupFullpageResponsive = (
  props: PropsWithChildren<{
    className?: string;
    onClose?: () => void;
  }>
) => {
  const { currentScreenType } = useContext(ResponsiveContext);
  const ref = useRef<HTMLDivElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);

  useClickOutside(ref, () => {
    if (props.onClose) {
      props.onClose();
    }
  });

  const centerXRef = useRef(0);
  useEffect(() => {
    const rect = ref.current?.parentElement?.getBoundingClientRect();
    if (rect) {
      const newCenterX = rect.x + rect.width / 2;
      centerXRef.current = newCenterX;
    }
  });

  useEffect(() => {
    if (ref.current) {
      const rect = ref.current.getBoundingClientRect();

      if (rect) {
        const xOffset = window.innerWidth - centerXRef.current - rect.width / 2;
        if (xOffset < 0) {
          ref.current.style.setProperty("left", `calc(50% - ${-xOffset}px)`);
        }
        if (caretRef.current) {
          const caretXOffset =
            centerXRef.current - ref.current.getBoundingClientRect().left;
          caretRef.current.style.left = `${caretXOffset}px`;
        }
      }
    }
  });

  useScrollBlock(currentScreenType == screenType.MOBILE);

  const component = (
    <div
      className={`popup-fullpage-responsive  ${props.className || ""}`}
      ref={ref}
      onClick={(e) => {
        //Stop propagating to avoid triggering click outside when getting to parent.
        e.stopPropagation();
      }}
    >
      <div className="caret-up" ref={caretRef} />
      {props.children}
    </div>
  );

  return component;
};

export default PopupFullpageResponsive;
