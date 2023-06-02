import React from "react";
import { render, waitFor } from "@testing-library/react";
import ReportAProblemButton from "../../js/components/Dashboard/ReportAProblemButton";

describe("ReportAProblemButton", () => {
  test("uses correct URL for non-admin users", async () => {
    const { getByTestId } = render(
      <ReportAProblemButton url={"https://mbta.slack.com/channels/screens"} />
    );

    await waitFor(() =>
      expect(getByTestId("report-a-problem")).toHaveAttribute(
        "href",
        "https://mbta.slack.com/channels/screens"
      )
    );
  });

  test("uses correct URL for admins", async () => {
    const meta = document.createElement("meta");
    meta.setAttribute("name", "is-admin");
    document.head.appendChild(meta);

    const { getByTestId } = render(
      <ReportAProblemButton
        url={"https://mbta.slack.com/channels/screens-team-pios"}
      />
    );

    await waitFor(() =>
      expect(getByTestId("report-a-problem")).toHaveAttribute(
        "href",
        "https://mbta.slack.com/channels/screens-team-pios"
      )
    );
  });
});
