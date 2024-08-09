import React, { ComponentType, useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  FormCheck,
  ButtonGroup,
  Button,
} from "react-bootstrap";
import { PlusCircleFill } from "react-bootstrap-icons";
import { PaMessage } from "Models/pa_message";
import { Link, useSearchParams } from "react-router-dom";
import {
  usePaMessages,
  StateFilter,
  stateFilterSchema,
} from "Utils/api/pa-messages/usePaMessage";
import cx from "classnames";

const PaMessagesPage: ComponentType = () => {
  const [params, setParams] = useSearchParams();
  const [stateFilter, setStateFilter] = useState<StateFilter | null>(() =>
    stateFilterSchema.nullable().catch(null).parse(params.get("state")),
  );

  useEffect(() => {
    setParams(() => {
      const newParams = new URLSearchParams();

      if (stateFilter) newParams.set("state", stateFilter);

      return newParams;
    });
  }, [stateFilter]);

  const toggleState = (filter: StateFilter) => () =>
    setStateFilter((f) => (f === filter ? null : filter));

  const { data } = usePaMessages({ stateFilter });

  return (
    <>
      <div className="pa-message-page-header">PA/ESS Messages</div>
      <Container fluid>
        <Row>
          <Col className="pa-message-filter-selection">
            <section>
              <header>Filter by message state</header>
              <ButtonGroup className="button-group" vertical>
                <Button
                  className={cx("button", { active: stateFilter === "active" })}
                  onClick={toggleState("active")}
                >
                  Active
                </Button>
                <Button
                  className={cx("button", { active: stateFilter === "future" })}
                  onClick={toggleState("future")}
                >
                  Future
                </Button>
                <Button
                  className={cx("button", { active: stateFilter === "past" })}
                  onClick={toggleState("past")}
                >
                  Past
                </Button>
              </ButtonGroup>
            </section>
          </Col>
          <Col className="pa-message-table-container">
            <Row className="pa-message-table-action-bar">
              <Col>
                <Link to="/pa-messages/new" className="add-new-button">
                  <PlusCircleFill className="pa-message-table-action-bar__plus" />{" "}
                  Add New
                </Link>
              </Col>
              {/* Can remove for now because this will not be implemented until after MVP launch */}
              {/* <Col className="pa-message-table-action-bar__search">
                <div>Search</div>
              </Col> */}
              {/* <Col className="pa-message-table-action-bar__advance-search">
                <a href="/pa-messages">Advance Search</a>
              </Col> */}
            </Row>
            <Row>
              {Array.isArray(data) && <PaMessageTable paMessages={data} />}
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
};

interface PaMessageTableProps {
  paMessages: PaMessage[];
}

const PaMessageTable: ComponentType<PaMessageTableProps> = ({
  paMessages,
}: PaMessageTableProps) => {
  return (
    <>
      <table className="pa-message-table">
        <thead>
          <tr>
            <th>Message</th>
            <th>Interval</th>
            <th className="pa-message-table__start-end">Start-End</th>
            <th>Save</th>
            <th className="pa-message-table__actions"></th>
          </tr>
        </thead>
        <tbody>
          {paMessages.map((paMessage: PaMessage) => {
            return <PaMessageRow key={paMessage.id} paMessage={paMessage} />;
          })}
        </tbody>
      </table>
      {paMessages.length == 0 && (
        <div className="pa-message-table__empty">
          There are no PA/ESS Messages matching the current filters.
        </div>
      )}
    </>
  );
};

interface PaMessageRowProps {
  paMessage: PaMessage;
}

const PaMessageRow: ComponentType<PaMessageRowProps> = ({
  paMessage,
}: PaMessageRowProps) => {
  const start = new Date(paMessage.start_time);
  const end = new Date(paMessage.end_time);

  return (
    <tr>
      <td>{paMessage.visual_text}</td>
      <td>{paMessage.interval_in_minutes} min</td>
      <td className="pa-message-table__start-end">
        {start.toLocaleString().replace(",", "")}
        <br />
        {end.toLocaleString().replace(",", "")}
      </td>
      <td>
        <FormCheck />
      </td>
      <td className="pa-message-table__actions">
        <a href="/pa-messages">
          <u>Pause</u>
        </a>
        <a href="/pa-messages">
          <u>Copy</u>
        </a>
      </td>
    </tr>
  );
};

export default PaMessagesPage;
