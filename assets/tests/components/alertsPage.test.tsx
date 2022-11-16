import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import alerts from "../alerts.test.json";
import alertsOnScreens from "../alerts_on_screens.test.json";
import AlertsPage from "../../js/components/Dashboard/AlertsPage";
import {
  mockOutletContextData,
  RenderRouteWithOutletContext,
} from "../utils/RenderRouteWithOutletContext";

beforeAll(() => {
  const app = document.createElement("div");
  app.id = "app";
  app.dataset.username = "test";
  document.body.appendChild(app);
});

describe("Alerts Page", () => {
  let originalFetch: any;

  beforeEach(() => {
    originalFetch = global.fetch;
    global.fetch = jest.fn(() =>
      Promise.resolve({
        json: () =>
          Promise.resolve({ alerts, screens_by_alert: alertsOnScreens }),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("filtering", () => {
    test("filters places by mode and route", async () => {
      const { getByRole, findByRole, getByTestId, queryByTestId } = render(
        <RenderRouteWithOutletContext context={mockOutletContextData}>
          <AlertsPage />
        </RenderRouteWithOutletContext>
      );

      await act(async () => {
        await waitFor(() => {
          expect(queryByTestId("1")).toBeInTheDocument();
          // Verify alerts not present on a screen are not visible
          expect(queryByTestId("5")).not.toBeInTheDocument();
        });
      });

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Blue Line" }));
        await waitFor(() => {
          expect(getByTestId("3")).toBeInTheDocument();
        });
      });

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Red Line" }));
        await waitFor(() => {
          expect(getByTestId("10")).toBeInTheDocument();
          expect(getByTestId("2")).toBeInTheDocument();
        });
      });

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Bus" }));
        await waitFor(() => {
          expect(getByTestId("10")).toBeInTheDocument();
        });
      });

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All MODES" }));
        fireEvent.click(await findByRole("button", { name: "Commuter Rail" }));
        await waitFor(() => {
          expect(getByTestId("9")).toBeInTheDocument();
        });
      });
    });

    test("filters places by screen type", async () => {
      const { getByRole, findByRole, getByTestId, queryAllByTestId } = render(
        <RenderRouteWithOutletContext context={mockOutletContextData}>
          <AlertsPage />
        </RenderRouteWithOutletContext>
      );

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All SCREEN TYPES" }));
        fireEvent.click(await findByRole("button", { name: "Bus Shelter" }));
        await waitFor(() => {
          expect(getByTestId("4")).toBeInTheDocument();
          expect(getByTestId("6")).toBeInTheDocument();
        });
      });

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All SCREEN TYPES" }));
        fireEvent.click(await findByRole("button", { name: "Pre Fare Duo" }));
        await waitFor(() => {
          expect(getByTestId("2")).toBeInTheDocument();
        });
      });

      await act(async () => {
        fireEvent.click(getByRole("button", { name: "All SCREEN TYPES" }));
        fireEvent.click(await findByRole("button", { name: "PA ESS" }));
        await waitFor(() => {
          expect(queryAllByTestId("place-row")).toStrictEqual([]);
        });
      });
    });
  });

  describe("sorting", () => {
    test("sort label when clicked", async () => {
      const { getByTestId } = render(
        <RenderRouteWithOutletContext context={mockOutletContextData}>
          <AlertsPage />
        </RenderRouteWithOutletContext>
      );

      await act(async () => {
        expect(getByTestId("sort-label").textContent?.trim()).toBe("END");
        fireEvent.click(getByTestId("sort-label"));
        await waitFor(() => {
          expect(getByTestId("sort-label").textContent?.trim()).toBe("END");
        });
      });
    });
  });

  describe("Alert Places List", () => {
    test("navigating to / from the places list for an alert", async () => {
      const { getByTestId, getByText, queryByTestId, queryByText } = render(
        <RenderRouteWithOutletContext context={mockOutletContextData}>
          <AlertsPage />
        </RenderRouteWithOutletContext>
      );

      await act(async () => {
        await waitFor(() => {
          expect(queryByTestId("10")).toBeInTheDocument();
          fireEvent.click(getByTestId("10"));
          expect(getByText(/delay #10/i)).toBeInTheDocument();
          fireEvent.click(getByTestId("places-list-back-button"));
          expect(queryByText(/delay #10/i)).not.toBeInTheDocument();
        });
      });
    });
  });
});
