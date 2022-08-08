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
          expect(queryByText("Alewife")).not.toBeInTheDocument();
          expect(queryByText("Columbus Ave @ Bray St")).not.toBeInTheDocument();
        });
      });

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All SCREEN TYPES" }));
        fireEvent.click(await findByRole("button", { name: "PA/ESS" }));
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
        <Dashboard page="places" />,
        { wrapper: MemoryRouter }
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
        // sortDirection is maintained, so we expect the filtered list to
        // still be sorted in "reverse" order initially
        await waitFor(() => {
          expect(getByTestId("sort-label").textContent?.trim()).toBe(
            "NORTHBOUND"
          );
        });
        fireEvent.click(getByTestId("sort-label"));
        // now, we've switched it back to "forward" order: sortDirection = 0
        await waitFor(() => {
          expect(getByTestId("sort-label").textContent?.trim()).toBe(
            "SOUTHBOUND"
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
