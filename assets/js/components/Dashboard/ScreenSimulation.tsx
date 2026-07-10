import React, { useMemo } from "react";
import { Screen } from "Models/screen";

interface Props {
  screen: Screen;
}

const ScreenSimulation = ({ screen }: Props): JSX.Element => {
  const src = useMemo(() => generateSource(screen), [screen]);

  return (
    <div
      className={`screen-simulation__iframe-container screen-simulation__iframe-container--${screen.type}`}
    >
      <iframe
        className={`screen-simulation__iframe screen-simulation__iframe--${screen.type}`}
        title={screen.id}
        src={src}
      />
    </div>
  );
};

const generateSource = ({ id }: Screen) => {
  const screensUrl = document
    .querySelector("meta[name=screens-url]")
    ?.getAttribute("content");
  const queryParams = "requestor=screenplay";

  return `${screensUrl}/v2/screen/${id}/simulation?${queryParams}`;
};

export default ScreenSimulation;
