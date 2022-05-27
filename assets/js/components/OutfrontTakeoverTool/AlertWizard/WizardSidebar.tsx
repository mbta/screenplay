import React from "react";
import StackedStationCards from "./StackedStationCards";

import { Station } from "../../../constants/stations";
import SVGPreviews from "./SVGPreviews";

interface WizardSidebarProps {
  selectedStations: Station[];
  step: number;
  customMessage: string;
  cannedMessageId: string;
}

class WizardSidebar extends React.Component<WizardSidebarProps> {
  constructor(props: WizardSidebarProps) {
    super(props);
  }

  getPreviewImage() {
    if (this.props.step === 1) {
      return (
        <img
          className="portrait-png"
          src={`/images/Outfront-Alert-Empty-Preview.png`}
          alt=""
        />
      );
    } else if (this.props.cannedMessageId !== "") {
      return (
        <img
          className="portrait-png"
          src={`/images/Outfront-Alert-${this.props.cannedMessageId}-portrait.png`}
          alt=""
        />
      );
    }

    return <SVGPreviews showText={true} message={this.props.customMessage} />;
  }

  render() {
    return (
      <div className="wizard-sidebar">
        <span className="preview-title text-16">Preview</span>
        {this.getPreviewImage()}
        <StackedStationCards stations={this.props.selectedStations} />
      </div>
    );
  }
}

export default WizardSidebar;
