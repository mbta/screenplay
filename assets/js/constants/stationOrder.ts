export interface Station {
  name: string;
  inlineMap?: string;
  branch?: string;
}

interface StationsByLine {
  [index: string]: Station[];
}

// Terminal Stations are listed in all caps
const STATION_ORDER_BY_LINE: StationsByLine = {
  red: [
    {
      name: "Alewife",
      inlineMap: "Trunk-Top",
    },
    {
      name: "Davis",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Porter",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Harvard",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Central",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Kendall/MIT",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Charles/MGH",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Park Street",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Downtown Crossing",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "South Station",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Broadway",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Andrew",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "JFK/UMass",
      inlineMap: "Fork-Down",
    },
    {
      name: "North Quincy",
      inlineMap: "Branch-Middle",
    },
    {
      name: "Wollaston",
      inlineMap: "Branch-Middle",
    },
    {
      name: "Quincy Center",
      inlineMap: "Branch-Middle",
    },
    {
      name: "Quincy Adams",
      inlineMap: "Branch-Middle",
    },
    {
      name: "BRAINTREE",
      inlineMap: "Branch-Bottom",
    },
    {
      name: "Savin Hill",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Fields Corner",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Shawmut",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "ASHMONT",
      inlineMap: "Trunk-Bottom",
    },
  ],
  orange: [
    {
      name: "Oak Grove",
      inlineMap: "Trunk-Top",
    },
    {
      name: "Malden Center",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Wellington",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Assembly",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Sullivan Square",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Community College",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "North Station",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Haymarket",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "State",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Downtown Crossing",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Chinatown",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Tufts Medical Center",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Back Bay",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Massachusetts Avenue",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Ruggles",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Roxbury Crossing",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Jackson Square",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Stony Brook",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Green Street",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Forest Hills",
      inlineMap: "Trunk-Bottom",
    },
  ],
  blue: [
    {
      name: "Wonderland",
      inlineMap: "Trunk-Top",
    },
    {
      name: "Revere Beach",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Beachmont",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Suffolk Downs",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Orient Heights",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Wood Island",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Airport",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Maverick",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Aquarium",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "State",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Government Center",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Bowdoin",
      inlineMap: "Trunk-Bottom",
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
      inlineMap: "Trunk-Top",
      branch: "D",
    },
    {
      name: "Lechmere",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Science Park/West End",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "North Station",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Haymarket",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Government Center",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Park Street",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Boylston",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Arlington",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Copley",
      inlineMap: "Fork-Down",
    },
    {
      name: "Prudential",
      inlineMap: "Branch-Middle",
      branch: "E",
    },
    {
      name: "Symphony",
      inlineMap: "Branch-Middle",
      branch: "E",
    },
    {
      name: "Northeastern University",
      inlineMap: "Branch-Middle",
      branch: "E",
    },
    {
      name: "Museum of Fine Arts",
      inlineMap: "Branch-Middle",
      branch: "E",
    },
    {
      name: "Longwood Medical Area",
      inlineMap: "Branch-Middle",
      branch: "E",
    },
    {
      name: "Brigham Circle",
      inlineMap: "Branch-Middle",
      branch: "E",
    },
    {
      name: "Fenwood Road",
      inlineMap: "Branch-Middle",
      branch: "E",
    },
    {
      name: "Mission Park",
      inlineMap: "Branch-Middle",
      branch: "E",
    },
    {
      name: "Riverway",
      inlineMap: "Branch-Middle",
      branch: "E",
    },
    {
      name: "Back of the Hill",
      inlineMap: "Branch-Middle",
      branch: "E",
    },
    {
      name: "Heath Street",
      inlineMap: "Branch-Bottom",
      branch: "E",
    },
    {
      name: "Hynes Convention Center",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Kenmore",
      inlineMap: "Fork-Down",
    },
    {
      name: "Blandford Street",
      inlineMap: "Branch-Middle",
      branch: "B",
    },
    {
      name: "Boston University East",
      inlineMap: "Branch-Middle",
      branch: "B",
    },
    {
      name: "Boston University Central",
      inlineMap: "Branch-Middle",
      branch: "B",
    },
    {
      name: "Amory Street",
      inlineMap: "Branch-Middle",
      branch: "B",
    },
    {
      name: "Babcock Street",
      inlineMap: "Branch-Middle",
      branch: "B",
    },
    {
      name: "Packard's Corner",
      inlineMap: "Branch-Middle",
      branch: "B",
    },
    {
      name: "Harvard Avenue",
      inlineMap: "Branch-Middle",
      branch: "B",
    },
    {
      name: "Griggs Street",
      inlineMap: "Branch-Middle",
      branch: "B",
    },
    {
      name: "Allston Street",
      inlineMap: "Branch-Middle",
      branch: "B",
    },
    {
      name: "Warren Street",
      inlineMap: "Branch-Middle",
      branch: "B",
    },
    {
      name: "Washington Street",
      inlineMap: "Branch-Middle",
      branch: "B",
    },
    {
      name: "Sutherland Road",
      inlineMap: "Branch-Middle",
      branch: "B",
    },
    {
      name: "Chiswick Road",
      inlineMap: "Branch-Middle",
      branch: "B",
    },
    {
      name: "Chestnut Hill Avenue",
      inlineMap: "Branch-Middle",
      branch: "B",
    },
    {
      name: "South Street",
      inlineMap: "Branch-Middle",
      branch: "B",
    },
    {
      name: "Boston College",
      inlineMap: "Branch-Bottom",
      branch: "B",
    },
    {
      name: "Saint Mary's Street",
      inlineMap: "Branch-Fork-Down",
      branch: "C",
    },
    {
      name: "Hawes Street",
      inlineMap: "Branch-Middle",
      branch: "C",
    },
    {
      name: "Kent Street",
      inlineMap: "Branch-Middle",
      branch: "C",
    },
    {
      name: "Saint Paul Street",
      inlineMap: "Branch-Middle",
      branch: "C",
    },
    {
      name: "Coolidge Corner",
      inlineMap: "Branch-Middle",
      branch: "C",
    },
    {
      name: "Summit Avenue",
      inlineMap: "Branch-Middle",
      branch: "C",
    },
    {
      name: "Brandon Hall",
      inlineMap: "Branch-Middle",
      branch: "C",
    },
    {
      name: "Fairbanks Street",
      inlineMap: "Branch-Middle",
      branch: "C",
    },
    {
      name: "Washington Square",
      inlineMap: "Branch-Middle",
      branch: "C",
    },
    {
      name: "Tappan Street",
      inlineMap: "Branch-Middle",
      branch: "C",
    },
    {
      name: "Dean Road",
      inlineMap: "Branch-Middle",
      branch: "C",
    },
    {
      name: "Englewood Avenue",
      inlineMap: "Branch-Middle",
      branch: "C",
    },
    {
      name: "Cleveland Circle",
      inlineMap: "Branch-Bottom",
      branch: "C",
    },
    {
      name: "Fenway",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Longwood",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Brookline Village",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Brookline Hills",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Beaconsfield",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Reservoir",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Chestnut Hill",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Newton Centre",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Newton Highlands",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Eliot",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Waban",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Woodland",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Riverside",
      inlineMap: "Trunk-Bottom",
      branch: "D",
    },
  ],
  "green-b": [
    {
      name: "Government Center",
      inlineMap: "Trunk-Top",
      branch: "B",
    },
    {
      name: "Park Street",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "Boylston",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "Arlington",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "Copley",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "Hynes Convention Center",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "Kenmore",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "Blandford Street",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "Boston University East",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "Boston University Central",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "Amory Street",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "Babcock Street",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "Packard's Corner",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "Harvard Avenue",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "Griggs Street",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "Allston Street",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "Warren Street",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "Washington Street",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "Sutherland Road",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "Chiswick Road",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "Chestnut Hill Avenue",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "South Street",
      inlineMap: "Trunk-Middle",
      branch: "B",
    },
    {
      name: "Boston College",
      inlineMap: "Trunk-Bottom",
      branch: "B",
    },
  ],
  "green-c": [
    {
      name: "Government Center",
      inlineMap: "Trunk-Top",
      branch: "C",
    },
    {
      name: "Park Street",
      inlineMap: "Trunk-Middle",
      branch: "C",
    },
    {
      name: "Boylston",
      inlineMap: "Trunk-Middle",
      branch: "C",
    },
    {
      name: "Arlington",
      inlineMap: "Trunk-Middle",
      branch: "C",
    },
    {
      name: "Copley",
      inlineMap: "Trunk-Middle",
      branch: "C",
    },
    {
      name: "Hynes Convention Center",
      inlineMap: "Trunk-Middle",
      branch: "C",
    },
    {
      name: "Kenmore",
      inlineMap: "Trunk-Middle",
      branch: "C",
    },
    {
      name: "Saint Mary's Street",
      inlineMap: "Trunk-Middle",
      branch: "C",
    },
    {
      name: "Hawes Street",
      inlineMap: "Trunk-Middle",
      branch: "C",
    },
    {
      name: "Kent Street",
      inlineMap: "Trunk-Middle",
      branch: "C",
    },
    {
      name: "Saint Paul Street",
      inlineMap: "Trunk-Middle",
      branch: "C",
    },
    {
      name: "Coolidge Corner",
      inlineMap: "Trunk-Middle",
      branch: "C",
    },
    {
      name: "Summit Avenue",
      inlineMap: "Trunk-Middle",
      branch: "C",
    },
    {
      name: "Brandon Hall",
      inlineMap: "Trunk-Middle",
      branch: "C",
    },
    {
      name: "Fairbanks Street",
      inlineMap: "Trunk-Middle",
      branch: "C",
    },
    {
      name: "Washington Square",
      inlineMap: "Trunk-Middle",
      branch: "C",
    },
    {
      name: "Tappan Street",
      inlineMap: "Trunk-Middle",
      branch: "C",
    },
    {
      name: "Dean Road",
      inlineMap: "Trunk-Middle",
      branch: "C",
    },
    {
      name: "Englewood Avenue",
      inlineMap: "Trunk-Middle",
      branch: "C",
    },
    {
      name: "Cleveland Circle",
      inlineMap: "Trunk-Bottom",
      branch: "C",
    },
  ],
  "green-d": [
    {
      name: "North Station",
      inlineMap: "Trunk-Top",
      branch: "D",
    },
    {
      name: "Haymarket",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Government Center",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Park Street",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Boylston",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Arlington",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Copley",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Hynes Convention Center",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Kenmore",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Fenway",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Longwood",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Brookline Village",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Brookline Hills",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Beaconsfield",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Reservoir",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Chestnut Hill",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Newton Centre",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Newton Highlands",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Eliot",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Waban",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Woodland",
      inlineMap: "Trunk-Middle",
      branch: "D",
    },
    {
      name: "Riverside",
      inlineMap: "Trunk-Bottom",
      branch: "D",
    },
  ],
  "green-e": [
    {
      name: "Union Square",
      inlineMap: "Trunk-Top",
      branch: "E",
    },
    {
      name: "Lechmere",
      inlineMap: "Trunk-Middle",
      branch: "E",
    },
    {
      name: "Science Park/West End",
      inlineMap: "Trunk-Middle",
      branch: "E",
    },
    {
      name: "North Station",
      inlineMap: "Trunk-Middle",
      branch: "E",
    },
    {
      name: "Haymarket",
      inlineMap: "Trunk-Middle",
      branch: "E",
    },
    {
      name: "Government Center",
      inlineMap: "Trunk-Middle",
      branch: "E",
    },
    {
      name: "Park Street",
      inlineMap: "Trunk-Middle",
      branch: "E",
    },
    {
      name: "Boylston",
      inlineMap: "Trunk-Middle",
      branch: "E",
    },
    {
      name: "Arlington",
      inlineMap: "Trunk-Middle",
      branch: "E",
    },
    {
      name: "Copley",
      inlineMap: "Trunk-Middle",
      branch: "E",
    },
    {
      name: "Prudential",
      inlineMap: "Trunk-Middle",
      branch: "E",
    },
    {
      name: "Symphony",
      inlineMap: "Trunk-Middle",
      branch: "E",
    },
    {
      name: "Northeastern University",
      inlineMap: "Trunk-Middle",
      branch: "E",
    },
    {
      name: "Museum of Fine Arts",
      inlineMap: "Trunk-Middle",
      branch: "E",
    },
    {
      name: "Longwood Medical Area",
      inlineMap: "Trunk-Middle",
      branch: "E",
    },
    {
      name: "Brigham Circle",
      inlineMap: "Trunk-Middle",
      branch: "E",
    },
    {
      name: "Fenwood Road",
      inlineMap: "Trunk-Middle",
      branch: "E",
    },
    {
      name: "Mission Park",
      inlineMap: "Trunk-Middle",
      branch: "E",
    },
    {
      name: "Riverway",
      inlineMap: "Trunk-Middle",
      branch: "E",
    },
    {
      name: "Back of the Hill",
      inlineMap: "Trunk-Middle",
      branch: "E",
    },
    {
      name: "Heath Street",
      inlineMap: "Trunk-Bottom",
      branch: "E",
    },
  ],
  mattapan: [
    {
      name: "Ashmont",
      inlineMap: "Trunk-Top",
    },
    {
      name: "Cedar Grove",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Butler",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Milton",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Central Avenue",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Valley Road",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Capen Street",
      inlineMap: "Trunk-Middle",
    },
    {
      name: "Mattapan",
      inlineMap: "Trunk-Bottom",
    },
  ],
};

export default STATION_ORDER_BY_LINE;
