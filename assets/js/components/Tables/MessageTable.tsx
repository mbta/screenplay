import { camelCase } from "lodash";
import React from "react";
import { Spinner } from "react-bootstrap";
import * as messageTableStyles from "Styles/message-table.module.scss"

interface MessageTableProps {
  isLoading: boolean;
  headers: string[];
  addSelectColumn: boolean;
  addMoreActions: boolean;
  isReadOnly: boolean;
  rows: JSX.Element[];
  emptyStateText: string;
}

const MessageTable = ({
  isLoading = false,
  headers = [],
  addSelectColumn = false,
  addMoreActions = false,
  isReadOnly = true,
  rows = [],
  emptyStateText = "",
}: MessageTableProps): JSX.Element => {
  return (
    <>
      <table className={messageTableStyles.table}>
        <thead>
          <tr>
            {headers.map((header: string) => {
              const cssName = camelCase(header.replace(" ", "-").toLowerCase());
              return (
                <th key={cssName} className={messageTableStyles[cssName]}>
                  {header}
                </th>
              );
            })}
            {addSelectColumn && <th className={messageTableStyles.select}></th>}
            {addMoreActions && (
              <>
                <th className={messageTableStyles.actions}>Actions</th>
                {!isReadOnly && <th className="messageTableKebab"></th>}
              </>
            )}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table >
      {
        rows.length == 0 && (
          <div className={messageTableStyles.emptyContainer}>
            {isLoading ? (
              <div className={messageTableStyles.loadingContainer}>
                <Spinner role="status">
                  <span className="visually-hidden">Loading...</span>
                </Spinner>
              </div>
            ) : (
              <div className={messageTableStyles.emptyText}>{emptyStateText}</div>
            )}
          </div>
        )
      }
    </>
  );
};

export default MessageTable;
