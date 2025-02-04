import React, { ComponentType, useState } from "react";
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
              header="Filter by template type"
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
            <div className="static-template-table-header">
              {selectedTemplateType === "psa" ? "PSAs" : "Emergency"}
            </div>
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
  onSelect,
}: StaticTemplateTableProps) => {
  return (
    <table className="static-template-table">
      <thead>
        <tr>
          <th className="static-template-table__message">Message</th>
          <th className="static-template-table__select"></th>
        </tr>
      </thead>
      <tbody>
        {templates.map((template) => {
          return (
            <StaticTemplateRow
              key={template.title}
              template={template}
              onSelect={onSelect}
            />
          );
        })}
      </tbody>
    </table>
  );
};

interface StaticTemplateRowProps {
  template: StaticTemplate;
  onSelect: (template: StaticTemplate) => void;
}

const StaticTemplateRow: ComponentType<StaticTemplateRowProps> = ({
  template,
  onSelect,
}: StaticTemplateRowProps) => {
  return (
    <tr
      className="static-template-table__row"
      onClick={() => onSelect(template)}
    >
      <td>
        <div>{template.title}</div>
        <div>{template.visual_text}</div>
      </td>
      <td className="select-template-table__select">
        <Button variant="link" onClick={() => onSelect(template)}>
          Select
        </Button>
      </td>
    </tr>
  );
};

export default StaticTemplatePage;
