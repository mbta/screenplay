import React from "react";
import ConfirmationPage from "./ConfirmationPage";
import CreateMessage from "./CreateMessage";
import PickStations from "./PickStations";
import SetSchedule from "./SetSchedule";
import WizardNavFooter from "./WizardNavFooter";
import WizardStepper from "./WizardStepper";
import { AlertData } from "../App";

import stationsByLine, { Station } from "../../constants/stations";
import cannedMessages from "../../constants/messages";

import { XIcon } from "@heroicons/react/solid";
import WizardSidebar from "./WizardSidebar";
import { svgLongSide, svgShortSide } from "../../constants/misc";

import parseISO from "date-fns/parseISO";
import differenceInHours from "date-fns/differenceInHours";

const modalContent = (
  <div className="cancel-modal">
    <div className="cancel-body">
      <div className="cancel-icon"></div>
      <div className="cancel-text">
        <div>Header</div>
        <div>Description</div>
      </div>
    </div>
    <div className="cancel-footer">
      <button>Never mind</button>
      <button>Confirm cancelation</button>
    </div>
  </div>
);

interface AlertWizardProps {
  alertData: AlertData | null;
  triggerConfirmation: (modalContent: JSX.Element) => void;
  toggleAlertWizard: () => void;
}

interface AlertWizardState {
  step: number;
  cancelModal: boolean;
  selectedStations: Station[];
  messageOption: string;
  cannedMessage: string;
  customMessage: string;
  duration: string | number;
  landscapePNG: string | null;
  portraitPNG: string | null;
  id: string | null;
}

class AlertWizard extends React.Component<AlertWizardProps, AlertWizardState> {
  constructor(props: AlertWizardProps) {
    super(props);

    if (props.alertData === null) {
      this.state = {
        // id is present if and only if editing an existing alert
        id: null,
        // Page state
        step: 1,
        cancelModal: false,
        // User input state
        selectedStations: [],
        messageOption: "1",
        cannedMessage: "",
        customMessage: "",
        duration: 1,
        landscapePNG: null,
        portraitPNG: null,
      };
    } else {
      this.state = this.initializeState(props.alertData);
    }

    this.stepForward = this.stepForward.bind(this);
    this.stepBackward = this.stepBackward.bind(this);
    this.goToStep = this.goToStep.bind(this);
    this.waitingForInput = this.waitingForInput.bind(this);

    this.checkStation = this.checkStation.bind(this);
    this.checkLine = this.checkLine.bind(this);
    this.changeMessageOption = this.changeMessageOption.bind(this);
    this.changeCannedMessage = this.changeCannedMessage.bind(this);
    this.changeCustomMessage = this.changeCustomMessage.bind(this);
    this.changeDuration = this.changeDuration.bind(this);
  }

  initializeState(alertData: AlertData) {
    const { id, message, stations, schedule } = alertData;

    let messageOption, cannedMessage, customMessage;

    if (message.type === "canned") {
      messageOption = "1";
      cannedMessage = message.id.toString();
      customMessage = cannedMessages[message.id];
    } else {
      messageOption = "2";
      cannedMessage = "";
      customMessage = message.text;
    }

    const allStations = ["blue", "green", "orange", "red", "silver"].flatMap(
      (line) => stationsByLine[line]
    );

    const matchStation = (station: string) => {
      const result = allStations.find(({ name }) => name === station);
      if (result === undefined) {
        throw new TypeError(
          `Station ${station} not present in list of all stations!`
        );
      }
      return result;
    };

    const selectedStations = stations.map(matchStation);

    const { start: startString, end: endString } = schedule;
    const start = parseISO(startString);
    const end = parseISO(endString);
    const duration = differenceInHours(end, start);

    return {
      // id is present if and only if editing an existing alert
      id: id,
      // Page state
      step: 1,
      cancelModal: false,
      // User input state
      selectedStations: selectedStations,
      messageOption: messageOption,
      cannedMessage: cannedMessage,
      customMessage: customMessage,
      duration: duration,
      landscapePNG: null,
      portraitPNG: null,
    };
  }

  renderSwitch() {
    switch (this.state.step) {
      case 2:
        return (
          <PickStations
            selectedStations={this.state.selectedStations}
            checkStation={this.checkStation}
            checkLine={this.checkLine}
          />
        );
      case 3:
        return (
          <SetSchedule
            duration={this.state.duration}
            changeDuration={this.changeDuration}
          />
        );
      case 4:
        return (
          <ConfirmationPage
            goToStep={this.goToStep}
            selectedStations={this.state.selectedStations}
            message={
              this.state.messageOption == "1"
                ? cannedMessages[parseInt(this.state.cannedMessage)]
                : this.state.customMessage
            }
            duration={this.state.duration}
          />
        );
      default:
        return (
          <CreateMessage
            messageOption={this.state.messageOption}
            cannedMessage={this.state.cannedMessage}
            customMessage={this.state.customMessage}
            changeMessageOption={this.changeMessageOption}
            changeCannedMessage={this.changeCannedMessage}
            changeCustomMessage={this.changeCustomMessage}
          />
        );
    }
  }

  waitingForInput() {
    switch (this.state.step) {
      case 1:
        return !this.state.cannedMessage && !this.state.customMessage;
      case 2:
        return this.state.selectedStations.length === 0;
      // Because 1 hour is automatically selected
      case 3:
        return false;
      // TODO
      case 4:
        return false;
      default:
        return false;
    }
  }

