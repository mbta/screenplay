import React, { ComponentType, useEffect, useState } from "react";
import {
  ExistingScreens,
  fetchExistingScreensAtPlacesWithPendingScreens,
} from "../../utils/api";
import { Accordion } from "react-bootstrap";
import PendingScreensPlaceRowAccordion from "./PendingScreensPlaceRowAccordion";
import { ScreenConfiguration } from "../../models/screen_configuration";
import { useScreenplayContext } from "../../hooks/useScreenplayContext";

const PendingScreensPage: ComponentType = () => {
  const { places } = useScreenplayContext();
  const [existingScreens, setExistingScreens] = useState<ExistingScreens>({});

  useEffect(() => {
    // TODO: This gets ALL existing screens at any place that has at least one pending screen.
    // This fn specifically should be future-proof, but surrounding code that can only handle GL e-ink screens
    // might break if this starts returning data for other screen types.
    fetchExistingScreensAtPlacesWithPendingScreens().then(setExistingScreens);
  }, []);

  const getAppIdFromScreenConfig = (pendingScreens: {
    [screen_id: string]: ScreenConfiguration;
  }) => Object.entries(pendingScreens).map(([_, config]) => config.app_id)[0];

  return (
    <div className="pending-screens-page">
      <div className="page-content__header">Pending</div>
      <div className="page-content__body">
        <Accordion flush>
          {Object.entries(existingScreens).map(
            ([
              placeID,
              { live_screens: liveScreens, pending_screens: pendingScreens },
            ]) => {
              const appID = getAppIdFromScreenConfig(pendingScreens);
              const place = places.find((place) => place.id === placeID);
              return place ? (
                <div key={`${placeID}.${appID}`}>
                  <PendingScreensPlaceRowAccordion
                    place={place}
                    appID={appID}
                    screens={mergeLiveAndPendingByID(
                      liveScreens,
                      pendingScreens
                    )}
                  />
                </div>
              ) : null;
            }
          )}
        </Accordion>
      </div>
    </div>
  );
};

const mergeLiveAndPendingByID = (
  liveScreens: ExistingScreens[string]["live_screens"],
  pendingScreens: ExistingScreens[string]["pending_screens"]
) =>
  Object.entries(liveScreens ?? {})
    .map(([screenID, config]) => ({ isLive: true, screenID, config }))
    .concat(
      Object.entries(pendingScreens).map(([screenID, config]) => ({
        isLive: false,
        screenID,
        config,
      }))
    )
    .sort(({ screenID: id1 }, { screenID: id2 }) => {
      switch (true) {
        case id1 < id2:
          return -1;
        case id1 === id2:
          return 0;
        case id1 > id2:
        default:
          return 1;
      }
    });

export default PendingScreensPage;
