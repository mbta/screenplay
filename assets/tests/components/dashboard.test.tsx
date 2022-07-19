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
          expect(getByTestId("sort-label").textContent?.trim()).toBe("ZXY");
        });

        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Red Line" }));
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
  });
});
