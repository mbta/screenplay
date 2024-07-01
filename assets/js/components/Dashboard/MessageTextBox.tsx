import React from "react";
import { Form } from "react-bootstrap";

interface Props {
  text: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
  label: string;
  id: string;
  maxLength: number;
}

const MessageTextBox = ({
  text,
  onChangeText,
  disabled,
  label,
  id,
  maxLength,
}: Props) => {
  return (
    <Form.Group>
      <Form.Label htmlFor={id}>{label}</Form.Label>
      <Form.Control
        id={id}
        className="text-input"
        maxLength={maxLength}
        as="textarea"
        value={text}
        onChange={(textbox) => onChangeText(textbox.target.value)}
        disabled={disabled}
      />
    </Form.Group>
  );
};

export default MessageTextBox;
