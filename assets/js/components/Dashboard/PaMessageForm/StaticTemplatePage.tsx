import React, { useState } from "react";
import { Button } from "react-bootstrap";
import { StaticTemplate } from "Models/static_template";
import MessageTable from "../../Tables/MessageTable";
import _staticTemplates from "../../../../static/static_templates.json";
import StaticTemplateRow from "../../Tables/Rows/StaticTemplateRow";
import { RadioList } from "Components/RadioList";
import * as styles from "Styles/pa-messages.module.scss";

interface Props {
  onCancel: () => void;
  onSelect: (template: StaticTemplate) => void;
}

type TemplateType = "psa" | "emergency";

export const STATIC_TEMPLATES = _staticTemplates as StaticTemplate[];

const StaticTemplatePage = ({ onCancel, onSelect }: Props) => {
  const [selectedTemplateType, setSelectedTemplateType] =
    useState<TemplateType>("psa");

  return (
    <div className="mx-5 my-4">
      <div className="d-flex justify-content-between align-items-start">
        <h1 className="mb-5">Select template</h1>
        <Button
          className={styles.transparentButton}
          variant="link"
          onClick={() => onCancel()}
        >
          Cancel
        </Button>
      </div>
      <div className="d-flex gap-5">
        <div style={{ flex: "0 0 200px" }}>
          <div className="mb-2">Filter by template type</div>
          <RadioList
            value={selectedTemplateType}
            onChange={setSelectedTemplateType}
            items={[
              { value: "psa", content: "PSAs" },
              { value: "emergency", content: "Emergency" },
            ]}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div className="fs-2">
            {selectedTemplateType === "psa" ? "PSAs" : "Emergency"}
          </div>
          <MessageTable
            headers={["Message"]}
            isReadOnly={false}
            isLoading={false}
            addSelectColumn
            addMoreActions={false}
            rows={STATIC_TEMPLATES.filter(
              (template) => template.type === selectedTemplateType,
            ).map((template) => {
              return (
                <StaticTemplateRow
                  key={template.title}
                  template={template}
                  onSelect={onSelect}
                />
              );
            })}
            emptyStateText=""
          />
        </div>
      </div>
    </div>
  );
};

export default StaticTemplatePage;
