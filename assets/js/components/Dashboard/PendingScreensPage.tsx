import React, { ComponentType } from "react";
import { publishScreensForPlace } from "../../utils/api";

const PendingScreensPage: ComponentType = () => {
  return (
    <div>
      <div className="page-content__header">Pending</div>
      <button
        onClick={() =>
          publishScreensForPlace("place-hsmnl").then((statusText) =>
            alert(statusText)
          )
        }
      >
        Publish
      </button>
    </div>
  );
};

export default PendingScreensPage;
