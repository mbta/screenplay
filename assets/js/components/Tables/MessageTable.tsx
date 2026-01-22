import { camelCase } from "lodash";
import React from "react";
import { Spinner } from "react-bootstrap";
import * as messageTableStyles from "Styles/message-table.module.scss";
import { ChevronDown, ChevronUp } from "react-bootstrap-icons";

interface MessageTableProps {
  isLoading?: boolean;
  headers: string[];
  addSelectColumn?: boolean;
  addMoreActions?: boolean;
  isReadOnly?: boolean;
  rows: JSX.Element[];
  emptyStateText?: string;
  handleHeaderClick?: (header: string) => void;
  sortColumn?: string;
  sortDirection?: SortDirection;
}
export enum SortDirection {
  Asc = 0,
  Desc = 1,
}

const MessageTable = ({
  isLoading = false,
  headers,
  addSelectColumn = false,
  addMoreActions = false,
  isReadOnly = true,
  rows,
  emptyStateText = "",
  handleHeaderClick = () => {},
  sortColumn = "",
  sortDirection = SortDirection.Asc,
}: MessageTableProps): JSX.Element => {
  return (
    <>
      <table className={messageTableStyles.table}>
        <thead>
          <tr>
            {headers.map((header) => {
              const cssName = camelCase(header.replace(" ", "-").toLowerCase());
              return (
                <th
                  key={cssName}
                  className={messageTableStyles[cssName]}
                  onClick={() => handleHeaderClick(header)}
                >
                  {header}
                  {header === sortColumn && (
                    <>
                      {sortDirection === SortDirection.Asc ? (
                        <ChevronDown style={{ marginLeft: 4 }} />
                      ) : (
                        <ChevronUp style={{ marginLeft: 4 }} />
                      )}
                    </>
                  )}
                </th>
              );
            })}
            {addSelectColumn && <th className={messageTableStyles.select}></th>}
            {addMoreActions && (
              <>
                <th className={messageTableStyles.actions}>Actions</th>
                {!isReadOnly && <th></th>}
              </>
            )}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
      {rows.length === 0 && (
        <div>
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
      )}
    </>
  );
};

export default MessageTable;
