import React from "react";

import {
  portraitHeightMedian,
  landscapeHeightMedian,
  svgFontSize,
  svgLandscapeLineLength,
  svgLineHeight,
  svgLongSide,
  svgPortraitLineLength,
  svgShortSide,
  interBase64,
} from "../../constants/misc";

interface SVGPreviewsProps {
  showText: boolean;
  message: string;
}

const createSVGText = (message: string, orientation: string) => {
  const attentionString = "Attention: ";

  if (message === undefined) {
    return null;
  } else if (message.startsWith(attentionString)) {
    message = message.slice(attentionString.length);
  }

  // Split the message by max line length
  const words = message.split(" ");
  const lineLength =
    orientation === "portrait" ? svgPortraitLineLength : svgLandscapeLineLength;
  const medianHeight =
    orientation === "portrait" ? portraitHeightMedian : landscapeHeightMedian;

  const linesReducer = words.reduce(
    (acc: { array: string[]; lineCount: number }, curWord: string) => {
      const testLine = acc.array[acc.lineCount] + curWord + " ";
      if (testLine.length > lineLength) {
        return {
          array: acc.array.concat(curWord + " "),
          lineCount: acc.lineCount + 1,
        };
      } else {
        const tempArray = [...acc.array];
        tempArray[acc.lineCount] = testLine;
        return { array: tempArray, lineCount: acc.lineCount };
      }
    },
    { array: [""], lineCount: 0 }
  );

  // Take the array of message lines and and individual tspans to the text element
  let y = medianHeight + svgFontSize / 2;
  const textHeight = linesReducer.array.length * svgLineHeight;

  return (
    <text>
      {linesReducer.array.map((line, index) => {
        return (
          <tspan
            x="0"
            y={y + svgLineHeight * index - textHeight / 2}
            key={index}
          >
            {line}
          </tspan>
        );
      })}
    </text>
  );
};

class SVGPreviews extends React.Component<SVGPreviewsProps> {
  constructor(props: SVGPreviewsProps) {
    super(props);
  }

