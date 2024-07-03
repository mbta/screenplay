import React, { ComponentType, useState, useEffect } from "react";
import { Container, Row, Col, FormCheck } from "react-bootstrap";
import { PlusCircleFill } from "react-bootstrap-icons";
import { fetchPaMessages } from "Utils/api";
import { PaMessage } from "Models/pa_message";
import { Link } from "react-router-dom";

const PaMessagesPage: ComponentType = () => {
  const [paMessages, setPaMessages] = useState<PaMessage[]>([]);

  useEffect(() => {
    const fetchAndSetPaMessages = async () => {
      const allPaMessages = await fetchPaMessages();
      setPaMessages(allPaMessages);
    };
    fetchAndSetPaMessages();
  }, []);

  return (
    <>
      <div className="pa-message-page-header">PA/ESS Messages</div>
      <Container fluid>
        <Row>
          <Col className="pa-message-filter-selection">
            <div>Message state</div>
            <div>Service type</div>
          </Col>
          <Col className="pa-message-table-container">
            <Row className="pa-message-table-action-bar">
              <Col>
                <Link to="/pa-messages/new" className="add-new-button">
                  <PlusCircleFill className="pa-message-table-action-bar__plus" />{" "}
                  Add New
                </Link>
              </Col>
              <Col className="pa-message-table-action-bar__search">
                <div>Search</div>
              </Col>
              <Col className="pa-message-table-action-bar__advance-search">
                <a href="/pa-messages">Advance Search</a>
              </Col>
            </Row>
            <Row>
              <PaMessageTable paMessages={paMessages} />
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
          There are no active PA/ESS Messages.
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
