import React, { ComponentType } from "react";
import KebabMenu from "Components/KebabMenu";
import { updateExistingPaMessage } from "Utils/api";
import { PaMessage, UpdatePaMessageBody } from "Models/pa_message";
import moment from "moment";
import cx from "classnames";
import { useNavigate } from "react-router-dom";
import { Dropdown, FormCheck } from "react-bootstrap";
import * as messageTableStyles from "Styles/message-table.module.scss";

interface PaMessageRowProps {
  paMessage: PaMessage;
  onEndNow: () => void;
  onError: () => void;
  showMoreActions: boolean;
  onUpdate: () => void;
  setErrorMessage: (message: string | null) => void;
  isReadOnly: boolean;
}

const PaMessageRow: ComponentType<PaMessageRowProps> = ({
  paMessage,
  onEndNow,
  onError,
  showMoreActions,
  onUpdate,
  setErrorMessage,
  isReadOnly,
}: PaMessageRowProps) => {
  const navigate = useNavigate();
  const start = new Date(paMessage.start_datetime);
  const end =
    paMessage.end_datetime === null ? null : new Date(paMessage.end_datetime);

  const endMessage = (paMessage: PaMessage) => {
    updateExistingPaMessage(paMessage.id, {
      ...paMessage,
      end_datetime: moment().utc().add(-1, "second").toISOString(),
    }).then(({ status }) => {
      if (status === 200) {
        onEndNow();
      } else {
        onError();
      }
    });
  };

  const togglePaused = async (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    try {
      await updateExistingPaMessage(paMessage.id, {
        paused: !paMessage.paused,
      } as UpdatePaMessageBody);
      onUpdate();
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <tr
      className={messageTableStyles.row}
      onClick={() => navigate(`/pa-messages/${paMessage.id}/edit`)}
    >
      <td className={messageTableStyles.message}>
        <a
          href={`/pa-messages/${paMessage.id}/edit`}
          onClick={(e) => e.stopPropagation()}
        >
          {paMessage.visual_text}
        </a>
      </td>
      <td className={messageTableStyles.interval}>
        {paMessage.interval_in_minutes} min
      </td>
      <td className={messageTableStyles.startEnd}>
        {start.toLocaleString().replace(",", "")}
        <br />
        {end
          ? end.toLocaleString().replace(",", "")
          : `At end of alert ${paMessage.alert_id}`}
      </td>
      {showMoreActions && (
        <>
          <td className={messageTableStyles.actions}>
            <div
              className={`pause-active-switch-container`}
              onClick={(e) => {
                e.stopPropagation();
                if (isReadOnly) {
                  return;
                }
                togglePaused(e);
              }}
            >
              <FormCheck
                className={"pause-active-switch"}
                type="switch"
                checked={!paMessage.paused}
                onChange={() => {}}
                disabled={isReadOnly}
              />
              <div
                className={cx("switch-text", {
                  paused: paMessage.paused,
                  active: !paMessage.paused,
                })}
              >
                {paMessage.paused ? "Paused" : "Active"}
              </div>
            </div>
          </td>
          {!isReadOnly && (
            <td>
              <KebabMenu>
                <Dropdown.Item
                  className="kebab-menu-dropdown__item"
                  onClick={() => endMessage(paMessage)}
                >
                  End Now
                </Dropdown.Item>
              </KebabMenu>
            </td>
          )}
        </>
      )}
    </tr>
  );
};

export default PaMessageRow;
