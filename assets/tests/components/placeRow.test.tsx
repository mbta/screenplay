import React from "react";
import { fireEvent, render } from "@testing-library/react";
import PlaceRow from "../../js/components/Dashboard/PlaceRow";
import { Accordion } from "react-bootstrap";
import { Place } from "../../js/models/place";

describe("PlaceRow", () => {
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

    const { getByTestId, getByAltText, queryByAltText } = render(
      <Accordion>
        <PlaceRow place={place} eventKey="0" defaultSort />
      </Accordion>
    );

    expect(getByTestId("place-row").className).toBe("place-row");
    fireEvent.click(getByTestId("place-row"));
    expect(getByTestId("place-row").className).toBe("place-row open");
    expect(getByTestId("place-screen-types").textContent).toBe(
      "DUP · Bus Shelter · Solari"
    );
    expect(getByTestId("place-status").textContent).toBe("Auto");
    expect(getByAltText("Green-B")).toBeInTheDocument();
    expect(queryByAltText("Green")).toBeNull();
  });

  test("shows no screens", async () => {
    const place: Place = {
      id: "place-stop1",
      name: "Place Name1",
      routes: ["CR", "Red", "Green-B", "Green-C"],
      status: "Auto",
      screens: [],
    };

    const { getByTestId, getByAltText, queryByAltText } = render(
      <Accordion>
        <PlaceRow place={place} eventKey="0" defaultSort />
      </Accordion>
    );

    expect(getByTestId("place-row").className).toBe("place-row disabled");
    fireEvent.click(getByTestId("place-row"));
    expect(getByTestId("place-row").className).not.toContain("open");
    expect(getByTestId("place-screen-types").textContent).toBe("no screens");
    expect(getByTestId("place-status").textContent).toBe("—");
    expect(getByAltText("Green")).toBeInTheDocument();
    expect(queryByAltText("Green-B")).toBeNull();
    expect(queryByAltText("Green-C")).toBeNull();
  });
});
