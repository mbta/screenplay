import React, { useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { StaticTemplate } from "Models/static_template";
import FilterGroup from "Components/FilterGroup";
import _staticTemplates from "../../../../static/static_templates.json";

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
    <div className="static-template-page">
      <Container fluid>
        <Row className="header-container">
          <Col className="header">Select template</Col>
          <Col className="cancel-button-col">
            <Button
              className="cancel-button"
              variant="link"
              onClick={() => onCancel()}
            >
              Cancel
            </Button>
          </Col>
        </Row>
        <Row className="static-template-page-body">
          <Col className="filter-group-col">
            <FilterGroup
              header="Template type"
              selectedFilter={selectedTemplateType}
              onFilterSelect={(templateType) =>
                setSelectedTemplateType(templateType as TemplateType)
              }
              filters={[
                { label: "PSAs", value: "psa" },
                { label: "Emergency", value: "emergency" },
              ]}
            />
          </Col>
          <Col>
            <StaticTemplateTable
              templates={STATIC_TEMPLATES.filter(
                (template) => template.type === selectedTemplateType,
              )}
              selectedTemplateType={selectedTemplateType}
              onSelect={onSelect}
            />
          </Col>
        </Row>
      </Container>
    </div>
  );
};

interface StaticTemplateTableProps {
  templates: StaticTemplate[];
  selectedTemplateType: TemplateType;
  onSelect: (template: StaticTemplate) => void;
}

const StaticTemplateTable = ({
  templates,
  selectedTemplateType,
  onSelect,
}: StaticTemplateTableProps) => {
  return (
    <div className="static-template-table-container">
      <div className="table-header">
        {selectedTemplateType === "psa" ? "PSAs" : "Emergency"}
      </div>
      <table className="static-template-table">
        <thead>
          <tr className="header-row">
            <th className="message-column-header">Message</th>
            <th className="select-column-header"></th>
          </tr>
        </thead>
        <tbody>
          {templates.map((template) => {
            return (
              <tr
                className="template-row"
                key={template.title}
                onClick={() => onSelect(template)}
              >
                <td className="message-cell">
                  <div className="title">{template.title}</div>
                  <div className="message">{template.visual_text}</div>
                </td>
                <td className="select-button-cell">
                  <Button
                    className="select-button"
                    variant="link"
                    onClick={() => onSelect(template)}
                  >
                    Select
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StaticTemplatePage;
