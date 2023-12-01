import React from "react";
import { fireEvent, render } from "@testing-library/react";
import PlaceRowAccordion from "../../js/components/Dashboard/PlaceRowAccordion";
import { Accordion } from "react-bootstrap";
import { Place } from "../../js/models/place";
import { ScreenplayProvider } from "../../js/hooks/useScreenplayContext";

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
        { id: "1111", type: "dup", disabled: false },
        { id: "2222", type: "solari", disabled: false },
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
      </ScreenplayProvider>
    );

    expect(getByTestId("place-row").className).toBe("place-row");
    fireEvent.click(getByTestId("place-row-header"));
    expect(getByTestId("place-row").className).toBe("place-row open");
  });
});
