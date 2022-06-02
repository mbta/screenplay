import React from "react";
import { fireEvent, render } from "@testing-library/react";
import PlaceRow from "../../js/components/Dashboard/PlaceRow";
import { Accordion } from "react-bootstrap";

describe("PlaceRow", () => {
  test("opens when clicked", async () => {
    const { getByTestId } = render(
      <Accordion>
        <PlaceRow
          name="Place Name"
          modesAndLines={["CR", "RL"]}
          screenTypes={["DUP", "Solari"]}
          status="Auto"
          stopId="place-stop"
          eventKey="0"
        />
      </Accordion>
    );

    expect(getByTestId("place-row").className).toBe("place-row");
    fireEvent.click(getByTestId("place-row"));
    expect(getByTestId("place-row").className).toBe("place-row open");
    expect(getByTestId("place-screen-types").textContent).toBe("DUP · Solari");
    expect(getByTestId("place-status").textContent).toBe("Auto");
  });

  test("shows no screens", async () => {
    const { getByTestId } = render(
      <Accordion>
        <PlaceRow
          name="Place Name"
          modesAndLines={["CR", "RL"]}
          screenTypes={[]}
          status="Auto"
          stopId="place-stop"
          eventKey="0"
        />
      </Accordion>
    );

    expect(getByTestId("place-row").className).toBe("place-row disabled");
    fireEvent.click(getByTestId("place-row"));
    expect(getByTestId("place-row").className).not.toContain("open");
    expect(getByTestId("place-screen-types").textContent).toBe("no screens");
    expect(getByTestId("place-status").textContent).toBe("-");
  });
});