  render() {
    const portraitSVGText = createSVGText(this.props.message, "portrait");
    const landscapeSVGText = createSVGText(this.props.message, "landscape");

    return (
      <div className="svg-previews">
        {!this.props.showText ? (
          /* Blank SVG */
          <svg
            width={svgShortSide}
            height={svgLongSide}
            viewBox="0 0 1080 1920"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            style={{ background: "#FFDD00" }}
          >
            <style>
              {`@font-face {
                font-family: 'Inter';
                src: url('data:font/truetype;charset=utf-8;base64,${interBase64}');
                font-weight: normal;
                font-style: normal;
              }`}
            </style>
            <title>Outfront Alert - Empty Preview</title>
            <g
              id="Outfront-Alert-Empty-Preview"
              stroke="none"
              strokeWidth="1"
              fill="none"
              fillRule="evenodd"
            >
              <rect
                fill="#FFDD00"
                x="0"
                y="0"
                width="1080"
                height="1920"
              ></rect>
              <g id="CTA" transform="translate(48.000000, 1696.000000)">
                <text
                  id="url"
                  fontFamily="Inter"
                  fontSize="88"
                  fontWeight="700"
                  fill="#171F26"
                >
                  <tspan x="255" y="126">
                    mbta.com/alerts
                  </tspan>
                </text>
                <g id="Logo/T-KO" fill="#171F26">
                  <path
                    d="M88,0 C136.601058,0 176,39.398942 176,88 C176,136.601058 136.601058,176 88,176 C39.398942,176 0,136.601058 0,88 C0,39.398942 39.398942,0 88,0 Z M88,7.744 C43.6758351,7.744 7.744,43.6758351 7.744,88 C7.744,132.324165 43.6758351,168.256 88,168.256 C132.324165,168.256 168.256,132.324165 168.256,88 C168.256,43.6758351 132.324165,7.744 88,7.744 Z M143.616,48.752 L143.616,76.736 L101.992,76.735 L101.992,145.2 L74.008,145.2 L74.008,76.735 L32.384,76.736 L32.384,48.752 L143.616,48.752 Z"
                    id="Color"
                  ></path>
                </g>
              </g>
              <g id="Widget" transform="translate(48.000000, 272.000000)">
                <path
                  d="M193.04471,0 L952,0 C969.673112,-3.24649801e-15 984,14.326888 984,32 L984,1344 C984,1361.67311 969.673112,1376 952,1376 L32,1376 C14.326888,1376 2.164332e-15,1361.67311 0,1344 L0,189.465938 C-3.65817517e-14,180.854354 3.47089536,172.606236 9.62823578,166.585725 L170.672946,9.11978659 C176.652124,3.27347834 184.6823,-2.3332846e-14 193.04471,0 Z"
                  id="Color-Block"
                  fill="#171F26"
                  transform="translate(492.000000, 688.000000) scale(-1, 1) translate(-492.000000, -688.000000) "
                ></path>
                <g
                  id="Blank-Text-Container"
                  transform="translate(64.000000, 256.000000)"
                  fill="#FFFFFF"
                  opacity="0.33"
                >
                  <rect
                    id="Greek-text"
                    x="0"
                    y="791"
                    width="728"
                    height="82"
                  ></rect>
                  <rect
                    id="Greek-text"
                    x="0"
                    y="663"
                    width="668"
                    height="82"
                  ></rect>
                  <rect
                    id="Greek-text"
                    x="0"
                    y="535"
                    width="828"
                    height="82"
                  ></rect>
                  <rect
                    id="Greek-text"
                    x="0"
                    y="407"
                    width="678"
                    height="82"
                  ></rect>
                  <rect
                    id="Greek-text"
                    x="0"
                    y="279"
                    width="798"
                    height="82"
                  ></rect>
                  <rect
                    id="Greek-text"
                    x="0"
                    y="151"
                    width="688"
                    height="82"
                  ></rect>
                  <rect
                    id="Greek-text"
                    x="0"
                    y="23"
                    width="788"
                    height="82"
                  ></rect>
                </g>
              </g>
              <g
                id="Header"
                transform="translate(48.000000, 48.000000)"
                fill="#171F26"
              >
                <rect
                  id="Greek-text"
                  opacity="0.33"
                  x="224"
                  y="45"
                  width="728"
                  height="88"
                ></rect>
                <g id="Icon">
                  <path
                    d="M92.3300646,1.16348016 C93.6420741,1.9221562 94.7318615,3.01218872 95.490367,4.32449322 L187.211781,163.01343 C189.603608,167.151573 188.188692,172.445596 184.051479,174.83796 C182.735043,175.599196 181.241294,176 179.720694,176 L-3.72213452,176 C-8.50098017,176 -12.375,172.125109 -12.375,167.345189 C-12.375,165.824247 -11.9742861,164.330162 -11.2132216,163.01343 L80.5081929,4.32449322 C82.9000192,0.186349677 88.1928515,-1.22888408 92.3300646,1.16348016 Z M98.5562146,134.873059 L77.6271187,134.873059 C76.5657636,134.873059 75.7053653,135.733458 75.7053653,136.794813 L75.7053653,136.794813 L75.7053653,157.723909 C75.7053653,158.785264 76.5657636,159.645662 77.6271187,159.645662 L77.6271187,159.645662 L98.5562146,159.645662 C99.6175697,159.645662 100.477968,158.785264 100.477968,157.723909 L100.477968,157.723909 L100.477968,136.794813 C100.477968,135.733458 99.6175697,134.873059 98.5562146,134.873059 L98.5562146,134.873059 Z M101.184867,55.0502283 L74.9384996,55.0511642 L74.878591,55.0539708 C73.8193028,55.1201763 73.0142502,56.0325692 73.0804557,57.0918574 L73.0804557,57.0918574 L76.9690036,119.308625 C77.0323056,120.321456 77.8722072,121.110502 78.8870146,121.110502 L78.8870146,121.110502 L97.2963187,121.110502 C98.3111261,121.110502 99.1510277,120.321456 99.2143297,119.308625 L99.2143297,119.308625 L103.102878,57.0918574 C103.105372,57.0519475 103.10662,57.0119695 103.10662,56.9719817 C103.10662,55.9106266 102.246222,55.0502283 101.184867,55.0502283 L101.184867,55.0502283 Z"
                    id="Alert"
                  ></path>
                </g>
              </g>
            </g>
          </svg>
        ) : (
          /* Portrait SVG */
          <svg
            id="portrait-svg"
            className="portrait-svg"
            width={svgShortSide}
            height={svgLongSide}
            viewBox="0 0 1080 1920"
            version="1.1"
            xmlns="http://www.w3.org/2000/svg"
            style={{ background: "#FFDD00" }}
          >
            <style>
              {`@font-face {
                font-family: 'Inter';
                src: url('data:font/truetype;charset=utf-8;base64,${interBase64}');
                font-weight: normal;
                font-style: normal;
              }`}
            </style>
            <title>Outfront Alert Portrait</title>
            <g
              id="Outfront-Alert-Portrait"
              stroke="none"
              strokeWidth="1"
              fill="none"
              fillRule="evenodd"
            >
              <rect
                fill="#FFDD00"
                x="0"
                y="0"
                width="1080"
                height="1920"
              ></rect>
              <g id="CTA" transform="translate(48.000000, 1696.000000)">
                <text
                  id="url"
                  fontFamily="Inter"
                  fontSize="88"
                  fontWeight="700"
                  fill="#171F26"
                >
                  <tspan x="255" y="126">
                    mbta.com/alerts
                  </tspan>
                </text>
                <g id="Logo/T-KO" fill="#171F26">
                  <path
                    d="M88,0 C136.601058,0 176,39.398942 176,88 C176,136.601058 136.601058,176 88,176 C39.398942,176 0,136.601058 0,88 C0,39.398942 39.398942,0 88,0 Z M88,7.744 C43.6758351,7.744 7.744,43.6758351 7.744,88 C7.744,132.324165 43.6758351,168.256 88,168.256 C132.324165,168.256 168.256,132.324165 168.256,88 C168.256,43.6758351 132.324165,7.744 88,7.744 Z M143.616,48.752 L143.616,76.736 L101.992,76.735 L101.992,145.2 L74.008,145.2 L74.008,76.735 L32.384,76.736 L32.384,48.752 L143.616,48.752 Z"
                    id="Color"
                  ></path>
                </g>
              </g>
              <g
                id="Portrait-Widget"
                transform="translate(48.000000, 272.000000)"
              >
                <path
                  d="M193.04471,0 L952,0 C969.673112,-3.24649801e-15 984,14.326888 984,32 L984,1344 C984,1361.67311 969.673112,1376 952,1376 L32,1376 C14.326888,1376 2.164332e-15,1361.67311 0,1344 L0,189.465938 C-3.65817517e-14,180.854354 3.47089536,172.606236 9.62823578,166.585725 L170.672946,9.11978659 C176.652124,3.27347834 184.6823,-2.3332846e-14 193.04471,0 Z"
                  id="Portrait-Color-Block"
                  fill="#171F26"
                  transform="translate(492.000000, 688.000000) scale(-1, 1) translate(-492.000000, -688.000000) "
                ></path>
                <g
                  id="Portrait-Text-Container"
                  transform="translate(64.000000, 256.000000)"
                  fontFamily="Inter"
                  fill="#FFFFFF"
                  fontSize={svgFontSize}
                  fontWeight="500"
                >
                  {portraitSVGText}
                </g>
              </g>
              <g
                id="Header"
                transform="translate(48.000000, 48.000000)"
                fill="#171F26"
              >
                <text
                  id="Alert-type"
                  fontFamily="Inter"
                  fontSize="120"
                  fontWeight="700"
                  letterSpacing="4"
                >
                  <tspan x="224" y="144">
                    ATTENTION
                  </tspan>
                </text>
                <g id="Icon">
                  <path
                    d="M92.3300646,1.16348016 C93.6420741,1.9221562 94.7318615,3.01218872 95.490367,4.32449322 L187.211781,163.01343 C189.603608,167.151573 188.188692,172.445596 184.051479,174.83796 C182.735043,175.599196 181.241294,176 179.720694,176 L-3.72213452,176 C-8.50098017,176 -12.375,172.125109 -12.375,167.345189 C-12.375,165.824247 -11.9742861,164.330162 -11.2132216,163.01343 L80.5081929,4.32449322 C82.9000192,0.186349677 88.1928515,-1.22888408 92.3300646,1.16348016 Z M98.5562146,134.873059 L77.6271187,134.873059 C76.5657636,134.873059 75.7053653,135.733458 75.7053653,136.794813 L75.7053653,136.794813 L75.7053653,157.723909 C75.7053653,158.785264 76.5657636,159.645662 77.6271187,159.645662 L77.6271187,159.645662 L98.5562146,159.645662 C99.6175697,159.645662 100.477968,158.785264 100.477968,157.723909 L100.477968,157.723909 L100.477968,136.794813 C100.477968,135.733458 99.6175697,134.873059 98.5562146,134.873059 L98.5562146,134.873059 Z M101.184867,55.0502283 L74.9384996,55.0511642 L74.878591,55.0539708 C73.8193028,55.1201763 73.0142502,56.0325692 73.0804557,57.0918574 L73.0804557,57.0918574 L76.9690036,119.308625 C77.0323056,120.321456 77.8722072,121.110502 78.8870146,121.110502 L78.8870146,121.110502 L97.2963187,121.110502 C98.3111261,121.110502 99.1510277,120.321456 99.2143297,119.308625 L99.2143297,119.308625 L103.102878,57.0918574 C103.105372,57.0519475 103.10662,57.0119695 103.10662,56.9719817 C103.10662,55.9106266 102.246222,55.0502283 101.184867,55.0502283 L101.184867,55.0502283 Z"
                    id="Alert"
                  ></path>
                </g>
              </g>
            </g>
          </svg>
        )}

        {/* Landscape SVG */}
        <svg
          id="landscape-svg"
          className="landscape-hidden"
          width={svgLongSide}
          height={svgShortSide}
          viewBox="0 0 1920 1080"
          version="1.1"
          xmlns="http://www.w3.org/2000/svg"
          style={{ background: "#FFDD00" }}
        >
          <style>
            {`@font-face {
                font-family: 'Inter';
                src: url('data:font/truetype;charset=utf-8;base64,${interBase64}');
                font-weight: normal;
                font-style: normal;
              }`}
          </style>
          <title>Outfront Alert Landscape</title>
          <g
            id="Outfront-Alert-Landscape"
            stroke="none"
            strokeWidth="1"
            fill="none"
            fillRule="evenodd"
          >
            <rect fill="#FFDD00" x="0" y="0" width="1920" height="1080"></rect>
            <g
              id="Landscape-Widget"
              transform="translate(48.000000, 256.000000)"
            >
              <path
                d="M193.04471,0 L1792,0 C1809.67311,-3.24649801e-15 1824,14.326888 1824,32 L1824,536 C1824,553.673112 1809.67311,568 1792,568 L32,568 C14.326888,568 2.164332e-15,553.673112 0,536 L0,189.465938 C3.50157181e-14,180.854354 3.47089536,172.606236 9.62823578,166.585725 L170.672946,9.11978659 C176.652124,3.27347834 184.6823,-2.3332846e-14 193.04471,0 Z"
                id="Landscape-Color-Block"
                fill="#171F26"
                transform="translate(912.000000, 284.000000) scale(-1, 1) translate(-912.000000, -284.000000) "
              ></path>
              <g
                id="Landscape-Text-Container"
                transform="translate(64.000000, 92.000000)"
                fontFamily="Inter"
                fill="#FFFFFF"
                fontWeight="500"
                fontSize={svgFontSize}
              >
                {landscapeSVGText}
              </g>
            </g>
            <g id="CTA" transform="translate(64.000000, 864.000000)">
              <text
                id="url"
                fontFamily="Inter"
                fontSize="120"
                fontWeight="700"
                fill="#171F26"
              >
                <tspan x="798" y="135">
                  mbta.com/alerts
                </tspan>
              </text>
              <g id="Logo/T-KO" fill="#171F26">
                <path
                  d="M88,0 C136.601058,0 176,39.398942 176,88 C176,136.601058 136.601058,176 88,176 C39.398942,176 0,136.601058 0,88 C0,39.398942 39.398942,0 88,0 Z M88,7.744 C43.6758351,7.744 7.744,43.6758351 7.744,88 C7.744,132.324165 43.6758351,168.256 88,168.256 C132.324165,168.256 168.256,132.324165 168.256,88 C168.256,43.6758351 132.324165,7.744 88,7.744 Z M143.616,48.752 L143.616,76.736 L101.992,76.735 L101.992,145.2 L74.008,145.2 L74.008,76.735 L32.384,76.736 L32.384,48.752 L143.616,48.752 Z"
                  id="Color"
                ></path>
              </g>
            </g>
            <g
              id="Header"
              transform="translate(64.000000, 48.000000)"
              fill="#171F26"
            >
              <text
                id="Alert-type"
                fontFamily="Inter"
                fontSize="120"
                fontWeight="700"
                letterSpacing="3.33333333"
              >
                <tspan x="224" y="124">
                  ATTENTION
                </tspan>
              </text>
              <g id="Icon">
                <path
                  d="M92.3300646,1.16348016 C93.6420741,1.9221562 94.7318615,3.01218872 95.490367,4.32449322 L187.211781,163.01343 C189.603608,167.151573 188.188692,172.445596 184.051479,174.83796 C182.735043,175.599196 181.241294,176 179.720694,176 L-3.72213452,176 C-8.50098017,176 -12.375,172.125109 -12.375,167.345189 C-12.375,165.824247 -11.9742861,164.330162 -11.2132216,163.01343 L80.5081929,4.32449322 C82.9000192,0.186349677 88.1928515,-1.22888408 92.3300646,1.16348016 Z M98.5562146,134.873059 L77.6271187,134.873059 C76.5657636,134.873059 75.7053653,135.733458 75.7053653,136.794813 L75.7053653,136.794813 L75.7053653,157.723909 C75.7053653,158.785264 76.5657636,159.645662 77.6271187,159.645662 L77.6271187,159.645662 L98.5562146,159.645662 C99.6175697,159.645662 100.477968,158.785264 100.477968,157.723909 L100.477968,157.723909 L100.477968,136.794813 C100.477968,135.733458 99.6175697,134.873059 98.5562146,134.873059 L98.5562146,134.873059 Z M101.184867,55.0502283 L74.9384996,55.0511642 L74.878591,55.0539708 C73.8193028,55.1201763 73.0142502,56.0325692 73.0804557,57.0918574 L73.0804557,57.0918574 L76.9690036,119.308625 C77.0323056,120.321456 77.8722072,121.110502 78.8870146,121.110502 L78.8870146,121.110502 L97.2963187,121.110502 C98.3111261,121.110502 99.1510277,120.321456 99.2143297,119.308625 L99.2143297,119.308625 L103.102878,57.0918574 C103.105372,57.0519475 103.10662,57.0119695 103.10662,56.9719817 C103.10662,55.9106266 102.246222,55.0502283 101.184867,55.0502283 L101.184867,55.0502283 Z"
                  id="Alert"
                ></path>
              </g>
            </g>
          </g>
        </svg>
      </div>
    );
  }
}

export default SVGPreviews;
