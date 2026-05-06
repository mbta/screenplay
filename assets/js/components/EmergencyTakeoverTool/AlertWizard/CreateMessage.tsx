import React from "react";
import CANNED_MESSAGES from "Constants/messages";
import { charLimit } from "Constants/misc";
import { Message } from "../EmergencyTakeoverTool";
import cx from "classnames";
import { getMessageString } from "../../../util";

interface CreateMessageProps {
  value: Message;
  onChange: (value: Message) => void;
}

const CreateMessage = ({ value, onChange }: CreateMessageProps) => {
  const fields = [
    { where: "indoor" as const, label: "Indoor" },
    { where: "outdoor" as const, label: "Outdoor" },
  ];
  return (
    <>
      <div className="step-instructions">
        <div className="step-header weight-700">Message</div>
        <div>This is the text that riders will see.</div>
        <div>
          It should be a short description of the issue, and recommended rider
          action.
        </div>
      </div>

      <div className="message-inputs">
        <div
          style={{ gridColumn: 2 }}
          className={cx("message-option", "option-one", {
            "selected-option": value.type === "canned",
          })}
        >
          <select
            className="message-select text-16"
            value={value.type === "canned" ? value.id : -1}
            onChange={(e) => onChange({ type: "canned", id: +e.target.value })}
          >
            <option value={-1} hidden>
              Select canned message…
            </option>
            {CANNED_MESSAGES.map((message) => (
              <option key={message.id} value={message.id}>
                {message.name}
              </option>
            ))}
          </select>
        </div>
        <div className="message-subgrid">
          {fields.map(({ where, label }) => (
            <label key={label} htmlFor={`${where}-text`}>
              {label} text (144 character max)
            </label>
          ))}
        </div>
        <div
          className={cx("message-subgrid", "message-option", "option-two", {
            "selected-option": value.type === "custom",
          })}
        >
          {fields.map(({ where }) => (
            <textarea
              key={where}
              id={`${where}-text`}
              className="message-textarea text-16"
              value={getMessageString(value, where)}
              maxLength={charLimit}
              placeholder="Type, or select a canned message above to edit here..."
              onChange={(e) => {
                const base =
                  value.type === "canned"
                    ? {
                        type: "custom" as const,
                        text: {
                          indoor: getMessageString(value, "indoor"),
                          outdoor: getMessageString(value, "outdoor"),
                        },
                      }
                    : value;
                onChange({
                  ...base,
                  text: { ...base.text, [where]: e.target.value },
                });
              }}
            ></textarea>
          ))}
        </div>
      </div>
    </>
  );
};

export default CreateMessage;
