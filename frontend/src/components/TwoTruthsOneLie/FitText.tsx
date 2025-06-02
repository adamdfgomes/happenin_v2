// src/components/TwoTruthsOneLie/FitText.tsx
import React, { useLayoutEffect, useRef, useState } from "react";

interface FitTextProps {
  children: string;
  minFontSize?: number;
  maxFontSize?: number;
  style?: React.CSSProperties;
}

const FitText: React.FC<FitTextProps> = ({
  children,
  minFontSize = 12,
  maxFontSize = 36,
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [fontSize, setFontSize] = useState<number>(maxFontSize);

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let lo = minFontSize;
    let hi = maxFontSize;
    let best = lo;

    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      el.style.fontSize = `${mid}px`;
      const isOverflowing =
        el.scrollWidth > el.clientWidth || el.scrollHeight > el.clientHeight;

      if (isOverflowing) {
        hi = mid - 1;
      } else {
        best = mid;
        lo = mid + 1;
      }
    }

    el.style.fontSize = `${best}px`;
    setFontSize(best);
  }, [children, minFontSize, maxFontSize]);

  return (
    <div
      ref={containerRef}
      style={{
        display: "flex",               // ← make it a flex container
        alignItems: "center",          // ← center vertically
        justifyContent: "center",      // ← center horizontally
        width: "100%",
        height: "100%",
        overflow: "hidden",
        whiteSpace: "nowrap",
        textAlign: "center",
        ...style,
      }}
    >
      {children}
    </div>
  );
};

export default FitText;
