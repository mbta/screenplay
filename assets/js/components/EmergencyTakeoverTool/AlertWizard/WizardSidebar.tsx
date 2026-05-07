import React from "react";
import StackedStationCards from "./StackedStationCards";
import AlertPreview from "./AlertPreview";

import { Message, Station } from "../EmergencyTakeoverTool";

interface WizardSidebarProps {
  selectedStations: Station[];
  step: number;
  message: Message;
}

const WizardSidebar = ({
  selectedStations,
  step,
  message,
}: WizardSidebarProps) => {
  return (
    <div className="wizard-sidebar">
      <span className="preview-title text-16">Preview</span>
      <AlertPreview message={message} location="indoor" empty={step === 1} />
      <AlertPreview message={message} location="outdoor" empty={step === 1} />
      <StackedStationCards stations={selectedStations} />
    </div>
  );
};

export default WizardSidebar;
