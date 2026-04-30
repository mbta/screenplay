import React from "react";
import StackedStationCards from "./StackedStationCards";

import SVGPreviews from "./SVGPreviews";
import { Message, Station } from "../EmergencyTakeoverTool";

interface WizardSidebarProps {
  selectedStations: Station[];
  step: number;
  indoorMessage: Message;
  outdoorMessage: Message;
}

class WizardSidebar extends React.Component<WizardSidebarProps> {
  constructor(props: WizardSidebarProps) {
    super(props);
  }

  getPreviewImage(message: Message, prefix: string) {
    if (this.props.step === 1) {
      return (
        <img
          className="portrait-png"
          src={`/images/Outfront-Alert-Empty-Preview.png`}
          alt=""
        />
      );
    } else if (message.type === "canned") {
      return (
        <img
          className="portrait-png"
          src={`/images/Outfront-Alert-${message.id}-portrait.png`}
          alt=""
        />
      );
    }

    return <SVGPreviews showText prefix={prefix} message={message.text} />;
  }

  render() {
    return (
      <div className="wizard-sidebar">
        <span className="preview-title text-16">Preview</span>
        {this.getPreviewImage(this.props.indoorMessage, "indoor")}
        {this.getPreviewImage(this.props.outdoorMessage, "outdoor")}
        <StackedStationCards stations={this.props.selectedStations} />
      </div>
    );
  }
}

export default WizardSidebar;
