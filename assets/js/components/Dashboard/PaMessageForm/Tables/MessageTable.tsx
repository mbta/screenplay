import React from "react";

interface MessageTableProps {
  headers: string[];
  addSelectColumn: boolean;
  addMoreActionsColumn: boolean;
  isReadOnly: boolean;
  rows: JSX.Element[];
}

const MessageTable = ({
  headers,
  addSelectColumn,
  addMoreActionsColumn,
  isReadOnly = true,
  rows,
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
            {addMoreActionsColumn && (
              <>
                <th className="pa-message-table__actions">Actions</th>
                {!isReadOnly && <th className="pa-message-table__kebab"></th>}
              </>
            )}
          </tr>
        </thead>
        <tbody>{rows}</tbody>
      </table>
    </>
  );
};

export default MessageTable;
