import React, { ComponentType } from "react";

interface Props {
  className?: string;
  colorHex: string;
  branch?: string;
}

const BranchForkDown: ComponentType<Props> = ({
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
    <g clipPath="url(#clip0_3_430)">
      <rect width="44" height="88" />
      <path d="M12 88V0H8V88H12Z" fill={colorHex} />
      <path
        d="M12 18C34 18 34 36 34 36V88"
        stroke={colorHex}
        strokeWidth="4"
        strokeLinejoin="round"
      />
      <circle cx="34" cy="44" r="8" fill={colorHex} />
      {branch && (
        <text
          fill="white"
          xmlSpace="preserve"
          // style="white-space: pre"
          fontFamily="Inter"
          fontSize="10"
          fontWeight="bold"
          letterSpacing="0.416667px"
        >
          <tspan x="30.4502" y="47.67">
            {branch}
          </tspan>
        </text>
      )}
    </g>
    <defs>
      <clipPath id="clip0_3_430">
        <rect width="44" height="88" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default BranchForkDown;
