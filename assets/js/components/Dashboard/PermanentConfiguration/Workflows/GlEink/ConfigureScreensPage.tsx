import React, { ComponentType, useEffect, useState } from "react";
import { Place } from "../../../../../models/place";
import { fetchExistingScreens } from "../../../../../utils/api";
import { ScreenConfiguration } from "../../../../../models/screen_configuration";

interface ExistingScreens {
  [place_id: string]: {
    live_screens: ScreenConfiguration[];
    pending_screens: ScreenConfiguration[];
  };
}

interface ConfigureScreensPageProps {
  selectedPlaces: Place[];
}

const ConfigureScreensPage: ComponentType<ConfigureScreensPageProps> = ({
  selectedPlaces,
}: ConfigureScreensPageProps) => {
  const [selectedPlacesAndScreens, setSelectedPlacesAndScreens] =
    useState<ExistingScreens>({});

  //   const filteredPlaces = places.filter((place) => selectedPlaces.has(place.id));

  useEffect(() => {
    fetchExistingScreens(
      "gl_eink_v2",
      selectedPlaces.map((place) => place.id),
      (placesAndScreens) => {
        setSelectedPlacesAndScreens(placesAndScreens);
      }
    );
  }, []);

  return (
    <>
      {selectedPlaces.map((place) => {
        const existingScreens = selectedPlacesAndScreens[place.id];
        return (
          <ConfigurePlaceCard
            key={place.id}
            place={place}
            existingScreens={existingScreens}
          />
        );
      })}
    </>
  );
};

interface ConfigurePlaceCardProps {
  place: Place;
  existingScreens: {
    live_screens: ScreenConfiguration[];
    pending_screens: ScreenConfiguration[];
  } | null;
}

const ConfigurePlaceCard: ComponentType<ConfigurePlaceCardProps> = ({
  place,
  existingScreens,
}: ConfigurePlaceCardProps) => {
  let existingLiveScreens: ScreenConfiguration[] = [];
  let existingPendingScreens: ScreenConfiguration[] = [];
  if (existingScreens) {
    existingLiveScreens = existingScreens.live_screens;
    existingPendingScreens = existingScreens.pending_screens;
  }
  return (
    <div>
      <div>{place.id}</div>
      {existingScreens && (
        <>
          {existingLiveScreens.map((screen) => {
            return <div key={screen.id}>{screen.id}</div>;
          })}
          {existingPendingScreens.map((screen) => {
            return <div key={screen.id}>{screen.id}</div>;
          })}
        </>
      )}
    </div>
  );
};

export { ExistingScreens };

export default ConfigureScreensPage;
