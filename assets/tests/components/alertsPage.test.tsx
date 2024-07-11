import React from "react";
import { act, fireEvent, waitFor } from "@testing-library/react";
import AlertsPage from "Components/AlertsPage";
import { renderWithScreenplayProvider } from "../utils/renderWithScreenplayProvider";

describe("Alerts Page", () => {
  describe("filtering", () => {
    test("filters places by mode and route", async () => {
      const { getByRole, findByRole, getByTestId, queryByTestId } =
        renderWithScreenplayProvider(<AlertsPage />);

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
      const { getByRole, findByRole, getByTestId, queryAllByTestId } =
        renderWithScreenplayProvider(<AlertsPage />);

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
});
