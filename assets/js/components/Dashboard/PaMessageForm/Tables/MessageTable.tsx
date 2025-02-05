import React from "react";
import { Spinner } from "react-bootstrap";

interface MessageTableProps {
  isLoading: boolean;
  headers: string[];
  addSelectColumn: boolean;
  addKebabColumn: boolean;
  isReadOnly: boolean;
  rows: JSX.Element[];
  emptyStateText: string;
}

const MessageTable = ({
  isLoading = false,
  headers = [],
  addSelectColumn = false,
  addKebabColumn = false,
  isReadOnly = true,
  rows = [],
  emptyStateText = "",
}: MessageTableProps): JSX.Element => {
  return (
    <>
      <table className="message-table">
        <thead>
          <tr>
            {headers.map((header: string) => {
              const cssName = header.replace(" ", "-").toLowerCase();
              return (
                <th key={cssName} className={"message-table__" + cssName}>
                  {header}
                </th>
              );
            })}
            {addSelectColumn && <th className={"message-table__select"}></th>}
            {addKebabColumn && (
              <>
                <th className="message-table__actions"></th>
                {!isReadOnly && <th className="message-table__kebab"></th>}
              </>
            )}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
      {rows.length == 0 && (
        <div className="message-table__empty">
          {isLoading ? (
            <div className="message-table__loading">
              <Spinner role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            <div className="message-table__empty-text">{emptyStateText}</div>
          )}
        </div>
      )}
    </>
  );
};

export default MessageTable;
