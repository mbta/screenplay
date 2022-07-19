export interface Station {
  name: string;
}

interface StationsByLine {
  [index: string]: Station[];
}

// Terminal Stations are listed in all caps
const STATION_ORDER_BY_LINE: StationsByLine = {
  red: [
    {
      name: "Alewife",
    },
    {
      name: "Davis",
    },
    {
      name: "Porter",
    },
    {
      name: "Harvard",
    },
    {
      name: "Central",
    },
    {
      name: "Kendall/MIT",
    },
    {
      name: "Charles/MGH",
    },
    {
      name: "Park Street",
    },
    {
      name: "Downtown Crossing",
    },
    {
      name: "South Station",
    },
    {
      name: "Broadway",
    },
    {
      name: "Andrew",
    },
    {
      name: "JFK/UMass",
    },
    {
      name: "North Quincy",
    },
    {
      name: "Wollaston",
    },
    {
      name: "Quincy Center",
    },
    {
      name: "Quincy Adams",
    },
    {
      name: "BRAINTREE",
    },
    {
      name: "Savin Hill",
    },
    {
      name: "Fields Corner",
    },
    {
      name: "Shawmut",
    },
    {
      name: "ASHMONT",
    },
  ],
  orange: [
    {
      name: "Oak Grove",
    },
    {
      name: "Malden Center",
    },
    {
      name: "Wellington",
    },
    {
      name: "Assembly",
    },
    {
      name: "Sullivan Square",
    },
    {
      name: "Community College",
    },
    {
      name: "North Station",
    },
    {
      name: "Haymarket",
    },
    {
      name: "State",
    },
    {
      name: "Downtown Crossing",
    },
    {
      name: "Chinatown",
    },
    {
      name: "Tufts Medical Center",
    },
    {
      name: "Back Bay",
    },
    {
      name: "Massachusetts Avenue",
    },
    {
      name: "Ruggles",
    },
    {
      name: "Roxbury Crossing",
    },
    {
      name: "Jackson Square",
    },
    {
      name: "Stony Brook",
    },
    {
      name: "Green Street",
    },
    {
      name: "Forest Hills",
    },
  ],
  blue: [
    {
      name: "Wonderland",
    },
    {
      name: "Revere Beach",
    },
    {
      name: "Beachmont",
    },
    {
      name: "Suffolk Downs",
    },
    {
      name: "Orient Heights",
    },
    {
      name: "Wood Island",
    },
    {
      name: "Airport",
    },
    {
      name: "Maverick",
    },
    {
      name: "Aquarium",
    },
    {
      name: "State",
    },
    {
      name: "Government Center",
    },
    {
      name: "Bowdoin",
    },
  ],
  silver: [
    {
      name: "World Trade Center",
    },
  ],
  green: [
    {
      name: "Union Square",
    },
    {
      name: "Lechmere",
    },
    {
      name: "Science Park/West End",
    },
    {
      name: "North Station",
    },
    {
      name: "Haymarket",
    },
    {
      name: "Government Center",
    },
    {
      name: "Park Street",
    },
    {
      name: "Boylston",
    },
    {
      name: "Arlington",
    },
    {
      name: "Copley",
    },
    {
      name: "Prudential",
    },
    {
      name: "Symphony",
    },
    {
      name: "Northeastern University",
    },
    {
      name: "Museum of Fine Arts",
    },
    {
      name: "Longwood Medical Area",
    },
    {
      name: "Brigham Circle",
    },
    {
      name: "Fenwood Road",
    },
    {
      name: "Mission Park",
    },
    {
      name: "Riverway",
    },
    {
      name: "Back of the Hill",
    },
    {
      name: "Heath Street",
    },
    {
      name: "Hynes Convention Center",
    },
    {
      name: "Kenmore",
    },
    {
      name: "Blandford Street",
    },
    {
      name: "Boston University East",
    },
    {
      name: "Boston University Central",
    },
    {
      name: "Amory Street",
    },
    {
      name: "Babcock Street",
    },
    {
      name: "Packard's Corner",
    },
    {
      name: "Harvard Avenue",
    },
    {
      name: "Griggs Street",
    },
    {
      name: "Allston Street",
    },
    {
      name: "Warren Street",
    },
    {
      name: "Washington Street",
    },
    {
      name: "Sutherland Road",
    },
    {
      name: "Chiswick Road",
    },
    {
      name: "Chestnut Hill Avenue",
    },
    {
      name: "South Street",
    },
    {
      name: "Boston College",
    },
    {
      name: "Saint Mary's Street",
    },
    {
      name: "Hawes Street",
    },
    {
      name: "Kent Street",
    },
    {
      name: "Saint Paul Street",
    },
    {
      name: "Coolidge Corner",
    },
    {
      name: "Summit Avenue",
    },
    {
      name: "Brandon Hall",
    },
    {
      name: "Fairbanks Street",
    },
    {
      name: "Washington Square",
    },
    {
      name: "Tappan Street",
    },
    {
      name: "Dean Road",
    },
    {
      name: "Englewood Avenue",
    },
    {
      name: "Cleveland Circle",
    },
    {
      name: "Fenway",
    },
    {
      name: "Longwood",
    },
    {
      name: "Brookline Village",
    },
    {
      name: "Brookline Hills",
    },
    {
      name: "Beaconsfield",
    },
    {
      name: "Reservoir",
    },
    {
      name: "Chestnut Hill",
    },
    {
      name: "Newton Centre",
    },
    {
      name: "Newton Highlands",
    },
    {
      name: "Eliot",
    },
    {
      name: "Waban",
    },
    {
      name: "Woodland",
    },
    {
      name: "Riverside",
    },
  ],
};

export default STATION_ORDER_BY_LINE;
