import React from "react";
import { render } from "@testing-library/react";
import AlertCard from "../../js/components/Dashboard/AlertCard";
import { Alert } from "../../js/models/alert";

describe("AlertCard", () => {
  test("formats effect string", async () => {
    const alert: Alert = {
      id: "123",
      effect: "STATION_CLOSURE",
      severity: "up to 15 minutes",
      header: "This is an alert.",
      informed_entities: [],
      active_period: [{ start: "2022-09-16T10:00:00Z", end: "" }],
      created_at: "2022-09-16T09:00:00Z",
      updated_at: "2022-09-16T09:00:00Z",
      affected_list: ["red"],
    };

    const { getByText } = render(<AlertCard alert={alert} />);

    expect(getByText("Station Closure")).toBeInTheDocument();
  });

  test("displays severity on delays", async () => {
    const alert: Alert = {
      id: "123",
      effect: "DELAY",
      severity: "up to 15 minutes",
      header: "This is an alert.",
      informed_entities: [],
      active_period: [{ start: "2022-09-16T10:00:00Z", end: "" }],
      created_at: "2022-09-16T09:00:00Z",
      updated_at: "2022-09-16T09:00:00Z",
      affected_list: ["red"],
    };

    const { getByText } = render(<AlertCard alert={alert} />);

    expect(getByText("Delay—up to 15 minutes")).toBeInTheDocument();
  });

  test("displays active period with end date", async () => {
    const alert: Alert = {
      id: "123",
      effect: "DELAY",
      severity: "up to 15 minutes",
      header: "This is an alert.",
      informed_entities: [],
      active_period: [
        {
          start: "2022-09-16T09:00:00Z",
          end: "2022-09-16T10:00:00Z",
        },
      ],
      created_at: "2022-09-16T09:00:00Z",
      updated_at: "2022-09-16T10:00:00Z",
      affected_list: ["red"],
    };

    const { getByText } = render(<AlertCard alert={alert} />);

    expect(getByText("9/16/2022 · 5:00 AM")).toBeInTheDocument();
    expect(getByText("9/16/2022 · 6:00 AM")).toBeInTheDocument();
  });

  test("displays active period with no end date", async () => {
    const alert: Alert = {
      id: "123",
      effect: "DELAY",
      severity: "up to 15 minutes",
      header: "This is an alert.",
      informed_entities: [],
      active_period: [
        {
          start: "2022-09-16T09:00:00Z",
          end: "",
        },
      ],
      created_at: "2022-09-16T09:00:00Z",
      updated_at: "2022-09-16T10:00:00Z",
      affected_list: ["red"],
    };

    const { getByText } = render(<AlertCard alert={alert} />);

    expect(getByText("9/16/2022 · 5:00 AM")).toBeInTheDocument();
    expect(getByText("Until further notice")).toBeInTheDocument();
  });
});
