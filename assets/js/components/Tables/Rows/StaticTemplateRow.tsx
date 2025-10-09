import { StaticTemplate } from "Models/static_template";
import React, { ComponentType } from "react";
import { Button } from "react-bootstrap";
import * as messageTableStyles from "Styles/message-table.module.scss";
import { templateTypeLabel } from "../../../util";

interface StaticTemplateRowProps {
  template: StaticTemplate;
  onSelect: (template: StaticTemplate) => void;
}

const StaticTemplateRow: ComponentType<StaticTemplateRowProps> = ({
  template,
  onSelect,
}: StaticTemplateRowProps) => {
  return (
    <tr className={messageTableStyles.row} onClick={() => onSelect(template)}>
      <td>
        <div>{template.title}</div>
        <div>{template.visual_text}</div>
      </td>
      <td>
        <div>{templateTypeLabel(template)}</div>
      </td>
      <td className={messageTableStyles.select}>
        <Button variant="link" onClick={() => onSelect(template)}>
          Select
        </Button>
      </td>
    </tr>
  );
};

export default StaticTemplateRow;
