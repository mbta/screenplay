import React from "react";
import PastAlertDetails from "./PastAlertDetails";
import {
  ArrowNarrowLeftIcon,
  ArrowNarrowRightIcon,
} from "@heroicons/react/solid";
import { AlertData } from "../../OutfrontTakeoverTool/OutfrontTakeoverTool";

interface PastAlertsListProps {
  pastAlertsData: AlertData[];
}
interface PastAlertsListState {
  currentPage: number;
}

const pageLength = 20;

export class PastAlertsList extends React.Component<
  PastAlertsListProps,
  PastAlertsListState
> {
  private pastAlertsHeaderRef: React.RefObject<HTMLInputElement>;
  constructor(props: PastAlertsListProps) {
    super(props);
    this.state = {
      currentPage: 1,
    };
    this.pastAlertsHeaderRef = React.createRef();
  }

  goToPage = (page: number): void => {
    this.setState({
      currentPage: page,
    });
    if (this.pastAlertsHeaderRef.current)
      this.pastAlertsHeaderRef.current.scrollIntoView();
  };
  nextPage = (): void => {
    this.setState((prevState) => ({
      currentPage: prevState.currentPage + 1,
    }));
    if (this.pastAlertsHeaderRef.current)
      this.pastAlertsHeaderRef.current.scrollIntoView();
  };
  backPage = (): void => {
    this.setState((prevState) => ({
      currentPage: prevState.currentPage - 1,
    }));
    if (this.pastAlertsHeaderRef.current)
      this.pastAlertsHeaderRef.current.scrollIntoView();
  };
  sort = (alerts: AlertData[]): AlertData[] =>
    alerts.sort(
      (a, b) =>
        new Date(b.cleared_at).valueOf() - new Date(a.cleared_at).valueOf(),
    );

  render() {
    const { pastAlertsData } = this.props;
    const { currentPage } = this.state;

    const totalPages = Math.ceil(pastAlertsData.length / pageLength);
    const firstIndex = (currentPage - 1) * pageLength;

    return (
      <>
        <div
          className="text-30 alerts-list-header"
          ref={this.pastAlertsHeaderRef}
        >
          <span>Past Takeover Alerts</span>
        </div>

        {this.sort(pastAlertsData)
          .slice(firstIndex, firstIndex + pageLength)
          .map((data: AlertData) => {
            const { id } = data;
            return <PastAlertDetails data={data} key={id} />;
          })}

        {totalPages > 1 && (
          <div className="pager">
            <div
              className={
                currentPage > 1 ? "page-stepper" : "page-stepper hidden"
              }
              onClick={this.backPage}
            >
              <ArrowNarrowLeftIcon className="button-icon" />
              <span>Previous</span>
            </div>
            <div className="pages">
              {[...Array(totalPages)].map((e, i) => {
                if (i + 1 === currentPage)
                  return (
                    <div className="page-number current" key={i + 1}>
                      {i + 1}
                    </div>
                  );
                else
                  return (
                    <div
                      className="page-number"
                      key={i + 1}
                      onClick={() => this.goToPage(i + 1)}
                    >
                      {i + 1}
                    </div>
                  );
              })}
            </div>
            <div
              className={
                currentPage < totalPages
                  ? "page-stepper next"
                  : "page-stepper next hidden"
              }
              onClick={this.nextPage}
            >
              <span>Next</span>
              <ArrowNarrowRightIcon className="button-icon right" />
            </div>
          </div>
        )}
      </>
    );
  }
}
