import React from 'react';

const scale = 1;
const previewLongSide = 300;
const previewShortSide = 183;

interface SimpleFormProps {}
interface SimpleFormState {
  message: string;
  stations: string;
}

class SimpleForm extends React.Component<SimpleFormProps, SimpleFormState> {
  constructor(props: SimpleFormProps) {
    super(props);
    this.state = {
      message: '',
      stations: ''
    };

    this.handleMessageChange = this.handleMessageChange.bind(this);
    this.handleStationChange = this.handleStationChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleMessageChange(event: any) {
    this.setState({message: event.target.value});
  }
  handleStationChange(event: any) {
    this.setState({stations: event.target.value});
  }

  handleSubmit(event: any) {
    this.generatePNG();
    // PNG gets uploaded
    // 
    // Alert gets created in S3
    this.postAlert()
    event.preventDefault();
  }

  postAlert(): Promise<void> {  
    const stations = ["Copley", "Boylston"];
    const duration = 4;

    return (
      fetch(`/create?message=${this.state.message}&stations=${stations}&duration=${duration}`)
        .then(response => {
          if (!response.ok) throw new Error(response.statusText);
        })
        // @ts-ignore
        .catch((error) => console.log('Failed to create alert: ', error) /* dispatch({ type: "CREATE_ERROR" }) */)
    );
  }

  generatePNG() {
    // Currently hardcoded to only create the landscape PNG
    const svg = document.getElementById('landscape-svg') as HTMLElement;
    const svgSize = svg.getBoundingClientRect();

    const canvas = document.createElement('canvas')
    canvas.width = svgSize.width * scale;
    canvas.height = svgSize.height * scale;
    canvas.style.width = svgSize.width.toString();
    canvas.style.height = svgSize.height.toString();

    const ctx = canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.scale(scale, scale);
    
    const data = (new XMLSerializer()).serializeToString(svg);
    const img = new Image();

    img.onload = () => {
      ctx.drawImage(img, 0, 0);

      var imgURI = canvas
          .toDataURL('image/png')

      console.log('imgURI ', imgURI)
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(data)));
  }

  //  This function attempts to create a new svg "text" element, chopping 
  //  it up into "tspan" pieces, if the message is too long
  createSVGtext(message: string, x: number, y: number, orientation: string, maxCharsPerLine: number, lineHeight: number) {
    const svgText = document.getElementById(orientation + '-text') as HTMLElement;

    // Remove existing tspans
    while (svgText.firstChild) {
      svgText.removeChild(svgText.firstChild);
    }

    // Style the font
    svgText.setAttributeNS(null, 'font-size', '12');
    svgText.setAttributeNS(null, 'fill', '#000000');         //  Black text
    svgText.setAttributeNS(null, 'text-anchor', 'middle');   //  Center the text
    svgText.setAttributeNS(null, 'font-family', 'Helvetica, Arial, sans-serif')

    // Split the message by max line length
    const words = message.split(" ");
    const linesReducer = words.reduce((acc: {array: string[], lineCount: number}, curWord: string) => {
      const testLine = acc.array[acc.lineCount] + curWord + " ";
      if (testLine.length > maxCharsPerLine) {
        return {array: acc.array.concat(curWord + " "), lineCount: acc.lineCount + 1}
      } else {
        const tempArray = [...acc.array]
        tempArray[acc.lineCount] = testLine
        return {array: tempArray, lineCount: acc.lineCount}
      }
    }, {array: [""], lineCount: 0})

    // Take the array of message lines and and individual tspans to the text element
    const textHeight = linesReducer.array.length * lineHeight;
    linesReducer.array.forEach(line => {
      y += lineHeight;
    
      //  Add a new <tspan> element
      const svgTSpan = document.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      svgTSpan.setAttributeNS(null, 'x', x.toString());
      svgTSpan.setAttributeNS(null, 'y', (y - textHeight/2).toString());


      const tSpanTextNode = document.createTextNode(line);
      svgTSpan.appendChild(tSpanTextNode);
      svgText.appendChild(svgTSpan);
    })

    return svgText;
  }

  render() {

    // Set up the dynamic portrait and landscape SVGs
    const portraitSVG = document.getElementById('portrait-svg')
    if (portraitSVG) {
      const svgText = this.createSVGtext(this.state.message, previewShortSide/2, previewLongSide/2, 'portrait', 25, 16)
      portraitSVG.append(svgText);
    }
    const landscapeSVG = document.getElementById('landscape-svg')
    if (landscapeSVG) {
      const svgText = this.createSVGtext(this.state.message, previewLongSide/2, previewShortSide/2, 'landscape', 50, 16)
      landscapeSVG.append(svgText);
    }
    
    return (
      <>
        <form onSubmit={this.handleSubmit}>
          <label>
            Message:
            <input type="text" value={this.state.message} onChange={this.handleMessageChange} />
          </label>
          <label>
            Stations:
            <select value={this.state.stations} onChange={this.handleStationChange}>
              <option value="copley">Copley</option>
              <option value="arlington">Arlington</option>
              <option value="boylston">Boylston</option>
              <option value="park-st">Park St</option>
            </select>
          </label>
          <input type="submit" value="Submit" disabled={!this.state.message}/>
        </form>

        <svg viewBox={"0 0 "+previewLongSide+" "+previewLongSide} height={previewLongSide} width={previewLongSide}>
          <svg id="portrait-svg" viewBox={"0 0 "+previewShortSide+" "+previewLongSide}>
            <rect stroke="black" fill="yellow" height="100%" width="100%"/>
            <text id="portrait-text"/>
          </svg>
        </svg>

        <svg viewBox="0 0 300 300" height="300" width="300">
          <svg id="landscape-svg" viewBox="0 0 300 183">
            <rect stroke="black" fill="yellow" height="100%" width="100%"/>
            <text id="landscape-text"/>
          </svg>
        </svg>
      </>
    );
  }
}

export default SimpleForm
  