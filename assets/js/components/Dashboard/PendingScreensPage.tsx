import React, { ComponentType, useEffect, useMemo, useState } from "react";
import { ExistingScreens, fetchExistingScreensAtPlacesWithPendingScreens } from "../../utils/api";
import { Accordion, Col, Container, Row } from "react-bootstrap";
import PendingScreensPlaceRowAccordion from "./PendingScreensPlaceRowAccordion";

const PendingScreensPage: ComponentType = () => {
  const [existingScreens, setExistingScreens] = useState<ExistingScreens>({});

  useEffect(() => {
    // TODO: This gets ALL existing screens at any place that has at least one pending screen.
    // This fn specifically should be future-proof, but surrounding code that can only handle GL e-ink screens
    // might break if this starts returning data for other screen types.
    fetchExistingScreensAtPlacesWithPendingScreens().then(setExistingScreens);
  }, []);

  return (
    <div>
      <div className="page-content__header">Pending</div>
      {Object.entries(existingScreens).map(([placeID, { live_screens: liveScreens, pending_screens: pendingScreens }]) => (
        <PendingScreensPlaceRowAccordion
          placeID={placeID}
          screens={mergeLiveAndPendingByID(liveScreens, pendingScreens)}
          key={placeID}
        />
      ))}
    </div>
  );
};

const mergeLiveAndPendingByID = (
  liveScreens: ExistingScreens[string]["live_screens"],
  pendingScreens: ExistingScreens[string]["pending_screens"]
) =>
  Object.entries(liveScreens ?? {}).map(([screenID, config]) => ({ isLive: true, screenID, config }))
    .concat(Object.entries(pendingScreens).map(([screenID, config]) => ({ isLive: false, screenID, config })))
    .sort(({ screenID: id1 }, { screenID: id2 }) => {
      switch (true) {
        case id1 < id2: return -1;
        case id1 === id2: return 0;
        case id1 > id2:
        default: return 1;
      }
    });

export default PendingScreensPage;
