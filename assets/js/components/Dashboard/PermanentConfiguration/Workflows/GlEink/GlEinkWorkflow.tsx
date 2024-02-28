import React, {
  ComponentType,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";
import ConfigureScreensWorkflowPage, {
  PlaceIdsAndNewScreens,
} from "./ConfigureScreensPage";
import BottomActionBar from "../../BottomActionBar";
import { useLocation, useNavigate } from "react-router-dom";
import StationSelectPage from "./StationSelectPage";
import { Place } from "../../../../../models/place";
import { putPendingScreens } from "../../../../../utils/api";
import { useScreenplayContext } from "../../../../../hooks/useScreenplayContext";

const GlEinkWorkflow: ComponentType = () => {
  const { places } = useScreenplayContext();
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedPlaces, setSelectedPlaces] = useState<Set<string>>(new Set());
  const [configVersion, setConfigVersion] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [configStep, setConfigStep] = useState<number>(0);

  const [placesAndScreensToUpdate, setPlacesAndScreensToUpdate] =
    useState<PlaceIdsAndNewScreens>({});

  const getPlacesList = () => {
    return places.filter((place) =>
      place.routes.some((route) => route.startsWith("Green"))
    );
  };

  useLayoutEffect(() => {
    if (location.state) {
      setConfigStep(1);
      setSelectedPlaces(new Set([location.state.place_id]));
      setIsEditing(true);
      window.history.replaceState({}, "");
    }
  }, [location]);

  const handleRemoveLocation = (place: Place) => {
    const newSelectedPlaces = new Set(selectedPlaces);
    newSelectedPlaces.delete(place.id);
    setSelectedPlaces(newSelectedPlaces);
    setPlacesAndScreensToUpdate((placesAndScreens) => {
      const { [place.id]: _discarded, ...newPlacesAndScreens } =
        placesAndScreens;
      return newPlacesAndScreens;
    });
  };

  let backButtonLabel;
  let forwardButtonLabel;
  let cancelButtonLabel;
  let onBack;
  let onForward;
  let onCancel;
  let layout;
  const forwardButtonDisabled = selectedPlaces.size === 0;
  switch (configStep) {
    case 0:
      cancelButtonLabel = "Cancel";
      forwardButtonLabel = "Next";
      onCancel = () => {
        navigate(-1);
      };
      onForward = () => {
        setConfigStep(configStep + 1);
      };
      layout = (
        <StationSelectPage
          places={getPlacesList()}
          selectedPlaces={selectedPlaces}
          setSelectedPlaces={setSelectedPlaces}
        />
      );
      break;
    case 1:
      backButtonLabel = "Back";
      forwardButtonLabel = "Review Screens";
      cancelButtonLabel = "Cancel";
      onCancel = () => {
        navigate(-1);
      };
      onBack = () => {
        setConfigStep(configStep - 1);
      };
      onForward = () => {
        putPendingScreens(
          placesAndScreensToUpdate,
          "gl_eink_v2",
          configVersion
        ).then(() => navigate("/pending"));
      };
      layout = (
        <ConfigureScreensWorkflowPage
          selectedPlaces={places.filter((place) =>
            selectedPlaces.has(place.id)
          )}
          setPlacesAndScreensToUpdate={setPlacesAndScreensToUpdate}
          handleRemoveLocation={handleRemoveLocation}
          setConfigVersion={setConfigVersion}
          isEditing={isEditing}
        />
      );
      break;
  }

  return (
    <>
      {layout}
      <div className="bottom-action-bar">
        <BottomActionBar
          backButtonLabel={isEditing ? null : backButtonLabel}
          forwardButtonLabel={forwardButtonLabel}
          cancelButtonLabel={cancelButtonLabel}
          onCancel={onCancel}
          onBack={onBack}
          onForward={onForward}
          forwardButtonDisabled={forwardButtonDisabled}
        />
      </div>
    </>
  );
};

export default GlEinkWorkflow;
