import React, { ComponentType, useContext } from "react";
import PlaceRow from "Components/PlaceRow";
import { Place } from "Models/place";
import { Screen } from "Models/screen";
import { DirectionID, usePlacesListState } from "Hooks/useScreenplayContext";
import {
  Accordion,
  AccordionContext,
  useAccordionButton,
} from "react-bootstrap";
import ScreenDetail from "Components/ScreenDetail";
import { sortScreens } from "../../util";
import { useUpdateAnimation } from "Hooks/useUpdateAnimation";
import classNames from "classnames";
import fp from "lodash/fp";

type ScreenGroup = {
  screens: Screen[];
  isInline: boolean;
};

const groupScreens = (screens: Screen[]): ScreenGroup[] => {
  const inlineScreenTypes = ["busway_v2", "elevator_v2"];

  const inlineScreens = screens.filter((screen) =>
    inlineScreenTypes.includes(screen.type),
  );
  const paEssScreens = screens.filter((screen) => screen.type === "pa_ess");
  const otherScreens = screens.filter(
    (screen) => ![...inlineScreenTypes, "pa_ess"].includes(screen.type),
  );

  const groups = otherScreens.map((screen) => ({
    screens: [screen],
    isInline: false,
  }));

  if (inlineScreens.length > 0) {
    const groupedInlineScreens: Screen[][] = fp.flow(
      fp.groupBy((screen: Screen) => screen.type),
      fp.map((screens) => screens),
    )(inlineScreens);

    groupedInlineScreens.forEach((screens) =>
      groups.push({ screens: screens, isInline: true }),
    );
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

      return paEssGroupedByRoute.has(routeLetter)
        ? paEssGroupedByRoute.get(routeLetter)?.push(screen)
        : paEssGroupedByRoute.set(routeLetter, [screen]);
    }
  });

  return paEssGroupedByRoute;
};

interface PlaceRowAccordionProps {
  place: Place;
  canShowAnimation?: boolean;
  activeEventKeys: string[];
  sortDirection: DirectionID;
  filteredLine?: string | null;
  className?: string;
}

const PlaceRowAccordion: ComponentType<PlaceRowAccordionProps> = ({
  place,
  canShowAnimation,
  filteredLine,
  sortDirection,
  activeEventKeys,
  className = "",
}: PlaceRowAccordionProps) => {
  const { setActiveEventKeys } = usePlacesListState();
  const handleClickAccordion = (eventKey: string) => {
    if (activeEventKeys?.includes(eventKey)) {
      setActiveEventKeys(activeEventKeys.filter((e: string) => e !== eventKey));
    } else {
      setActiveEventKeys([...activeEventKeys, eventKey]);
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
