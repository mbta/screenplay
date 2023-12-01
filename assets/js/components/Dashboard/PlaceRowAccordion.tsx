import React, { ComponentType, useContext } from "react";
import PlaceRow from "./PlaceRow";
import { Place } from "../../models/place";
import { Screen } from "../../models/screen";
import {
  DirectionID,
  PlacesListReducerAction,
} from "../../hooks/useScreenplayContext";
import {
  Accordion,
  AccordionContext,
  useAccordionButton,
} from "react-bootstrap";
import ScreenDetail from "./ScreenDetail";
import { sortScreens } from "../../util";
import { useUpdateAnimation } from "../../hooks/useUpdateAnimation";
import classNames from "classnames";

interface PlaceRowAccordionProps {
  place: Place;
  canShowAnimation?: boolean;
  dispatch: React.Dispatch<PlacesListReducerAction>;
  activeEventKeys: string[];
  sortDirection: DirectionID;
  filteredLine?: string | null;
  className?: string;
}

const PlaceRowAccordion: ComponentType<PlaceRowAccordionProps> = ({
  place,
  canShowAnimation,
  dispatch,
  filteredLine,
  sortDirection,
  activeEventKeys,
  className = "",
}: PlaceRowAccordionProps) => {
  const handleClickAccordion = (eventKey: string) => {
    if (activeEventKeys?.includes(eventKey)) {
      dispatch({
        type: "SET_ACTIVE_EVENT_KEYS",
        eventKeys: activeEventKeys.filter((e: string) => e !== eventKey),
      });
    } else {
      dispatch({
        type: "SET_ACTIVE_EVENT_KEYS",
        eventKeys: [...activeEventKeys, eventKey],
      });
    }
  };

  const filterAndGroupScreens = (screens: Screen[]) => {
    const visibleScreens = screens.filter((screen) => !screen.hidden);
    const solariScreens = visibleScreens.filter(
      (screen) => screen.type === "solari"
    );
    const paEssScreens = visibleScreens.filter(
      (screen) => screen.type === "pa_ess"
    );
    const groupedScreens = visibleScreens
      .filter((screen) => screen.type !== "solari" && screen.type !== "pa_ess")
      .map((screen) => [screen]);

    groupedScreens.push(solariScreens);

    if (paEssScreens.length > 0) {
      groupPaEssScreensbyRoute(paEssScreens, groupedScreens);
    }

    return groupedScreens;
  };

  const groupPaEssScreensbyRoute = (
    paEssScreens: Screen[],
    groupedScreens: Screen[][]
  ) => {
    const paEssGroupedByRoute = new Map<string, Screen[]>();
    paEssScreens.map((paEssScreen) => {
      if (paEssScreen.station_code) {
        const routeLetter = paEssScreen.station_code.charAt(0);

        paEssGroupedByRoute.has(routeLetter)
          ? paEssGroupedByRoute.get(routeLetter)?.push(paEssScreen)
          : paEssGroupedByRoute.set(routeLetter, [paEssScreen]);
      }
    });
    paEssGroupedByRoute.forEach((screens) => {
      groupedScreens.push(screens);
    });
  };

  const hasScreens =
    place.screens.length > 0 &&
    place.screens.filter((screen) => !screen.hidden).length > 0;
  const rowOnClick = hasScreens
    ? useAccordionButton(place.id, () => handleClickAccordion(place.id))
    : undefined;
  const { activeEventKey } = useContext(AccordionContext);
  const isOpen = activeEventKey?.includes(place.id);
  const { showAnimation } = useUpdateAnimation([], null, canShowAnimation);

  return (
    <>
      <PlaceRow
        place={place}
        eventKey={place.id}
        onClick={rowOnClick}
        className={isOpen ? classNames(className, "open") : className}
        filteredLine={filteredLine}
        defaultSort={sortDirection === 0}
        showAnimation={showAnimation}
        disabled={!hasScreens}
        variant="accordion"
      >
        <Accordion.Collapse eventKey={place.id}>
          <div className="place-row__screen-preview-container">
            {hasScreens &&
              filterAndGroupScreens(sortScreens(place.screens)).map(
                (screens, index) => {
                  return (
                    <ScreenDetail
                      key={`${place.id}.screendetail.${index}`}
                      screens={screens}
                      eventKey={place.id}
                    />
                  );
                }
              )}
          </div>
        </Accordion.Collapse>
      </PlaceRow>
    </>
  );
};

export default PlaceRowAccordion;
