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

type ScreenGroup = {
  screens: Screen[];
  isInline: boolean;
};

const groupScreens = (screens: Screen[]): ScreenGroup[] => {
  const inlineScreens = screens.filter((screen) =>
    ["busway_v2", "solari"].includes(screen.type),
  );
  const paEssScreens = screens.filter((screen) => screen.type === "pa_ess");
  const otherScreens = screens.filter(
    (screen) => !["busway_v2", "pa_ess", "solari"].includes(screen.type),
  );

  const groups = otherScreens.map((screen) => ({
    screens: [screen],
    isInline: false,
  }));

  if (inlineScreens.length > 0) {
    groups.push({ screens: inlineScreens, isInline: true });
  }

  if (paEssScreens.length > 0) {
    groupPaEssScreensbyRoute(paEssScreens).forEach((screens) =>
      groups.push({ screens: screens, isInline: false }),
    );
  }

  return groups;
};

const groupPaEssScreensbyRoute = (screens: Screen[]): Map<string, Screen[]> => {
  const paEssGroupedByRoute = new Map<string, Screen[]>();

  screens.map((screen) => {
    if (screen.station_code) {
      const routeLetter = screen.station_code.charAt(0);

      paEssGroupedByRoute.has(routeLetter)
        ? paEssGroupedByRoute.get(routeLetter)?.push(screen)
        : paEssGroupedByRoute.set(routeLetter, [screen]);
    }
  });

  return paEssGroupedByRoute;
};

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

  const screens = sortScreens(place.screens).filter((screen) => !screen.hidden);
  const hasScreens = screens.length > 0;

  // Always call the `useAccordionButton` hook, but conditionally use its click
  // handler. https://react.dev/learn#using-hooks
  const handleAccordionClick = useAccordionButton(place.id, () =>
    handleClickAccordion(place.id),
  );
  const rowOnClick = hasScreens ? handleAccordionClick : () => undefined;

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
              groupScreens(screens).map((group, index) => {
                return (
                  <ScreenDetail
                    key={`${place.id}.screendetail.${index}`}
                    screens={group.screens}
                    isInlineGroup={group.isInline}
                    eventKey={place.id}
                  />
                );
              })}
          </div>
        </Accordion.Collapse>
      </PlaceRow>
    </>
  );
};

export default PlaceRowAccordion;
