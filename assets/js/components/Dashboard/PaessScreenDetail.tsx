import * as React from "react";
import ScreenDetailActionBar from "Components/ScreenDetailActionBar";
import { getZoneLabel } from "../../util";

interface PaessScreenDetailProps {
  stationCode: string;
  zone: string;
  label?: string;
}

const PaessScreenDetail = (props: PaessScreenDetailProps): JSX.Element => {
  const generateSource = () => {
    // @ts-ignore Suppressing "object could be null" warning
    const signsUiUrl = document
      .querySelector("meta[name=signs-ui-url]")
      ?.getAttribute("content");
    return `${signsUiUrl}/${props.stationCode}/${props.zone}`;
  };

  return (
    <div>
      <div className="paess__sign-label">
        {props.label ?? getZoneLabel(props.zone)}
        <ScreenDetailActionBar
          screenUrl={generateSource()}
          isCollapsed={true}
        />
      </div>
      <iframe
        className="screen-simulation__iframe screen-simulation__iframe--pa_ess"
        title={props.stationCode}
        src={generateSource()}
      />
    </div>
  );
};

export default PaessScreenDetail;
