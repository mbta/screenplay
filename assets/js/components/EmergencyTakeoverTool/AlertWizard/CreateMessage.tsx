import React from "react";
import CANNED_MESSAGES from "Constants/messages";
import { charLimit } from "Constants/misc";
import { Message } from "../EmergencyTakeoverTool";
import cx from "classnames";
import { getMessageString } from "../../../util";

interface CreateMessageProps {
  indoorValue: Message;
  onChangeIndoor: (value: Message) => void;
  outdoorValue: Message;
  onChangeOutdoor: (value: Message) => void;
}

const CreateMessage = ({
  indoorValue,
  onChangeIndoor,
  outdoorValue,
  onChangeOutdoor,
}: CreateMessageProps) => {
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
      <MessageInput
        value={indoorValue}
        onChange={onChangeIndoor}
        label="Indoor"
      />
      <MessageInput
        value={outdoorValue}
        onChange={onChangeOutdoor}
        label="Outdoor"
      />
    </>
  );
};

const MessageInput = ({
  value,
  onChange,
  label,
}: {
  value: Message;
  onChange: (value: Message) => void;
  label: string;
}) => {
  return (
    <div className="step-body">
      <div className="info">
        <div>{label} text</div>
        <div className="text-14">(144 character max)</div>
      </div>
      <div>
        <div
          className={cx("radio-option", "option-one", {
            "selected-option": value.type === "canned",
          })}
        >
          <input
            type="radio"
            value="1"
            checked={value.type === "canned"}
            onChange={() => onChange({ type: "canned", id: -1 })}
          />
          <select
            className="message-select text-16"
            value={value.type === "canned" ? value.id : -1}
            onChange={(e) => onChange({ type: "canned", id: +e.target.value })}
          >
            <option value={-1} hidden>
              Select canned message…
            </option>
            {CANNED_MESSAGES.map((message, index) => (
              <option key={index} value={index}>
                {message}
              </option>
            ))}
          </select>
        </div>
        <div
          className={cx("radio-option", "option-two", {
            "selected-option": value.type === "custom",
          })}
        >
          <input
            type="radio"
            value="2"
            checked={value.type === "custom"}
            onChange={() =>
              onChange({ type: "custom", text: getMessageString(value) })
            }
          />
          <textarea
            className="message-textarea text-16"
            value={getMessageString(value)}
            maxLength={charLimit}
            placeholder="Type, or select a canned message above to edit here..."
            onChange={(e) => onChange({ type: "custom", text: e.target.value })}
          ></textarea>
        </div>
      </div>
    </div>
  );
};

export default CreateMessage;
