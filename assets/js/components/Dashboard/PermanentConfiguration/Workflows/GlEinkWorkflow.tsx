import React, { ComponentType } from "react";
import { SubwayWorkflowProps } from "../ConfigureScreensPage";

const GlEinkWorkflow: ComponentType<SubwayWorkflowProps> = ({
  places,
}: SubwayWorkflowProps) => {
  return (
    <>
      <div>GL-Eink</div>
      {places.map((place) => (
        <div key={place.id}>{place.name}</div>
      ))}
    </>
  );
};

export default GlEinkWorkflow;
