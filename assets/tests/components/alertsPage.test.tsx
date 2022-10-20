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
  describe("filtering", () => {
    test("filters places by mode and route", async () => {
      const { getByRole, findByRole, getByTestId, queryByTestId } = render(
        <AlertsPage
          places={placesAndScreens as Place[]}
          alerts={alerts as Alert[]}
          screensByAlertId={alertsOnScreens as ScreensByAlert}
          isVisible={true}
        />
      );

      // First, verify expired alerts are not visible
      // It's possible this filtering will get done in Christian's branch; check
      // expect(queryByTestId("9")).not.toBeInTheDocument();

      // Verify alerts not present on a screen are not visible
      expect(queryByTestId("5")).not.toBeInTheDocument();

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
        <AlertsPage
          places={placesAndScreens as Place[]}
          alerts={alerts as Alert[]}
          screensByAlertId={alertsOnScreens as ScreensByAlert}
          isVisible={true}
        />
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
        <AlertsPage
          places={placesAndScreens as Place[]}
          screensByAlertId={alertsOnScreens as ScreensByAlert}
          alerts={alerts as Alert[]}
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

  describe("Alert Places List", () => {
    test("navigating to / from the places list for an alert", async () => {
      const { getByText, getByTestId, queryByText } = render(
        <AlertsPage
          places={placesAndScreens as Place[]}
          screensByAlertId={alertsOnScreens as ScreensByAlert}
          alerts={alerts as Alert[]}
          isVisible={true}
        />
      );

      await act(async () => {
        fireEvent.click(getByTestId("10"));
        await waitFor(() => {
          expect(getByText(/service change/i)).toBeInTheDocument();
        });
        fireEvent.click(getByTestId("places-list-back-button"));
        await waitFor(() => {
          expect(queryByText(/service change/i)).not.toBeInTheDocument();
        });
      });
    });
  });
});
