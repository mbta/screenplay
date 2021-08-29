import React from "react";
import cannedMessages from "../../constants/messages";
import { charLimit } from "../../constants/misc";

interface CreateMessageProps {
  messageOption: string;
  cannedMessage: string;
  customMessage: string;
  changeMessageOption: (event: any) => void;
  changeCannedMessage: (event: any) => void;
  changeCustomMessage: (event: any) => void;
}

const CreateMessage = (props: CreateMessageProps) => {
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
      <div className="step-body">
        <div className="info">
          <div>Message text</div>
          <div className="text-14">(512 character max)</div>
        </div>
        <div>
          <div
            className={`radio-option option-one ${
              props.messageOption === "1" ? "selected-option" : ""
            }`}
          >
            <input
              type="radio"
              value="1"
              checked={props.messageOption === "1"}
              onChange={props.changeMessageOption}
            />
            <select
              className="message-select text-16"
              value={props.cannedMessage}
              onChange={props.changeCannedMessage}
            >
              <option value={-1} hidden>
                Select canned message…
              </option>
              {cannedMessages.map((message, index) => (
                <option key={index} value={index}>
                  {message}
                </option>
              ))}
            </select>
          </div>
          <div
            className={`radio-option option-two ${
              props.messageOption === "2" ? "selected-option" : ""
            }`}
          >
            <input
              type="radio"
              value="2"
              checked={props.messageOption === "2"}
              onChange={props.changeMessageOption}
            />
            <textarea
              className="message-textarea text-16"
              value={props.customMessage}
              maxLength={charLimit}
              placeholder="Type, or select a canned message above to edit here..."
              onChange={props.changeCustomMessage}
            ></textarea>
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateMessage;
