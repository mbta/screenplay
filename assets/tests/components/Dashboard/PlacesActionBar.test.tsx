import React from "react";
import { act, fireEvent, render } from "@testing-library/react";
import PlacesActionBar from "../../../js/components/Dashboard/PlacesActionBar";
import { Place } from "../../../js/models/place";

describe("PlacesActionBar", () => {
  const place1: Place = {
    id: "place-stop1",
    name: "Place Name1",
    routes: ["cr", "red", "green_b"],
    status: "Auto",
    screens: [
      { id: "1111", type: "dup", disabled: false },
      { id: "2222", type: "solari", disabled: false },
      { id: "3333", type: "bus_shelter_v2", disabled: false },
    ],
  };

  const place2: Place = {
    id: "place-stop2",
    name: "Place Name2",
    routes: ["green_b"],
    status: "Auto",
    screens: [
      { id: "4444", type: "gl_eink_double", disabled: false },
      // screen is shared with place-stop1
      { id: "2222", type: "solari", disabled: false },
      { id: "5555", type: "paess", disabled: false },
    ],
  };

  // a screenless place
  const place3: Place = {
    id: "place-stop3",
    name: "Place Name3",
    routes: ["green_d"],
    status: "Auto",
    screens: [],
  };

  const placesWithSharedScreen = [place1, place2];
  const placesWithScreenlessPlace = [place1, place3];

  test("Renders, shows place and screen counts, shows appropriate buttons", async () => {
    const handleClickResetFilters = jest.fn();
    const handleClickToggleScreenlessPlaces = jest.fn();
    expect(handleClickResetFilters).not.toBeCalled();
    expect(handleClickToggleScreenlessPlaces).not.toBeCalled();

    const { getByTestId, queryByTestId } = render(
      <PlacesActionBar
        places={placesWithSharedScreen}
        hasScreenlessPlaces={false}
        showScreenlessPlaces
        onClickResetFilters={handleClickResetFilters}
        onClickToggleScreenlessPlaces={handleClickToggleScreenlessPlaces}
      />
    );

    expect(getByTestId("places-action-bar")).toBeInTheDocument();
    expect(
      queryByTestId("places-action-bar-screenless-places-button")
    ).not.toBeInTheDocument();
    expect(
      getByTestId("places-action-bar-reset-filters-button")
    ).toBeInTheDocument();
    expect(
      getByTestId("places-action-bar-stats-place-count")
    ).toHaveTextContent("2");
    expect(
      getByTestId("places-action-bar-stats-screen-count")
    ).toHaveTextContent("5");
  });

  test("Renders 'Screenless places' toggle button when list contains one or more screenless places", async () => {
    const handleClickResetFilters = jest.fn();
    const handleClickToggleScreenlessPlaces = jest.fn();
    expect(handleClickResetFilters).not.toBeCalled();
    expect(handleClickToggleScreenlessPlaces).not.toBeCalled();

    const { getByTestId } = render(
      <PlacesActionBar
        places={placesWithScreenlessPlace}
        hasScreenlessPlaces={true}
        showScreenlessPlaces
        onClickResetFilters={handleClickResetFilters}
        onClickToggleScreenlessPlaces={handleClickToggleScreenlessPlaces}
      />
    );

    expect(getByTestId("places-action-bar")).toBeInTheDocument();
    expect(
      getByTestId("places-action-bar-screenless-places-button")
    ).toBeInTheDocument();
    expect(
      getByTestId("places-action-bar-reset-filters-button")
    ).toBeInTheDocument();
    expect(
      getByTestId("places-action-bar-stats-place-count")
    ).toHaveTextContent("2");
    expect(
      getByTestId("places-action-bar-stats-screen-count")
    ).toHaveTextContent("3");
  });

  test("Calls event handlers when appropriate", async () => {
    const handleClickResetFilters = jest.fn();
    const handleClickToggleScreenlessPlaces = jest.fn();

    const { getByTestId } = render(
      <PlacesActionBar
        places={placesWithScreenlessPlace}
        hasScreenlessPlaces={true}
        showScreenlessPlaces
        onClickResetFilters={handleClickResetFilters}
        onClickToggleScreenlessPlaces={handleClickToggleScreenlessPlaces}
      />
    );

    await act(async () => {
      fireEvent.click(getByTestId("places-action-bar-reset-filters-button"));
    });

    expect(handleClickResetFilters).toHaveBeenCalledTimes(1);
    expect(handleClickToggleScreenlessPlaces).not.toHaveBeenCalled();

    await act(async () => {
      fireEvent.click(
        getByTestId("places-action-bar-screenless-places-button")
      );
    });

    expect(handleClickResetFilters).toHaveBeenCalledTimes(1);
    expect(handleClickToggleScreenlessPlaces).toHaveBeenCalledTimes(1);
  });
});
