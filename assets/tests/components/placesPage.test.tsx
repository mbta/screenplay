import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import placesAndScreens from "../places_and_screens.test.json";
import { Place } from "../../js/models/place";
import PlacesPage from "../../js/components/Dashboard/PlacesPage";

beforeAll(() => {
  const app = document.createElement("div");
  app.id = "app";
  app.dataset.username = "test";
  document.body.appendChild(app);
});

describe("Places Page", () => {
  describe("filtering", () => {
    test("filters places by screen type", async () => {
      const { getByRole, getByText, queryByText, findByRole } = render(
        <PlacesPage places={placesAndScreens as Place[]} isVisible={true} />
      );

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All SCREEN TYPES" }));
        fireEvent.click(await findByRole("button", { name: "DUP" }));
        await waitFor(() => {
          expect(getByText("Davis")).toBeInTheDocument();
          expect(queryByText("Alewife")).not.toBeInTheDocument();
          expect(queryByText("Columbus Ave @ Bray St")).not.toBeInTheDocument();
        });
      });

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All SCREEN TYPES" }));
        fireEvent.click(await findByRole("button", { name: "PA ESS" }));
        await waitFor(() => {
          expect(getByText("Davis")).toBeInTheDocument();
          expect(getByText("Alewife")).toBeInTheDocument();
          expect(queryByText("Columbus Ave @ Bray St")).not.toBeInTheDocument();
        });
      });

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All SCREEN TYPES" }));
        fireEvent.click(await findByRole("button", { name: "Bus Shelter" }));
        await waitFor(() => {
          expect(queryByText("Davis")).not.toBeInTheDocument();
          expect(queryByText("Alewife")).not.toBeInTheDocument();
          expect(getByText("Columbus Ave @ Bray St")).toBeInTheDocument();
        });
      });
    });

    test("filters places by mode and route", async () => {
      const { getByRole, getByText, queryByText, findByRole } = render(
        <PlacesPage places={placesAndScreens as Place[]} isVisible={true} />
      );

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Blue Line" }));
        await waitFor(() => {
          expect(getByText("Wonderland")).toBeInTheDocument();
          expect(queryByText("Alewife")).not.toBeInTheDocument();
          expect(queryByText("Columbus Ave @ Bray St")).not.toBeInTheDocument();
        });
      });

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Red Line" }));
        await waitFor(() => {
          expect(getByText("Alewife")).toBeInTheDocument();
          expect(queryByText("Wonderland")).not.toBeInTheDocument();
          expect(queryByText("Columbus Ave @ Bray St")).not.toBeInTheDocument();
        });
      });

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Bus" }));
        await waitFor(() => {
          expect(getByText("Columbus Ave @ Bray St")).toBeInTheDocument();
          expect(getByText("Alewife")).toBeInTheDocument();
          expect(getByText("Wonderland")).toBeInTheDocument();
        });
      });
    });
  });

  describe("sorting", () => {
    test("sort label changes depending on filter selected", async () => {
      const { getByTestId, getByRole, findByRole } = render(
        <PlacesPage places={placesAndScreens as Place[]} isVisible={true} />
      );

      await act(async () => {
        expect(getByTestId("sort-label").textContent?.trim()).toBe("ABC");
        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Blue Line" }));
        await waitFor(() => {
          expect(getByTestId("sort-label").textContent?.trim()).toBe(
            "WESTBOUND"
          );
        });

        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Red Line" }));
        await waitFor(() => {
          expect(getByTestId("sort-label").textContent?.trim()).toBe(
            "SOUTHBOUND"
          );
        });

        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Bus" }));
        await waitFor(() => {
          expect(getByTestId("sort-label").textContent?.trim()).toBe("ABC");
        });
      });
    });

    test("sort label changes when clicked", async () => {
      const { getByTestId, getByRole, findByRole } = render(
        <PlacesPage places={placesAndScreens as Place[]} isVisible={true} />
      );

      await act(async () => {
        expect(getByTestId("sort-label").textContent?.trim()).toBe("ABC");
        fireEvent.click(getByTestId("sort-label"));
        await waitFor(() => {
          expect(getByTestId("sort-label").textContent?.trim()).toBe("ZYX");
        });

        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Red Line" }));
        await waitFor(() => {
          // When a mode or line is selected, sort direction resets to 0.
          // If not, we would have expected the label to still be that
          // of the "reverse" direction for the Red Line: "NORTHBOUND"
          expect(getByTestId("sort-label").textContent?.trim()).toBe(
            "SOUTHBOUND"
          );
        });
        fireEvent.click(getByTestId("sort-label"));
        await waitFor(() => {
          expect(getByTestId("sort-label").textContent?.trim()).toBe(
            "NORTHBOUND"
          );
        });

        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Blue Line" }));
        fireEvent.click(getByTestId("sort-label"));
        await waitFor(() => {
          expect(getByTestId("sort-label").textContent?.trim()).toBe(
            "EASTBOUND"
          );
        });
      });
    });

    test("sort order changes for RL", async () => {
      const { getByTestId, getAllByTestId, findByRole, getByRole } = render(
        <PlacesPage places={placesAndScreens as Place[]} isVisible={true} />
      );

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Red Line" }));
        await waitFor(() => {
          expect(
            getAllByTestId("place-name").map(
              (placeName) => placeName.textContent
            )
          ).toStrictEqual(["Alewife", "Davis", "Porter", "Park Street"]);
        });

        fireEvent.click(getByTestId("sort-label"));
        await waitFor(() => {
          expect(
            getAllByTestId("place-name").map(
              (placeName) => placeName.textContent
            )
          ).toStrictEqual(["Park Street", "Porter", "Davis", "Alewife"]);
        });
      });
    });

    test("sort order changes for OL", async () => {
      const { getByTestId, getAllByTestId, findByRole, getByRole } = render(
        <PlacesPage places={placesAndScreens as Place[]} isVisible={true} />
      );

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Orange Line" }));
        await waitFor(() => {
          expect(
            getAllByTestId("place-name").map(
              (placeName) => placeName.textContent
            )
          ).toStrictEqual([
            "Oak Grove",
            "Malden Center",
            "Wellington",
            "North Station",
            "Haymarket",
          ]);
        });

        fireEvent.click(getByTestId("sort-label"));
        await waitFor(() => {
          expect(
            getAllByTestId("place-name").map(
              (placeName) => placeName.textContent
            )
          ).toStrictEqual([
            "Haymarket",
            "North Station",
            "Wellington",
            "Malden Center",
            "Oak Grove",
          ]);
        });
      });
    });

    test("sort order changes for GL", async () => {
      const { getByTestId, getAllByTestId, findByRole, getByRole } = render(
        <PlacesPage places={placesAndScreens as Place[]} isVisible={true} />
      );

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Green Line" }));
        await waitFor(() => {
          expect(
            getAllByTestId("place-name").map(
              (placeName) => placeName.textContent
            )
          ).toStrictEqual([
            "Union Square",
            "Lechmere",
            "Science Park/West End",
            "North Station",
            "Haymarket",
            "Government Center",
            "Park Street",
            "Boylston",
          ]);
        });

        fireEvent.click(getByTestId("sort-label"));
        await waitFor(() => {
          expect(
            getAllByTestId("place-name").map(
              (placeName) => placeName.textContent
            )
          ).toStrictEqual([
            "Boylston",
            "Park Street",
            "Government Center",
            "Haymarket",
            "North Station",
            "Science Park/West End",
            "Lechmere",
            "Union Square",
          ]);
        });
      });
    });

    test("sort order changes for BL", async () => {
      const { getByTestId, getAllByTestId, findByRole, getByRole } = render(
        <PlacesPage places={placesAndScreens as Place[]} isVisible={true} />
      );

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Blue Line" }));
        await waitFor(() => {
          expect(
            getAllByTestId("place-name").map(
              (placeName) => placeName.textContent
            )
          ).toStrictEqual([
            "Wonderland",
            "Revere Beach",
            "Beachmont",
            "Government Center",
          ]);
        });

        fireEvent.click(getByTestId("sort-label"));
        await waitFor(() => {
          expect(
            getAllByTestId("place-name").map(
              (placeName) => placeName.textContent
            )
          ).toStrictEqual([
            "Government Center",
            "Beachmont",
            "Revere Beach",
            "Wonderland",
          ]);
        });
      });
    });
  });
});
