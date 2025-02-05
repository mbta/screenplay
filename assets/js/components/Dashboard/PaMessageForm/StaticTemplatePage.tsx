import React, { ComponentType, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { StaticTemplate } from "Models/static_template";
import FilterGroup from "Components/FilterGroup";
import MessageTable from "./Tables/MessageTable";
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
            <MessageTable
              headers={["Message"]}
              isReadOnly={false}
              isLoading={false}
              addSelectColumn={true}
              addKebabColumn={false}
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
          </Col>
        </Row>
      </Container>
    </div>
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
    <tr className="message-table__row" onClick={() => onSelect(template)}>
      <td>
        <div>{template.title}</div>
        <div>{template.visual_text}</div>
      </td>
      <td className="message-table__select">
        <Button variant="link" onClick={() => onSelect(template)}>
          Select
        </Button>
      </td>
    </tr>
  );
};

export default StaticTemplatePage;