  stepForward() {
    if (this.state.step === 4) {
      this.handleSubmit();
    } else {
      // Temporary hack: to avoid race conditions, convert the SVG to a PNG upon station selection,
      // which must always happen after message selection.
      if (this.state.step === 2) {
        this.makePNG("portrait", svgShortSide, svgLongSide, (url) =>
          this.setState({ portraitPNG: url })
        );
        this.makePNG("landscape", svgLongSide, svgShortSide, (url) =>
          this.setState({ landscapePNG: url })
        );
      }

      this.setState((state) => ({
        step: state.step + 1,
      }));
    }
  }

  stepBackward() {
    this.setState((state) => ({
      step: state.step - 1,
    }));
  }

  goToStep(step: number) {
    this.setState({ step });
  }

  handleSubmit() {
    const endpoint = this.state.id === null ? "/api/create" : "/api/edit";

    const csrfMetaElement = document.head.querySelector(
      "[name~=csrf-token][content]"
    ) as HTMLMetaElement;
    const csrfToken = csrfMetaElement.content;

    let message;
    if (this.state.messageOption === "1") {
      message = { type: "canned", id: parseInt(this.state.cannedMessage) };
    } else {
      message = { type: "custom", text: this.state.customMessage };
    }

    const stations = this.state.selectedStations.map(({ name }) => name);
    const duration = this.state.duration;
    const landscapePNG = this.state.landscapePNG;
    const portraitPNG = this.state.portraitPNG;

    const data = {
      message,
      stations,
      duration,
      portrait_png: portraitPNG,
      landscape_png: landscapePNG,
      id: this.state.id,
    };

    fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-csrf-token": csrfToken,
      },
      credentials: "include",
      body: JSON.stringify(data),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(response.statusText);
        }

        return response.json();
      })
      .then(({ success }) => {
        if (success) {
          this.props.toggleAlertWizard();
        } else {
          // Should this be a toast or other user-visible message?
          console.log("Error when creating alert with data: ", data);
        }
      })
      .catch((error) => {
        // Should this be a toast or other user-visible message?
        console.log("Failed to create alert: ", error);
      });
  }

  addStation(station: Station) {
    this.setState((state) => ({
      selectedStations: state.selectedStations.concat(station),
    }));
  }
  removeStation(station: Station) {
    this.setState((state) => ({
      selectedStations: state.selectedStations.filter((x) => x !== station),
    }));
  }

  checkStation(station: Station) {
    if (this.state.selectedStations.some((x) => x.name === station.name)) {
      this.removeStation(station);
    } else {
      this.addStation(station);
    }
  }

  checkLine(line: string, checked: boolean) {
    if (checked) {
      stationsByLine[line].forEach((station) => {
        if (!this.state.selectedStations.some((x) => x.name === station.name)) {
          this.addStation(station);
        }
      });
    } else {
      stationsByLine[line].forEach((station) => this.removeStation(station));
    }
  }

  changeMessageOption(event: any) {
    this.setState({ messageOption: event.target.value });
  }

  changeCannedMessage(event: any) {
    const index = parseInt(event.target.value);
    this.setState({
      messageOption: "1",
      cannedMessage: event.target.value,
      customMessage: cannedMessages[index],
    });
  }

  changeCustomMessage(event: any) {
    this.setState({
      messageOption: "2",
      cannedMessage: "",
      customMessage: event.target.value,
    });
  }

  changeDuration(event: any) {
    if (event.target.value === "Open ended") {
      this.setState({ duration: event.target.value });
    } else {
      this.setState({ duration: parseInt(event.target.value) });
    }
  }

  makePNG(
    orientation: string,
    width: number,
    height: number,
    callback: (dataUrl: string) => void
  ) {
    const svg = document.getElementById(orientation + "-svg") as HTMLElement;

    const canvas = document.createElement("canvas");
    canvas.width = width; //* svgScale
    canvas.height = height; //* svgScale
    canvas.style.width = width.toString();
    canvas.style.height = height.toString();

    const ctx = canvas.getContext("2d") as CanvasRenderingContext2D;
    //ctx.scale(svgScale, svgScale);

    const data = new XMLSerializer().serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      ctx.drawImage(img, 0, 0);
      const imgURI = canvas.toDataURL("image/png");
      callback(imgURI);
    };

    img.src =
      "data:image/svg+xml;base64," + btoa(unescape(encodeURIComponent(data)));
  }

  render() {
    return (
      <>
        <div className="wizard-container">
          <div className="wizard-left-content">
            <div className="wizard-header">
              <button
                className="wizard-cancel"
                onClick={() => this.props.triggerConfirmation(modalContent)}
              >
                <XIcon className="x" />
                <span className="text-16 weight-500">Cancel</span>
              </button>
              <div className="wizard-title text-30 weight-800">
                Create new Takeover Alert
              </div>
            </div>
            <WizardStepper />
            <div className="wizard-body">{this.renderSwitch()}</div>
          </div>
          <WizardSidebar
            selectedStations={this.state.selectedStations}
            step={this.state.step}
            message={
              this.state.messageOption == "1"
                ? cannedMessages[parseInt(this.state.cannedMessage)]
                : this.state.customMessage
            }
          />
        </div>
        <WizardNavFooter
          step={this.state.step}
          forward={this.stepForward}
          backward={this.stepBackward}
          waitingForInput={this.waitingForInput()}
        />
      </>
    );
  }
}

export default AlertWizard;
