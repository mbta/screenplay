export const color = (line: string) => {
  switch(line) {
    case "red": return "#DA291C";
    case "orange": return "#ED8B00";
    case "blue": return "#003DA5";
    case "silver": return "#7C878E";
    case "green": return "#00843D";
  }
}

export const abbreviation = (line: string) => {
  switch(line) {
    case "red": return "RL";
    case "orange": return "OL";
    case "blue": return "BL";
    case "silver": return "SL";
    case "green": return "GL";
  }
}