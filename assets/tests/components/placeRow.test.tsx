import React from "react";
import { fireEvent, render } from "@testing-library/react";
import PlaceRow from "Components/PlaceRow";
import { Accordion } from "react-bootstrap";
import { Place } from "Models/place";

beforeAll(() => {
  const app = document.createElement("div");
  app.id = "app";
  document.body.appendChild(app);
});

describe("PlaceRow", () => {
  test("shows no screens", async () => {
    const place: Place = {
      id: "place-stop1",
      name: "Place Name1",
      routes: ["CR", "Red", "Green-B", "Green-C"],
      status: "Auto",
      screens: [],
    };

    const handleClick = jest.fn();

    const { getByTestId, getByAltText, queryByAltText } = render(
      <Accordion>
        <PlaceRow
          place={place}
          eventKey="0"
          onClick={handleClick}
          defaultSort
          disabled
          variant="accordion"
        />
      </Accordion>,
    );

    expect(getByTestId("place-row").className).toBe("place-row disabled");
    fireEvent.click(getByTestId("place-row"));
    expect(getByTestId("place-row").className).not.toContain("open");
    expect(getByTestId("place-row").className).not.toContain("filtered");
    expect(getByTestId("place-screen-types").textContent).toBe("no screens");
    expect(getByTestId("place-status").textContent).toBe("—");
    expect(getByAltText("Green")).toBeInTheDocument();
    expect(queryByAltText("Green-B")).toBeNull();
    expect(queryByAltText("Green-C")).toBeNull();
  });
});
