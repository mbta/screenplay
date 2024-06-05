import React, { ComponentType } from "react";
import { Card, Row, Col, Form, Button } from "react-bootstrap";
import { ArrowRightShort, VolumeUpFill } from "react-bootstrap-icons";
import {
  NewPaMessagePageState,
  NewPaMessagePageReducerAction,
} from "./NewPaMessagePage";

interface Props {
  pageState: NewPaMessagePageState;
  dispatch: React.Dispatch<NewPaMessagePageReducerAction>;
}

const MessageCard: ComponentType<Props> = ({ pageState, dispatch }: Props) => {
  const { visualText, phoneticText } = pageState;
  return (
    <Card className="message-card">
      <div className="title">Message</div>
      <Row className="align-items-center">
        <Col>
          <Form>
            <Form.Label>Text</Form.Label>
            <Form.Control
              className="visual-text-input"
              as="textarea"
              value={visualText}
              onChange={(textbox) =>
                dispatch({
                  type: "SET_VISUAL_TEXT",
                  visualText: textbox.target.value,
                })
              }
            />
          </Form>
        </Col>
        <Col md="auto">
          <Button
            disabled={visualText.length === 0}
            className="copy-text-button"
            onClick={() =>
              dispatch({
                type: "SET_PHONETIC_TEXT",
                phoneticText: visualText,
              })
            }
          >
            <ArrowRightShort />
          </Button>
        </Col>
        <Col>
          {phoneticText.length > 0 ? (
            <Form>
              <Form.Label>Phonetic Audio</Form.Label>
              <Form.Control
                className="phonetic-text-input"
                as="textarea"
                disabled={phoneticText.length === 0}
                value={phoneticText}
                onChange={(textbox) =>
                  dispatch({
                    type: "SET_PHONETIC_TEXT",
                    phoneticText: textbox.target.value,
                  })
                }
              />
            </Form>
          ) : (
            <Card className="review-audio-card">
              <Button className="review-audio-button" variant="link">
                <VolumeUpFill height={12} />
                Review audio
              </Button>
            </Card>
          )}
        </Col>
      </Row>
    </Card>
  );
};

export default MessageCard;
