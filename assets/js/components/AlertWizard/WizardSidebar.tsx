import React from "react";
import StackedStationCards from "./StackedStationCards";

import { Station } from "../../constants/stations";
import SVGPreviews from "./SVGPreviews";

interface WizardSidebarProps {
  selectedStations: Station[];
  step: number;
  message: string;
}

class WizardSidebar extends React.Component<WizardSidebarProps> {
  constructor(props: WizardSidebarProps) {
    super(props);
  }

  render() {
    return (
      <div className="wizard-sidebar">
        <span className="preview-title text-16">Preview</span>
        <SVGPreviews showText={ this.props.step > 1 } message={this.props.message}/>
        <StackedStationCards stations={this.props.selectedStations} />
      </div>
    );
  }
}

export default WizardSidebar;
