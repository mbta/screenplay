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
      routes: ["CR", "Red"],
      status: "Auto",
      screens: [
        { id: "1111", type: "dup", disabled: false },
        { id: "2222", type: "solari", disabled: false },
        { id: "2222", type: "bus_shelter_v2", disabled: false },
      ],
    };

    const { getByTestId } = render(
      <Accordion>
        <PlaceRow place={place} eventKey="0" />
      </Accordion>
    );

    expect(getByTestId("place-row").className).toBe("place-row");
    fireEvent.click(getByTestId("place-row"));
    expect(getByTestId("place-row").className).toBe("place-row open");
    expect(getByTestId("place-screen-types").textContent).toBe(
      "DUP · Solari · Bus Shelter"
    );
    expect(getByTestId("place-status").textContent).toBe("Auto");
  });

  test("shows no screens", async () => {
    const place: Place = {
      id: "place-stop1",
      name: "Place Name1",
      routes: ["CR", "Red"],
      status: "Auto",
      screens: [],
    };

    const { getByTestId } = render(
      <Accordion>
        <PlaceRow place={place} eventKey="0" />
      </Accordion>
    );

    expect(getByTestId("place-row").className).toBe("place-row disabled");
    fireEvent.click(getByTestId("place-row"));
    expect(getByTestId("place-row").className).not.toContain("open");
    expect(getByTestId("place-screen-types").textContent).toBe("no screens");
    expect(getByTestId("place-status").textContent).toBe("—");
  });
});
