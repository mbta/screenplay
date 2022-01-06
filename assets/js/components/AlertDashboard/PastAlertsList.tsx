import React, { useRef } from "react";
import PastAlertDetails from "./PastAlertDetails";
import { ArrowNarrowLeftIcon, ArrowNarrowRightIcon } from "@heroicons/react/solid";

interface PastAlertsListProps {
  pastAlertsData: any;
}
interface PastAlertsListState {
  currentPage: number;
}

// Change this to 20 after testing
const pageLength = 4;


export class PastAlertsList extends React.Component<PastAlertsListProps, PastAlertsListState> {
  private pastAlertsHeaderRef: React.RefObject<HTMLInputElement>;
  constructor(props: PastAlertsListProps) {
    super(props);
    this.state = {
      currentPage: 1
    }
    this.pastAlertsHeaderRef = React.createRef();
  }
  
  goToPage = (page: number) => {
    this.setState({
      currentPage: page
    });
    this.pastAlertsHeaderRef.current.scrollIntoView();
  }
  nextPage = () => {
    this.setState(prevState => ({
      currentPage: prevState.currentPage + 1
    }));
    this.pastAlertsHeaderRef.current.scrollIntoView();
  }
  backPage = () => {
    this.setState(prevState => ({
      currentPage: prevState.currentPage - 1
    }));
    this.pastAlertsHeaderRef.current.scrollIntoView();
  }

  render() {
    const { pastAlertsData } = this.props
    const { currentPage } = this.state

    const totalPages = Math.ceil(pastAlertsData.length / pageLength)
    const firstIndex = (currentPage - 1) * pageLength

    return (
      <>
        <div className="text-30 alerts-list-header" ref={this.pastAlertsHeaderRef}>
          <span>Past Takeover Alerts</span>
        </div>

        {pastAlertsData.slice(firstIndex, firstIndex + 3).map((data: any) => {
          const { id } = data;
          return (
            <PastAlertDetails
              data={data}
              key={id}
            />
          );
        })}

        {totalPages > 1 &&
          <div className="pager">
            <div className={currentPage > 1 ? "page-stepper" : "page-stepper hidden"} onClick={this.backPage}>
              <ArrowNarrowLeftIcon className="button-icon" />
              <span>Previous</span>
            </div>
            <div className="pages">
              {[...Array(totalPages)].map((e, i) => {
                if(i + 1 === currentPage) return <div className="page-number current" key={i + 1}>{i + 1}</div>
                else return <div className="page-number" key={i + 1} onClick={() => this.goToPage(i + 1)}>{i + 1}</div>
              })}
            </div>
            <div className={currentPage < totalPages ? "page-stepper next" : "page-stepper next hidden"} onClick={this.nextPage}>
              <span>Next</span>
              <ArrowNarrowRightIcon className="button-icon right" />
            </div>
          </div>
        }
      </>
    )
  }
}

