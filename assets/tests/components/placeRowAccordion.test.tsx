import React from "react";
import { fireEvent, render } from "@testing-library/react";
import PlaceRowAccordion from "Components/PlaceRowAccordion";
import { Accordion } from "react-bootstrap";
import { Place } from "Models/place";
import { ScreenplayProvider } from "Hooks/useScreenplayContext";

beforeAll(() => {
  const app = document.createElement("div");
  app.id = "app";
  document.body.appendChild(app);
});

describe("PlaceRowAccordion", () => {
  test("opens when clicked", async () => {
    const place: Place = {
      id: "place-stop1",
      name: "Place Name1",
      routes: ["CR", "Red", "Green-B"],
      status: "Auto",
      screens: [
        { id: "1111", type: "dup_v2", disabled: false },
        { id: "2222", type: "busway_v2", disabled: false },
        { id: "3333", type: "bus_shelter_v2", disabled: false },
      ],
    };

    const dispatch = jest.fn();

    const { getByTestId } = render(
      <ScreenplayProvider>
        <Accordion>
          <PlaceRowAccordion
            place={place}
            dispatch={dispatch}
            activeEventKeys={[]}
            sortDirection={0}
          />
        </Accordion>
      </ScreenplayProvider>,
    );

    expect(getByTestId("place-row").className).toBe("place-row");
    fireEvent.click(getByTestId("place-row-header"));
    expect(getByTestId("place-row").className).toBe("place-row open");
  });
});
