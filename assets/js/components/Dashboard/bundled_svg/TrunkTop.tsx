import React, { ComponentType } from "react";

interface Props {
  className?: string;
  colorHex: string;
  branch?: string;
}

const TrunkTop: ComponentType<Props> = ({
  className,
  colorHex,
  branch,
}: Props) => (
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
      {branch && (
        <>
          <circle cx="10" cy="44" r="8" fill="#00843D" />
          <text
            fill="white"
            xmlSpace="preserve"
            fontFamily="Inter"
            fontSize="10"
            fontWeight="bold"
            letterSpacing="0.416667px"
          >
            <tspan x="6.4502" y="47.67">
              {branch}
            </tspan>
          </text>
        </>
      )}
    </g>
    <defs>
      <clipPath id="clip0_3_380">
        <rect width="44" height="88" />
      </clipPath>
    </defs>
  </svg>
);

export default TrunkTop;
