import React from "react";
import { Button } from "react-bootstrap";
import moment from "moment";
import { Alert } from "Models/alert";
import { getAlertEarliestStartLatestEnd } from "../../../util";
import * as messageTableStyles from "Styles/message-table.module.scss";

interface AssociateAlertsRowProps {
  alert: Alert;
  onSelect: () => void;
}

const AssociateAlertsRow = ({ alert, onSelect }: AssociateAlertsRowProps) => {
  const [start, end] = getAlertEarliestStartLatestEnd(alert.active_period);

  const last_modified = moment(alert.updated_at).format("l LT");

  return (
    <tr className={messageTableStyles.row} onClick={() => onSelect()}>
      <td>{alert.header}</td>
      <td>{alert.id}</td>
      <td>
        {start}
        <br />
        {end}
      </td>
      <td>{last_modified}</td>
      <td className={messageTableStyles.select}>
        <Button variant="link" onClick={() => onSelect()}>
          Select
        </Button>
      </td>
    </tr>
  );
};

export default AssociateAlertsRow;
