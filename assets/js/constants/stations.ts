export interface Station {
  name: string;
  portrait: boolean;
  landscape: boolean;
  lines?: string[];
}

interface StationsByLine {
  [index: string]: Station[]
}

const STATIONS_BY_LINE: StationsByLine = {
  red: [
    {
      name: "Alewife",
      portrait: true,
      landscape: true
    },
    {
      name: "Davis",
      portrait: true,
      landscape: false
    },
    {
      name: "Porter",
      portrait: true,
      landscape: false
    },
    {
      name: "Harvard",
      portrait: true,
      landscape: false
    },
    {
      name: "Savin Hill",
      portrait: false,
      landscape: false
    },
    {
      name: "Kendall/MIT",
      portrait: true,
      landscape: false
    },
    {
      name: "Charles/MGH",
      portrait: true,
      landscape: false
    },
    {
      name: "Park Street",
      portrait: true,
      landscape: false
    },
    {
      name: "Downtown Crossing",
      portrait: true,
      landscape: false
    },
  ],
  orange: [
    {
      name: "Oak Grove",
      portrait: true,
      landscape: false
    },
    {
      name: "Malden Center",
      portrait: true,
      landscape: true
    },
    {
      name: "Wellington",
      portrait: true,
      landscape: false
    },
    {
      name: "Sullivan Square",
      portrait: true,
      landscape: true
    },
    {
      name: "Community College",
      portrait: false,
      landscape: false
    },
    {
      name: "North Station",
      portrait: true,
      landscape: false
    },
    {
      name: "Haymarket",
      portrait: true,
      landscape: true
    },
    {
      name: "State",
      portrait: true,
      landscape: false
    },
    {
      name: "Downtown Crossing",
      portrait: true,
      landscape: false
    },
    {
      name: "Chinatown",
      portrait: true,
      landscape: false
    },
  ],
  blue: [
    {
      name: "Bowdoin",
      portrait: true,
      landscape: false
    },
    {
      name: "Government Center",
      portrait: true,
      landscape: false
    },
    {
      name: "State",
      portrait: true,
      landscape: false
    },
    {
      name: "Aquarium",
      portrait: true,
      landscape: true
    },
    {
      name: "Maverick",
      portrait: false,
      landscape: false
    },
    {
      name: "Airport",
      portrait: true,
      landscape: true
    },
    {
      name: "Wood Island",
      portrait: true,
      landscape: false
    },
    {
      name: "Orient Heights",
      portrait: true,
      landscape: false
    },
    {
      name: "Suffolk Downs",
      portrait: true,
      landscape: false
    },
    {
      name: "Beachmont",
      portrait: false,
      landscape: false
    },
  ],
  silver: [
    {
      name: "World Trade Center",
      portrait: true,
      landscape: true
    }
  ],
  green: [
    {
      name: "Lechmere",
      portrait: true,
      landscape: false
    },
    {
      name: "Science Park",
      portrait: true,
      landscape: false
    },
    {
      name: "North Station",
      portrait: true,
      landscape: false
    },
    {
      name: "Haymarket",
      portrait: true,
      landscape: true
    },
    {
      name: "Government Center",
      portrait: true,
      landscape: false
    },
    {
      name: "Park Street",
      portrait: true,
      landscape: false
    },
    {
      name: "Boylston",
      portrait: true,
      landscape: false
    },
    {
      name: "Arlington",
      portrait: true,
      landscape: false
    },
    {
      name: "Copley Square",
      portrait: true,
      landscape: false
    },
    {
      name: "Hynes",
      portrait: false,
      landscape: false
    },
  ]
}

export default STATIONS_BY_LINE;