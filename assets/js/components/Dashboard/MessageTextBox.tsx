import React from "react";
import { Form } from "react-bootstrap";

interface Props {
  text: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
  label: string;
  id: string;
  maxLength: number;
  required?: boolean;
  validationText?: string;
}

const MessageTextBox = ({
  text,
  onChangeText,
  disabled,
  label,
  id,
  maxLength,
  required,
  validationText,
}: Props) => {
  return (
    <Form.Group className="message-text-box">
      <Form.Label htmlFor={id}>{label}</Form.Label>
      <Form.Control
        required={required}
        id={id}
        className="text-input"
        maxLength={maxLength}
        as="textarea"
        value={text}
        onChange={(textbox) => onChangeText(textbox.target.value)}
        disabled={disabled}
      />
      <Form.Control.Feedback type="invalid">
        {validationText}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export default MessageTextBox;
