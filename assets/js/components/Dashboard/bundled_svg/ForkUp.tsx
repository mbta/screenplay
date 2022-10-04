import React, { ComponentType } from "react";

interface Props {
  className?: string;
  colorHex: string;
}

const ForkUp: ComponentType<Props> = ({ className, colorHex }: Props) => (
  <svg
    className={className}
    width="44"
    height="88"
    viewBox="0 0 44 88"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_3_362)">
      <rect width="44" height="88" />
      <path
        d="M10 44H8C8 45.1046 8.89543 46 10 46V44ZM32 16C32 29.2955 26.372 35.6343 20.9923 38.7724C18.2371 40.3796 15.4642 41.1917 13.3683 41.5993C12.3241 41.8023 11.4595 41.9027 10.8652 41.9522C10.5684 41.977 10.3401 41.9889 10.1918 41.9947C10.1177 41.9976 10.0637 41.9989 10.0312 41.9995C10.015 41.9998 10.0041 41.9999 9.99888 42C9.99624 42 9.99501 42 9.99519 42C9.99528 42 9.99572 42 9.99652 42C9.99692 42 9.99779 42 9.99799 42C9.99895 42 10 42 10 44C10 46 10.0012 46 10.0026 46C10.0031 46 10.0045 46 10.0057 46C10.0079 46 10.0106 46 10.0136 46C10.0196 45.9999 10.027 45.9999 10.0359 45.9998C10.0537 45.9996 10.0773 45.9993 10.1065 45.9988C10.1648 45.9977 10.2456 45.9956 10.3473 45.9917C10.5505 45.9837 10.8379 45.9684 11.1973 45.9384C11.9155 45.8786 12.9259 45.7602 14.1317 45.5257C16.5358 45.0583 19.7629 44.1204 23.0077 42.2276C29.628 38.3657 36 30.7045 36 16H32ZM12 44V0H8V44H12ZM36 16V0H32V16H36Z"
        fill={colorHex}
      />
      <path d="M12 88V0H8V88H12Z" fill={colorHex} />
      <circle cx="10" cy="44" r="8" fill={colorHex} />
    </g>
    <defs>
      <clipPath id="clip0_3_362">
        <rect width="44" height="88" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default ForkUp;
