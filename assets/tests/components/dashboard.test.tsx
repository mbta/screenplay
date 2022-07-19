import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import Dashboard from "../../js/components/Dashboard/Dashboard";
import { MemoryRouter } from "react-router-dom";

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
        json: () =>
          Promise.resolve([
            {
              id: "place-aport",
              name: "Airport",
              routes: ["Bus", "Silver", "Blue"],
              screens: [
                {
                  disabled: false,
                  id: "DUP-Airport",
                  type: "dup",
                },
                {
                  id: "airport_eastbound",
                  station_code: "BAIR",
                  type: "pa_ess",
                  zone: "e",
                },
                {
                  id: "airport_westbound",
                  station_code: "BAIR",
                  type: "pa_ess",
                  zone: "w",
                },
              ],
            },
            {
              id: "place-alfcl",
              name: "Alewife",
              routes: ["Bus", "Red"],
              screens: [
                {
                  id: "alewife_center_southbound",
                  station_code: "RALE",
                  type: "pa_ess",
                  zone: "c",
                },
                {
                  id: "alewife_mezzanine_southbound",
                  station_code: "RALE",
                  type: "pa_ess",
                  zone: "m",
                },
              ],
            },
            {
              id: "1215",
              name: "Columbus Ave @ Bray St",
              routes: ["Bus"],
              screens: [
                {
                  disabled: false,
                  id: "1401",
                  type: "bus_shelter_v2",
                },
              ],
            },
          ]),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("Filters", () => {
    test("filters places by screen type", async () => {
      const { getByRole, getByText, queryByText, findByRole } = render(
        <Dashboard page="places" />,
        { wrapper: MemoryRouter }
      );

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All SCREEN TYPES" }));
        fireEvent.click(await findByRole("button", { name: "DUP" }));
        await waitFor(() => {
          expect(getByText("Airport")).toBeInTheDocument();
          expect(queryByText("Alewife")).not.toBeInTheDocument();
          expect(queryByText("Columbus Ave @ Bray St")).not.toBeInTheDocument();
        });
      });

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All SCREEN TYPES" }));
        fireEvent.click(await findByRole("button", { name: "PA/ESS" }));
        await waitFor(() => {
          expect(getByText("Airport")).toBeInTheDocument();
          expect(getByText("Alewife")).toBeInTheDocument();
          expect(queryByText("Columbus Ave @ Bray St")).not.toBeInTheDocument();
        });
      });

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All SCREEN TYPES" }));
        fireEvent.click(await findByRole("button", { name: "Bus Shelter" }));
        await waitFor(() => {
          expect(queryByText("Airport")).not.toBeInTheDocument();
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
          expect(getByText("Airport")).toBeInTheDocument();
          expect(queryByText("Alewife")).not.toBeInTheDocument();
          expect(queryByText("Columbus Ave @ Bray St")).not.toBeInTheDocument();
        });
      });

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Red Line" }));
        await waitFor(() => {
          expect(getByText("Alewife")).toBeInTheDocument();
          expect(queryByText("Airport")).not.toBeInTheDocument();
          expect(queryByText("Columbus Ave @ Bray St")).not.toBeInTheDocument();
        });
      });

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Bus" }));
        await waitFor(() => {
          expect(getByText("Columbus Ave @ Bray St")).toBeInTheDocument();
          expect(getByText("Alewife")).toBeInTheDocument();
          expect(getByText("Airport")).toBeInTheDocument();
        });
      });
    });
  });
});
