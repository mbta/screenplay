import React, { ComponentType } from "react";

interface Props {
  className?: string;
  colorHex: string;
}

const ForkDown: ComponentType<Props> = ({ className, colorHex }: Props) => (
  <svg
    className={className}
    width="44"
    height="88"
    viewBox="0 0 44 88"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <g clipPath="url(#clip0_3_360)">
      <rect width="44" height="88" />
      <path
        d="M10 44H8C8 45.1046 8.89543 46 10 46V44ZM36 72C36 57.2955 29.628 49.6343 23.0077 45.7724C19.7629 43.8796 16.5358 42.9417 14.1317 42.4743C12.9259 42.2398 11.9155 42.1214 11.1973 42.0616C10.8379 42.0316 10.5505 42.0163 10.3473 42.0083C10.2456 42.0044 10.1648 42.0023 10.1065 42.0012C10.0773 42.0007 10.0537 42.0004 10.0359 42.0002C10.027 42.0001 10.0196 42.0001 10.0136 42C10.0106 42 10.0079 42 10.0057 42C10.0045 42 10.0031 42 10.0026 42C10.0012 42 10 42 10 44C10 46 9.99895 46 9.99799 46C9.99779 46 9.99692 46 9.99652 46C9.99572 46 9.99528 46 9.99519 46C9.99501 46 9.99624 46 9.99888 46C10.0041 46.0001 10.015 46.0002 10.0312 46.0005C10.0637 46.0011 10.1177 46.0024 10.1918 46.0053C10.3401 46.0111 10.5684 46.023 10.8652 46.0478C11.4595 46.0973 12.3241 46.1977 13.3683 46.4007C15.4642 46.8083 18.2371 47.6204 20.9923 49.2276C26.372 52.3657 32 58.7045 32 72H36ZM12 44V0H8V44H12ZM32 72V88H36V72H32Z"
        fill={colorHex}
      />
      <path d="M12 88V0H8V88H12Z" fill={colorHex} />
      <circle cx="10" cy="44" r="8" fill={colorHex} />
    </g>
    <defs>
      <clipPath id="clip0_3_360">
        <rect width="44" height="88" fill="white" />
      </clipPath>
    </defs>
  </svg>
);

export default ForkDown;
