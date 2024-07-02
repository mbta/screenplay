import React from "react";
import { render, waitFor } from "@testing-library/react";
import ReportAProblemButton from "Components/ReportAProblemButton";

describe("ReportAProblemButton", () => {
  test("uses correct URL for users that are not emergency admins", async () => {
    const { getByTestId } = render(
      <ReportAProblemButton url={"https://mbta.slack.com/channels/screens"} />,
    );

    await waitFor(() =>
      expect(getByTestId("report-a-problem")).toHaveAttribute(
        "href",
        "https://mbta.slack.com/channels/screens",
      ),
    );
  });

  test("uses correct URL for emergency admins", async () => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "is-emergency-admin");
    document.head.appendChild(meta);

    const { getByTestId } = render(
      <ReportAProblemButton
        url={"https://mbta.slack.com/channels/screens-team-pios"}
      />,
    );

    await waitFor(() =>
      expect(getByTestId("report-a-problem")).toHaveAttribute(
        "href",
        "https://mbta.slack.com/channels/screens-team-pios",
      ),
    );
  });
});
