import React from "react";
import { act, fireEvent, render, waitFor } from "@testing-library/react";
import { Alert } from "../../js/models/alert";
import alerts from "../alerts.test.json";
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
      const { getByRole, findByRole, getByTestId } = render(
        <AlertsPage alerts={alerts as Alert[]} isVisible={true} />
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
        <AlertsPage alerts={alerts as Alert[]} isVisible={true} />
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
