import React, { useEffect, useState } from "react";
import { Container, Row, Col, Button } from "react-bootstrap";
import { StaticTemplate } from "Models/static_template";
import { fetchStaticTemplates } from "Utils/api";
import FilterGroup from "Components/FilterGroup";

interface Props {
  onCancel: () => void;
  onSelect: (template: StaticTemplate) => void;
}

type MessageType = "psa" | "emergency";

const StaticTemplatePage = ({ onCancel, onSelect }: Props) => {
  const [staticTemplates, setStaticTemplates] = useState<StaticTemplate[]>([]);
  const [selectedMessageType, setSelectedMessageType] =
    useState<MessageType>("psa");

  useEffect(() => {
    fetchStaticTemplates().then((templates) => setStaticTemplates(templates));
  }, []);

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
              header="Message state"
              selectedFilter={selectedMessageType}
              onFilterSelect={(messageType) =>
                setSelectedMessageType(messageType as MessageType)
              }
              filters={[
                { label: "PSAs", value: "psa" },
                { label: "Emergency", value: "emergency" },
              ]}
            />
          </Col>
          <Col>
            <StaticTemplateTable
              templates={staticTemplates.filter(
                (template) => template.type === selectedMessageType,
              )}
              selectedMessageType={selectedMessageType}
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
  selectedMessageType: MessageType;
  onSelect: (template: StaticTemplate) => void;
}

const StaticTemplateTable = ({
  templates,
  selectedMessageType,
  onSelect,
}: StaticTemplateTableProps) => {
  return (
    <div className="static-template-table-container">
      <div className="table-header">
        {selectedMessageType === "psa" ? "PSAs" : "Emergency"}
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
              <tr className="template-row" key={template.title}>
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
