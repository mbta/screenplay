import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import Dashboard from "../../js/components/Dashboard/Dashboard";
import { MemoryRouter } from "react-router-dom";
import placesAndScreens from "../places_and_screens.test.json";

beforeAll(() => {
  const app = document.createElement("div");
  app.id = "app";
  app.dataset.username = "test";
  document.body.appendChild(app);
});

describe("Dashboard", () => {
  let originalFetch: any;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () => Promise.resolve(placesAndScreens),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("filtering", () => {
    test("filters places by screen type", async () => {
      const { getByRole, getByText, queryByText, findByRole } = render(
        <Dashboard page="places" />,
        { wrapper: MemoryRouter }
      );

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All SCREEN TYPES" }));
        fireEvent.click(await findByRole("button", { name: "DUP" }));
        await waitFor(() => {
          expect(getByText("Davis")).toBeInTheDocument();
          expect(queryByText("ALEWIFE")).not.toBeInTheDocument();
          expect(queryByText("Columbus Ave @ Bray St")).not.toBeInTheDocument();
        });
      });

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All SCREEN TYPES" }));
        fireEvent.click(await findByRole("button", { name: "PA ESS" }));
        await waitFor(() => {
          expect(getByText("Davis")).toBeInTheDocument();
          expect(getByText("ALEWIFE")).toBeInTheDocument();
          expect(queryByText("Columbus Ave @ Bray St")).not.toBeInTheDocument();
        });
      });

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All SCREEN TYPES" }));
        fireEvent.click(await findByRole("button", { name: "Bus Shelter" }));
        await waitFor(() => {
          expect(queryByText("Davis")).not.toBeInTheDocument();
          expect(queryByText("ALEWIFE")).not.toBeInTheDocument();
          expect(getByText("Columbus Ave @ Bray St")).toBeInTheDocument();
        });
      });
    });

    test("filters places by mode and route", async () => {
      const { getByRole, getByText, queryByText, findByRole } = render(
        <Dashboard page="places" />,
        { wrapper: MemoryRouter }
      );

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Blue Line" }));
        await waitFor(() => {
          expect(getByText("WONDERLAND")).toBeInTheDocument();
          expect(queryByText("ALEWIFE")).not.toBeInTheDocument();
          expect(queryByText("Columbus Ave @ Bray St")).not.toBeInTheDocument();
        });
      });

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Red Line" }));
        await waitFor(() => {
          expect(getByText("ALEWIFE")).toBeInTheDocument();
          expect(queryByText("WONDERLAND")).not.toBeInTheDocument();
          expect(queryByText("Columbus Ave @ Bray St")).not.toBeInTheDocument();
        });
      });

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Bus" }));
        await waitFor(() => {
          expect(getByText("Columbus Ave @ Bray St")).toBeInTheDocument();
          expect(getByText("ALEWIFE")).toBeInTheDocument();
          expect(getByText("WONDERLAND")).toBeInTheDocument();
        });
      });
    });
  });

  describe("sorting", () => {
    test("sort label changes depending on filter selected", async () => {
      const { getByTestId, getByRole, findByRole } = render(
        <Dashboard page="places" />,
        { wrapper: MemoryRouter }
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
        <Dashboard page="places" />,
        { wrapper: MemoryRouter }
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
        <Dashboard page="places" />,
        { wrapper: MemoryRouter }
      );

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Red Line" }));
        await waitFor(() => {
          expect(
            getAllByTestId("place-name").map(
              (placeName) => placeName.textContent
            )
          ).toStrictEqual(["ALEWIFE", "Davis", "Porter", "Park Street"]);
        });

        fireEvent.click(getByTestId("sort-label"));
        await waitFor(() => {
          expect(
            getAllByTestId("place-name").map(
              (placeName) => placeName.textContent
            )
          ).toStrictEqual(["Park Street", "Porter", "Davis", "ALEWIFE"]);
        });
      });
    });

    test("sort order changes for OL", async () => {
      const { getByTestId, getAllByTestId, findByRole, getByRole } = render(
        <Dashboard page="places" />,
        { wrapper: MemoryRouter }
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
            "OAK GROVE",
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
            "OAK GROVE",
          ]);
        });
      });
    });

    test("sort order changes for GL", async () => {
      const { getByTestId, getAllByTestId, findByRole, getByRole } = render(
        <Dashboard page="places" />,
        { wrapper: MemoryRouter }
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
            "MEDFORD/TUFTS",
            "Ball Square",
            "Magoun Square",
            "Gilman Square",
            "East Somerville",
            "Union Square",
            "Lechmere",
            "Science Park/West End",
            "North Station",
            "Haymarket",
            "GOVERNMENT CENTER",
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
            "GOVERNMENT CENTER",
            "Haymarket",
            "North Station",
            "Science Park/West End",
            "Lechmere",
            "Union Square",
            "East Somerville",
            "Gilman Square",
            "Magoun Square",
            "Ball Square",
            "MEDFORD/TUFTS",
          ]);
        });
      });
    });

    test("sort order changes for BL", async () => {
      const { getByTestId, getAllByTestId, findByRole, getByRole } = render(
        <Dashboard page="places" />,
        { wrapper: MemoryRouter }
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
            "WONDERLAND",
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
            "WONDERLAND",
          ]);
        });
      });
    });
  });
});
