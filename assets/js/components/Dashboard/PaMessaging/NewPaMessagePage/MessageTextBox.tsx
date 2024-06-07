import React from "react";
import { Form } from "react-bootstrap";

interface Props {
  text: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
  label: string;
}

const MessageTextBox = ({ text, onChangeText, disabled, label }: Props) => {
  return (
    <Form>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        className="text-input"
        as="textarea"
        value={text}
        onChange={(textbox) => onChangeText(textbox.target.value)}
        disabled={disabled}
      />
    </Form>
  );
};

export default MessageTextBox;
