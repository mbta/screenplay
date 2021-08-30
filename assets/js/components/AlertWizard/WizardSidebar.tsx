import React from "react";
import StackedStationCards from "./StackedStationCards";

import { Station } from "../../constants/stations";
import {
  svgFontSize,
  svgLandscapeLineLength,
  svgLineHeight,
  svgLongSide,
  svgPortraitLineLength,
  svgShortSide,
} from "../../constants/misc";

interface WizardSidebarProps {
  selectedStations: Station[];
  step: number;
  message: string;
}

//  This function attempts to create a new svg "text" element, chopping
//  it up into "tspan" pieces, if the message is too long
const createSVGtext = (
  message: string,
  x: number,
  y: number,
  orientation: string,
  maxCharsPerLine: number,
  lineHeight: number
) => {
  const svgText = document.getElementById(orientation + "-text") as HTMLElement;

  // Remove existing tspans
  while (svgText.firstChild) {
    svgText.removeChild(svgText.firstChild);
  }

  // Style the font
  svgText.setAttributeNS(null, "font-size", svgFontSize.toString());
  svgText.setAttributeNS(null, "fill", "#000000"); //  Black text
  svgText.setAttributeNS(null, "text-anchor", "middle"); //  Center the text
  svgText.setAttributeNS(null, "font-family", "Inter, sans-serif");

  // Split the message by max line length
  const words = message.split(" ");
  const linesReducer = words.reduce(
    (acc: { array: string[]; lineCount: number }, curWord: string) => {
      const testLine = acc.array[acc.lineCount] + curWord + " ";
      if (testLine.length > maxCharsPerLine) {
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
  const textHeight = linesReducer.array.length * lineHeight;
  linesReducer.array.forEach((line) => {
    y += lineHeight;

    //  Add a new <tspan> element
    const svgTSpan = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "tspan"
    );
    svgTSpan.setAttributeNS(null, "x", x.toString());
    svgTSpan.setAttributeNS(null, "y", (y - textHeight / 2).toString());

    const tSpanTextNode = document.createTextNode(line);
    svgTSpan.appendChild(tSpanTextNode);
    svgText.appendChild(svgTSpan);
  });

  return svgText;
};

const WizardSidebar = (props: WizardSidebarProps): JSX.Element => {
  // Set up the dynamic portrait and landscape SVGs
  const portraitSVG = document.getElementById("portrait-svg");
  if (portraitSVG && props.step > 1) {
    const svgText = createSVGtext(
      props.message,
      svgShortSide / 2,
      svgLongSide / 2,
      "portrait",
      svgPortraitLineLength,
      svgLineHeight
    );
    portraitSVG.append(svgText);
  }
  const landscapeSVG = document.getElementById("landscape-svg");
  if (landscapeSVG && props.step > 1) {
    const svgText = createSVGtext(
      props.message,
      svgLongSide / 2,
      svgShortSide / 2,
      "landscape",
      svgLandscapeLineLength,
      svgLineHeight
    );
    landscapeSVG.append(svgText);
  }

  return (
    <div className="wizard-sidebar">
      <span className="preview-title text-16">Preview</span>

      <svg
        className="portrait-svg"
        viewBox={"0 0 " + svgShortSide + " " + svgLongSide}
        height={svgLongSide}
        width={svgShortSide}
      >
        <svg
          id="portrait-svg"
          viewBox={"0 0 " + svgShortSide + " " + svgLongSide}
        >
          <rect stroke="black" fill="yellow" height="100%" width="100%" />
          <text id="portrait-text" />
        </svg>
      </svg>

      <svg
        className="landscape-hidden"
        viewBox={"0 0 " + svgLongSide + " " + svgLongSide}
        height={svgLongSide}
        width={svgLongSide}
      >
        <svg
          id="landscape-svg"
          viewBox={"0 0 " + svgLongSide + " " + svgShortSide}
        >
          <rect stroke="black" fill="yellow" height="100%" width="100%" />
          <text id="landscape-text" />
        </svg>
      </svg>

      <StackedStationCards stations={props.selectedStations} />
    </div>
  );
};

export default WizardSidebar;
