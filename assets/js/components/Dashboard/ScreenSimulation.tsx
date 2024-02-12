import React, { SyntheticEvent, useContext } from "react";
import { Screen } from "../../models/screen";

interface Props {
  screen: Screen;
}

const ScreenSimulation = ({ screen }: Props): JSX.Element => {
  return (
    <div
      className={`screen-simulation__iframe-container screen-simulation__iframe-container--${screen.type}`}
    >
      <iframe
        className={`screen-simulation__iframe screen-simulation__iframe--${screen.type}`}
        title={screen.id}
        src={generateSource(screen)}
      />
    </div>
  );
};

const generateSource = (screen: Screen) => {
  const { id, type } = screen;
  // @ts-ignore Suppressing "object could be null" warning
  const screensUrl = document
    .querySelector("meta[name=screens-url]")
    ?.getAttribute("content");
  const queryParams = "requestor=screenplay";

  if (type.includes("v2")) {
    return `${screensUrl}/v2/screen/${id}/simulation?${queryParams}`;
  }
  if (
    ["bus_eink", "gl_eink_single", "gl_eink_double", "solari"].includes(type)
  ) {
    return `${screensUrl}/screen/${id}?${queryParams}`;
  }
  if (type === "dup") {
    return `${screensUrl}/screen/${id}/simulation?${queryParams}`;
  }

  return "";
};

export default ScreenSimulation;
