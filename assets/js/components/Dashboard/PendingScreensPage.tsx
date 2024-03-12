import React, { ComponentType, useEffect, useMemo, useState } from "react";
import {
  PendingAndLiveScreens,
  fetchExistingScreensAtPlacesWithPendingScreens,
} from "../../utils/api";
import { Accordion } from "react-bootstrap";
import PendingScreensPlaceRowAccordion from "./PendingScreensPlaceRowAccordion";
import { ScreenConfiguration } from "../../models/screen_configuration";
import { useScreenplayContext } from "../../hooks/useScreenplayContext";
import format from "date-fns/format";
import { Place } from "../../models/place";

const PendingScreensPage: ComponentType = () => {
  const { places } = useScreenplayContext();
  const [existingScreens, setExistingScreens] = useState<PendingAndLiveScreens>({});
  const [versionID, setVersionID] = useState<string | null>(null);
  const [lastModified, setLastModified] = useState<Date | null>(null);

  const placesByID: Record<string, Place> = useMemo(
    () => places.reduce((acc, place) => ({ ...acc, [place.id]: place }), {}),
    [places]
  );

  useEffect(() => {
    fetchExistingScreensAtPlacesWithPendingScreens()
      .then(({ places_and_screens, version_id, last_modified_ms }) => {
        setExistingScreens(places_and_screens);
        setVersionID(version_id);
        if (last_modified_ms !== null) {
          setLastModified(new Date(last_modified_ms));
        }
      });
  }, []);

  return (
    <div className="pending-screens-page">
      <div className="page-content__header">Pending</div>
      <div className="page-content__body" style={{ color: "white" }}>
        {lastModified && <div className="last-modified">Updated {format(lastModified, "MMMM d, y")}</div>}
        <Accordion flush alwaysOpen>
          {Object.entries(existingScreens).map(
            ([placeAndAppGroupID, { live_screens, pending_screens, place_id, app_id }]) => {
              const place = placesByID[place_id];
              return place ? (
                <PendingScreensPlaceRowAccordion
                  key={placeAndAppGroupID}
                  place={place}
                  appID={app_id}
                  screens={mergeLiveAndPendingByID(live_screens, pending_screens)}
                />
              ) : null;
            }
          )}
        </Accordion>
      </div>
    </div>
  );
};

const mergeLiveAndPendingByID = (
  liveScreens: PendingAndLiveScreens[string]["live_screens"],
  pendingScreens: PendingAndLiveScreens[string]["pending_screens"]
) =>
  [
    ...Object.entries(liveScreens ?? {}).map(addIsLive(true)),
    ...Object.entries(pendingScreens).map(addIsLive(false))
  ].sort(({ screenID: id1 }, { screenID: id2 }) => {
    if (id1 < id2) return -1;
    if (id1 === id2) return 0;
    return 1;
  });

const addIsLive = (isLive: boolean) => ([screenID, config]: [string, ScreenConfiguration]) => ({ isLive, screenID, config });

export default PendingScreensPage;
