import React from "react";
import { Form } from "react-bootstrap";
import cx from "classnames";
import * as paMessageStyles from "Styles/pa-messages.module.scss";

interface Props {
  text: string;
  onChangeText: (text: string) => void;
  disabled?: boolean;
  className?: string;
  label: string;
  id: string;
  maxLength: number;
  required?: boolean;
  validationText?: string;
  validated?: boolean;
}

const MessageTextBox = ({
  text,
  onChangeText,
  disabled,
  className,
  label,
  id,
  maxLength,
  required,
  validationText,
  validated,
}: Props) => {
  return (
    <Form.Group className={className}>
      <Form.Label htmlFor={id}>{label}</Form.Label>
      <Form.Control
        required={required}
        id={id}
        className={cx(
          paMessageStyles.messageTextBox,
          paMessageStyles.inputField,
        )}
        maxLength={maxLength}
        as="textarea"
        value={text}
        onChange={(textbox) => onChangeText(textbox.target.value)}
        disabled={disabled}
        isInvalid={required && validated && text.length === 0}
      />
      <Form.Control.Feedback type="invalid">
        {validationText}
      </Form.Control.Feedback>
    </Form.Group>
  );
};

export default MessageTextBox;
