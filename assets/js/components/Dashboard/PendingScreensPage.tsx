import React, {
  ComponentType,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  PendingAndLiveScreens,
  fetchExistingScreensAtPlacesWithPendingScreens,
  publishScreensForPlace,
} from "../../utils/api";
import { Accordion } from "react-bootstrap";
import PendingScreensPlaceRowAccordion from "./PendingScreensPlaceRowAccordion";
import { ScreenConfiguration } from "../../models/screen_configuration";
import {
  useScreenplayContext,
  useScreenplayDispatchContext,
} from "../../hooks/useScreenplayContext";
import format from "date-fns/format";
import { Place } from "../../models/place";

const PendingScreensPage: ComponentType = () => {
  const { places } = useScreenplayContext();
  const [existingScreens, setExistingScreens] = useState<PendingAndLiveScreens>(
    {}
  );
  const [etag, setEtag] = useState<string | null>(null);
  const [lastModified, setLastModified] = useState<Date | null>(null);
  const [isPublishing, setIsPublishing] = useState<boolean>(false);

  const placesByID: Record<string, Place> = useMemo(
    () => places.reduce((acc, place) => ({ ...acc, [place.id]: place }), {}),
    [places]
  );

  const fetchData = useCallback(() => {
    fetchExistingScreensAtPlacesWithPendingScreens().then(
      ({ places_and_screens, etag, last_modified_ms }) => {
        setExistingScreens(places_and_screens);
        setEtag(etag);
        if (last_modified_ms !== null) {
          setLastModified(new Date(last_modified_ms));
        }
      }
    );
  }, [setExistingScreens, setEtag, setLastModified]);

  const dispatch = useScreenplayDispatchContext();

  const publish = useCallback(
    async (placeID, appID, hiddenFromScreenplayIDs) => {
      if (isPublishing) {
        // Prevent multiple publish requests from being fired if user accidentally double clicks the button.
        return;
      }

      setIsPublishing(true);
      try {
        // We know etag is not null at this point because it's not possible for a "Publish" button
        // to be rendered without the ETag also being set--both state values are set together in
        // `fetchData`.
        const { status, message } = await publishScreensForPlace(
          placeID,
          appID,
          hiddenFromScreenplayIDs,
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          etag!
        );

        const defaultErrorMessage = "Server error. Please contact an engineer.";
        switch (status) {
          case 200:
            dispatch({
              type: "SHOW_ACTION_OUTCOME",
              isSuccessful: true,
              message: "Screens published to places",
            });
            // Since the publish succeeded, let's update the page data immediately
            // so the new state is reflected.
            fetchData();
            break;
          case 412:
            dispatch({
              type: "SHOW_ACTION_OUTCOME",
              isSuccessful: false,
              message: "Page is out of date. Please reload and try again.",
            });
            break;
          case 500:
            dispatch({
              type: "SHOW_ACTION_OUTCOME",
              isSuccessful: false,
              message: message || defaultErrorMessage,
            });
            break;
          default:
            dispatch({
              type: "SHOW_ACTION_OUTCOME",
              isSuccessful: false,
              message: defaultErrorMessage,
            });
            console.error(`Bad publish response status: ${status}`);
        }
      } catch (e) {
        dispatch({
          type: "SHOW_ACTION_OUTCOME",
          isSuccessful: false,
          message: "Unknown error. Please contact an engineer.",
        });
        console.error(e);
      }

      setIsPublishing(false);
      setTimeout(() => {
        dispatch({ type: "HIDE_ACTION_OUTCOME" });
      }, 5000);
    },
    [etag, dispatch, fetchData, isPublishing]
  );

  useEffect(fetchData, []);

  const screens = Object.entries(existingScreens);
  let layout;

  if (screens.length) {
    layout = (
      <>
        {lastModified && (
          <div className="last-modified">
            Updated {format(lastModified, "MMMM d, y")}
          </div>
        )}
        <Accordion flush alwaysOpen>
          {Object.entries(existingScreens).map(
            ([
              placeAndAppGroupID,
              { live_screens, pending_screens, place_id, app_id },
            ]) => {
              const place = placesByID[place_id];
              return place ? (
                <PendingScreensPlaceRowAccordion
                  key={placeAndAppGroupID}
                  place={place}
                  appID={app_id}
                  placeID={place_id}
                  buttonsDisabled={isPublishing}
                  publishCallback={publish}
                  screens={mergeLiveAndPendingByID(
                    live_screens,
                    pending_screens
                  )}
                />
              ) : null;
            }
          )}
        </Accordion>
      </>
    );
  } else {
    layout = (
      <div className="no-screens-text h5">There are no pending screens.</div>
    );
  }

  return (
    <div className="pending-screens-page">
      <div className="page-content__header">Pending</div>
      <div className="page-content__body" style={{ color: "white" }}>
        {layout}
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
    ...Object.entries(pendingScreens).map(addIsLive(false)),
  ].sort(({ screenID: id1 }, { screenID: id2 }) => {
    if (id1 < id2) return -1;
    if (id1 === id2) return 0;
    return 1;
  });

const addIsLive =
  (isLive: boolean) =>
  ([screenID, config]: [string, ScreenConfiguration]) => ({
    isLive,
    screenID,
    config,
  });

export default PendingScreensPage;
