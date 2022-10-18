import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Alert } from "../../js/models/alert";
import { Place } from "../../js/models/place";
import { ScreensByAlert } from "../../js/models/screensByAlert";
import alerts from "../alerts.test.json";
import placesAndScreens from "../places_and_screens.test.json";
import alertsOnScreens from "../alerts_on_screens.test.json";
import AlertsPage from "../../js/components/Dashboard/AlertsPage";

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
        json: () => Promise.resolve(alerts),
      })
    ) as jest.Mock;
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe("filtering", () => {
    test("filters places by mode and route", async () => {
      const { getByRole, findByRole, getByTestId } = render(
        <AlertsPage
          places={placesAndScreens as Place[]}
          screensByAlertId={alertsOnScreens as ScreensByAlert}
          isVisible={true}
        />
      );

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
    });
  });

  describe("sorting", () => {
    test("sort label when clicked", async () => {
      const { getByTestId } = render(
        <AlertsPage
          places={placesAndScreens as Place[]}
          screensByAlertId={alertsOnScreens as ScreensByAlert}
          isVisible={true}
        />
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
});
