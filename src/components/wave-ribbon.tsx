import { useId } from "react";

interface WaveRibbonProps {
  className?: string;
}

// Soft orange-to-yellow ribbon used as a brand motif behind banners and auth.
export const WaveRibbon = ({ className }: WaveRibbonProps) => {
  const id = useId().replace(/:/g, "");

  return (
    <svg
      viewBox="0 0 1440 260"
      preserveAspectRatio="none"
      className={className}
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        <linearGradient id={`${id}-a`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#E8672A" stopOpacity="0.5" />
          <stop offset="0.55" stopColor="#F0A24A" stopOpacity="0.35" />
          <stop offset="1" stopColor="#F0E04A" stopOpacity="0.45" />
        </linearGradient>
        <linearGradient id={`${id}-b`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#F0E04A" stopOpacity="0.4" />
          <stop offset="0.5" stopColor="#F6C878" stopOpacity="0.28" />
          <stop offset="1" stopColor="#E8672A" stopOpacity="0.45" />
        </linearGradient>
      </defs>
      <path
        d="M0 150 C 180 60, 320 60, 520 130 S 900 220, 1100 130 S 1340 60, 1440 110 L1440 260 L0 260 Z"
        fill={`url(#${id}-a)`}
      />
      <path
        d="M0 190 C 200 120, 360 130, 560 180 S 940 240, 1140 170 S 1360 130, 1440 170 L1440 260 L0 260 Z"
        fill={`url(#${id}-b)`}
      />
    </svg>
  );
};
