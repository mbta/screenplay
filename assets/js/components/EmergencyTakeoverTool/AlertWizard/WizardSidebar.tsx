import React from "react";
import StackedStationCards from "./StackedStationCards";

import SVGPreviews from "./SVGPreviews";
import { Message, Station } from "../EmergencyTakeoverTool";

interface WizardSidebarProps {
  selectedStations: Station[];
  step: number;
  message: Message;
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
    } else if (this.props.message.type === "canned") {
      return (
        <img
          className="portrait-png"
          src={`/images/Outfront-Alert-${this.props.message.id}-portrait.png`}
          alt=""
        />
      );
    }

    return <SVGPreviews showText={true} message={this.props.message.text} />;
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
