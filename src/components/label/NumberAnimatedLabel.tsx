import Big from "big.js";
import dayjs from "dayjs";
import React, { useEffect, useMemo, useRef, useState } from "react";
import useWatchVisible from "../../hooks/useWatchVisible";

interface Props {
  finalLabel: string;
  className?: string;
  shouldAnimate?: boolean;
}

const ANIMATION_DURATION_MILISECONDS = 2500;

const NumberAnimatedLabel = (props: Props) => {
  const { finalLabel: finalLabel, className, shouldAnimate = false } = props;
  const spanRef = useRef<HTMLSpanElement | null>(null);
  const animationIntervalIdRef = useRef<null | ReturnType<typeof setInterval>>(
    null
  );

  const initialLabel = finalLabel.replaceAll(/[0-9]/g, "0");

  const [isVisible, setIsVisible] = useState(false);
  useWatchVisible({
    elementRef: spanRef,
    onVisibilityChange: (visibility) => setIsVisible(visibility),
  });
  const animateChange = (finalLabel: string) => {
    const startTransitionTime = dayjs();
    animationIntervalIdRef.current = setInterval(() => {
      if (spanRef.current == null) {
        return;
      }
      const stepLabelParts = initialLabel.slice(0, finalLabel.length).split("");

      const animationProgress = Math.min(
        dayjs().diff(startTransitionTime, "milliseconds") /
          ANIMATION_DURATION_MILISECONDS,
        1
      );

      const finalNumberParts = finalLabel
        .split("")
        .filter((letter) => /[0-9]/g.test(letter));

      const initialNumber = new Big(
        initialLabel
          .split("")
          .filter((letter) => /[0-9]/g.test(letter))
          .slice(0, finalNumberParts.length)
          .join("")
      );

      const finalNumber = new Big(finalNumberParts.join(""));

      const currentNumber = initialNumber.add(
        finalNumber.minus(initialNumber).times(animationProgress).round(0)
      );

      let currentNumberString = currentNumber.toFixed();
      if (currentNumberString.length < finalNumberParts.length) {
        currentNumberString =
          "0".repeat(finalNumberParts.length - currentNumberString.length) +
          currentNumberString;
      }

      let lastIndex = 0;
      for (let i = 0; i < finalLabel.length; i++) {
        if (/[0-9]/.test(finalLabel[i]) == false) {
          stepLabelParts[i] = finalLabel[i];
        } else {
          stepLabelParts[i] = currentNumberString[lastIndex++];
        }
      }
      spanRef.current.textContent = stepLabelParts.join("");

      if (animationProgress == 1) {
        if (animationIntervalIdRef.current) {
          clearInterval(animationIntervalIdRef.current);
          animationIntervalIdRef.current = null;
        }
      }
    }, 30);
  };

  useEffect(() => {
    if (shouldAnimate && isVisible) {
      if (animationIntervalIdRef.current) {
        clearInterval(animationIntervalIdRef.current);
      }
      animateChange(finalLabel);
    }
  }, [shouldAnimate, finalLabel, isVisible]);

  return (
    <span className={className || ""} ref={spanRef}>
      {shouldAnimate || animationIntervalIdRef.current != null
        ? initialLabel
        : finalLabel}
    </span>
  );
};

export default NumberAnimatedLabel;
