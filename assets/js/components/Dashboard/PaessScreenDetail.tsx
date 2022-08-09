import * as React from "react";

interface PaessScreenDetailProps {
  stationCode: string;
  zone: string;
  label?: string;
}

const PaessScreenDetail = (props: PaessScreenDetailProps): JSX.Element => {
  const generateSource = () => {
    // @ts-ignore Suppressing "object could be null" warning
    const { environmentName } = document.getElementById("app").dataset;
    return environmentName === "dev"
      ? `http://signs-dev.mbtace.com/${props.stationCode}/${props.zone}`
      : `http://signs.mbta.com/${props.stationCode}/${props.zone}`;
  };

  function getZoneLabel(zone: string) {
    switch (zone) {
      case "m":
        return "Mezzanine";
      case "c":
        return "Center";
      case "n":
        return "Northbound";
      case "s":
        return "Southbound";
      case "e":
        return "Eastbound";
      case "w":
        return "Westbound";
    }
  }

  return (
    <div>
      <div className="paess__sign-label">
        {props.label ?? getZoneLabel(props.zone)}
      </div>
      <iframe
        className="screen-detail__iframe screen-detail__iframe--pa_ess"
        title={props.stationCode}
        src={generateSource()}
      />
    </div>
  );
};

export default PaessScreenDetail;
