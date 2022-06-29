export interface Station {
  name: string;
  portrait: boolean;
  landscape: boolean;
  lines?: string[];
}

interface StationsByLine {
  [index: string]: Station[];
}

// Terminal Stations are listed in all caps
const STATIONS_BY_LINE: StationsByLine = {
  red: [
    {
      name: "Alewife",
      portrait: true,
      landscape: false,
    },
    {
      name: "Davis",
      portrait: true,
      landscape: false,
    },
    {
      name: "Porter",
      portrait: true,
      landscape: false,
    },
    {
      name: "Harvard",
      portrait: true,
      landscape: false,
    },
    {
      name: "Central",
      portrait: true,
      landscape: false,
    },
    {
      name: "Kendall/MIT",
      portrait: true,
      landscape: false,
    },
    {
      name: "Charles/MGH",
      portrait: true,
      landscape: false,
    },
    {
      name: "Park Street",
      portrait: true,
      landscape: false,
    },
    {
      name: "Downtown Crossing",
      portrait: true,
      landscape: false,
    },
    {
      name: "South Station",
      portrait: true,
      landscape: false,
    },
    {
      name: "Broadway",
      portrait: true,
      landscape: true,
    },
    {
      name: "Andrew",
      portrait: false,
      landscape: false,
    },
    {
      name: "JFK/UMass",
      portrait: true,
      landscape: false,
    },
    {
      name: "North Quincy",
      portrait: false,
      landscape: false,
    },
    {
      name: "Wollaston",
      portrait: false,
      landscape: false,
    },
    {
      name: "Quincy Center",
      portrait: true,
      landscape: true,
    },
    {
      name: "Quincy Adams",
      portrait: false,
      landscape: false,
    },
    {
      name: "BRAINTREE",
      portrait: false,
      landscape: false,
    },
    {
      name: "Savin Hill",
      portrait: false,
      landscape: false,
    },
    {
      name: "Fields Corner",
      portrait: false,
      landscape: false,
    },
    {
      name: "Shawmut",
      portrait: false,
      landscape: false,
    },
    {
      name: "ASHMONT",
      portrait: false,
      landscape: false,
    }
  ],
  orange: [
    {
      name: "Oak Grove",
      portrait: false,
      landscape: false,
    },
    {
      name: "Malden Center",
      portrait: true,
      landscape: true,
    },
    {
      name: "Wellington",
      portrait: true,
      landscape: false,
    },
    {
      name: "Assembly",
      portrait: false,
      landscape: false,
    },
    {
      name: "Sullivan Square",
      portrait: true,
      landscape: true,
    },
    {
      name: "Community College",
      portrait: false,
      landscape: false,
    },
    {
      name: "North Station",
      portrait: true,
      landscape: false,
    },
    {
      name: "Haymarket",
      portrait: true,
      landscape: true,
    },
    {
      name: "State",
      portrait: true,
      landscape: false,
    },
    {
      name: "Downtown Crossing",
      portrait: true,
      landscape: false,
    },
    {
      name: "Chinatown",
      portrait: false,
      landscape: false,
    },
    {
      name: "Tufts Medical Center",
      portrait: true,
      landscape: true,
    },
    {
      name: "Back Bay",
      portrait: true,
      landscape: true,
    },
    {
      name: "Massachusetts Avenue",
      portrait: false,
      landscape: false,
    },
    {
      name: "Ruggles",
      portrait: true,
      landscape: false,
    },
    {
      name: "Roxbury Crossing",
      portrait: false,
      landscape: false,
    },
    {
      name: "Jackson Square",
      portrait: false,
      landscape: false,
    },
    {
      name: "Stony Brook",
      portrait: false,
      landscape: false,
    },
    {
      name: "Green Street",
      portrait: false,
      landscape: false,
    },
    {
      name: "Forest Hills",
      portrait: true,
      landscape: false,
    },
  ],
  blue: [
    {
      name: "Wonderland",
      portrait: false,
      landscape: false,
    },
    {
      name: "Revere Beach",
      portrait: false,
      landscape: false,
    },
    {
      name: "Beachmont",
      portrait: false,
      landscape: false,
    },
    {
      name: "Suffolk Downs",
      portrait: false,
      landscape: false,
    },
    {
      name: "Orient Heights",
      portrait: false,
      landscape: false,
    },
    {
      name: "Wood Island",
      portrait: false,
      landscape: false,
    },
    {
      name: "Airport",
      portrait: true,
      landscape: true,
    },
    {
      name: "Maverick",
      portrait: true,
      landscape: false,
    },
    {
      name: "Aquarium",
      portrait: false,
      landscape: true,
    },
    {
      name: "State",
      portrait: true,
      landscape: false,
    },
    {
      name: "Government Center",
      portrait: true,
      landscape: false,
    },
    {
      name: "Bowdoin",
      portrait: false,
      landscape: false,
    },
  ],
  silver: [
    {
      name: "World Trade Center",
      portrait: false,
      landscape: true,
    },
  ],
  green: [
    {
      name: "Union Square",
      portrait: false,
      landscape: false,
    },
    {
      name: "Lechmere",
      portrait: false,
      landscape: false,
    },
    {
      name: "Science Park/West End",
      portrait: false,
      landscape: false,
    },
    {
      name: "North Station",
      portrait: true,
      landscape: false,
    },
    {
      name: "Haymarket",
      portrait: true,
      landscape: true,
    },
    {
      name: "Government Center",
      portrait: true,
      landscape: false,
    },
    {
      name: "Park Street",
      portrait: true,
      landscape: false,
    },
    {
      name: "Boylston",
      portrait: true,
      landscape: false,
    },
    {
      name: "Arlington",
      portrait: true,
      landscape: false,
    },
    {
      name: "Copley",
      portrait: true,
      landscape: false,
    },
    {
      name: "Prudential",
      portrait: false,
      landscape: true,
    },
    {
      name: "Symphony",
      portrait: false,
      landscape: false,
    },
    {
      name: "Northeastern University",
      portrait: false,
      landscape: false,
    },
    {
      name: "Museum of Fine Arts",
      portrait: false,
      landscape: false,
    },
    {
      name: "Longwood Medical Area",
      portrait: false,
      landscape: false,
    },
    {
      name: "Brigham Circle",
      portrait: false,
      landscape: false,
    },
    {
      name: "Fenwood Road",
      portrait: false,
      landscape: false,
    },
    {
      name: "Mission Park",
      portrait: false,
      landscape: false,
    },
    {
      name: "Riverway",
      portrait: false,
      landscape: false,
    },
    {
      name: "Back of the Hill",
      portrait: false,
      landscape: false,
    },
    {
      name: "Heath Street",
      portrait: false,
      landscape: false,
    },
    {
      name: "Hynes Convention Center",
      portrait: false,
      landscape: false,
    },
    {
      name: "Kenmore",
      portrait: true,
      landscape: true,
    },
    {
      name: "Blandford Street",
      portrait: false,
      landscape: false,
    },
    {
      name: "Boston University East",
      portrait: false,
      landscape: false,
    },
    {
      name: "Boston University Central",
      portrait: false,
      landscape: false,
    },
    {
      name: "Amory Street",
      portrait: false,
      landscape: false,
    },
    {
      name: "Babcock Street",
      portrait: false,
      landscape: false,
    },
    {
      name: "Packard's Corner",
      portrait: false,
      landscape: false,
    },
    {
      name: "Harvard Avenue",
      portrait: false,
      landscape: false,
    },
    {
      name: "Griggs Street",
      portrait: false,
      landscape: false,
    },
    {
      name: "Allston Street",
      portrait: false,
      landscape: false,
    },
    {
      name: "Warren Street",
      portrait: false,
      landscape: false,
    },
    {
      name: "Washington Street",
      portrait: false,
      landscape: false,
    },
    {
      name: "Sutherland Road",
      portrait: false,
      landscape: false,
    },
    {
      name: "Chiswick Road",
      portrait: false,
      landscape: false,
    },
    {
      name: "Chestnut Hill Avenue",
      portrait: false,
      landscape: false,
    },
    {
      name: "South Street",
      portrait: false,
      landscape: false,
    },
    {
      name: "Boston College",
      portrait: false,
      landscape: false,
    },
    {
      name: "Saint Mary's Street",
      portrait: false,
      landscape: false,
    },
    {
      name: "Hawes Street",
      portrait: false,
      landscape: false,
    },
    {
      name: "Kent Street",
      portrait: false,
      landscape: false,
    },
    {
      name: "Saint Paul Street",
      portrait: false,
      landscape: false,
    },
    {
      name: "Coolidge Corner",
      portrait: false,
      landscape: false,
    },
    {
      name: "Summit Avenue",
      portrait: false,
      landscape: false,
    },
    {
      name: "Brandon Hall",
      portrait: false,
      landscape: false,
    },
    {
      name: "Fairbanks Street",
      portrait: false,
      landscape: false,
    },
    {
      name: "Washington Square",
      portrait: false,
      landscape: false,
    },
    {
      name: "Tappan Street",
      portrait: false,
      landscape: false,
    },
    {
      name: "Dean Road",
      portrait: false,
      landscape: false,
    },
    {
      name: "Englewood Avenue",
      portrait: false,
      landscape: false,
    },
    {
      name: "Cleveland Circle",
      portrait: false,
      landscape: false,
    },
    {
      name: "Fenway",
      portrait: false,
      landscape: false,
    },
    {
      name: "Longwood",
      portrait: false,
      landscape: false,
    },
    {
      name: "Brookline Village",
      portrait: false,
      landscape: false,
    },
    {
      name: "Brookline Hills",
      portrait: false,
      landscape: false,
    },
    {
      name: "Beaconsfield",
      portrait: false,
      landscape: false,
    },
    {
      name: "Reservoir",
      portrait: false,
      landscape: false,
    },
    {
      name: "Chestnut Hill",
      portrait: false,
      landscape: false,
    },
    {
      name: "Newton Centre",
      portrait: false,
      landscape: false,
    },
    {
      name: "Newton Highlands",
      portrait: false,
      landscape: false,
    },
    {
      name: "Eliot",
      portrait: false,
      landscape: false,
    },
    {
      name: "Waban",
      portrait: false,
      landscape: false,
    },
    {
      name: "Woodland",
      portrait: false,
      landscape: false,
    },
    {
      name: "Riverside",
      portrait: false,
      landscape: false,
    },
  ],
};

export default STATIONS_BY_LINE;
