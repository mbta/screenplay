import React, { ComponentType } from "react";

interface Props {
  className?: string;
  colorHex: string;
}

const TrunkTop: ComponentType<Props> = ({ className, colorHex }: Props) => (
  <svg
    className={className}
    width="44"
    height="88"
    viewBox="0 0 44 88"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_3_380)">
      <rect width="44" height="88" />
      <path
        d="M10 88L10 52"
        stroke={colorHex}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="44" r="8" stroke={colorHex} strokeWidth="4" />
    </g>
    <defs>
      <clipPath id="clip0_3_380">
        <rect width="44" height="88" />
      </clipPath>
    </defs>
  </svg>
);

export default TrunkTop;
