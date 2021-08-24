import React from 'react';

const cannedMessages = [
  "Attention: An emergency situation has been reported. Please leave station through nearest exit.",
  "Attention: An emergency situation has been reported outside the station. Please remain in station until advised otherwise by MBTA or Emergency Personnel.",
  "Attention: An emergency situation has been reported. Please follow instructions of MBTA or Emergency Personnel.",
  "Attention: Emergency situation has ended. It is safe to exit station.",
  "This is a test of emergency messaging system. This is NOT an emergency. This is a test."
]

interface CreateMessageProps {}

interface CreateMessageState {
  messageOption: string;
  cannedMessage: string;
  customMessage: string;
}

class CreateMessage extends React.Component<CreateMessageProps, CreateMessageState> {
  constructor(props: CreateMessageProps) {
    super(props);
    this.state = {
      messageOption: "1",
      cannedMessage: "",
      customMessage: "",
    }

    this.changeMessageOption = this.changeMessageOption.bind(this);
    this.changeCannedMessage = this.changeCannedMessage.bind(this);
    this.changeCustomMessage = this.changeCustomMessage.bind(this);
  }

  changeMessageOption(event: any) {
    this.setState({messageOption: event.target.value});
  }

  changeCannedMessage(event: any) {
    const index = parseInt(event.target.value);
    this.setState({messageOption: "1", cannedMessage: event.target.value, customMessage: cannedMessages[index]})
  }

  changeCustomMessage(event: any) {
    this.setState({messageOption: "2", cannedMessage: "", customMessage: event.target.value})
  }

  render() {
    return (
      <>
        <div className="step-instructions">
          <div className="step-header weight-700">Message</div>
          <div>This is the text that riders will see.</div>
          <div>It should be a short description of the issue, and recommended rider action.</div>
        </div>
        <div className="step-body">
          <div className="info">
            <div>Message text</div>
            <div className="text-14">(512 character max)</div>
          </div>
          <div>
            <div className={`radio-option option-one ${this.state.messageOption === "1" ? "active" : ""}`}>
              <input type="radio" value="1" checked={this.state.messageOption === "1"} onChange={this.changeMessageOption} />
              <select className="message-select text-16" value={this.state.cannedMessage} onChange={this.changeCannedMessage}>
                <option value={ -1 } hidden>Select canned message…</option>
                { cannedMessages.map((message, index) => (
                  <option key={ index } value={ index }>{ message }</option>
                ))}
              </select>
            </div>
            <div className={`radio-option option-two ${this.state.messageOption === "2" ? "active" : ""}`}>
              <input type="radio" value="2" checked={this.state.messageOption === "2"} onChange={this.changeMessageOption} />
              <textarea className="message-textarea text-16" value={this.state.customMessage} placeholder="Type, or select a canned message above to edit here..." onChange={this.changeCustomMessage}></textarea>
            </div>
          </div>
        </div>
      </>
    )
  }
  
};

export default CreateMessage;