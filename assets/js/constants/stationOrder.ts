export interface Station {
  name: string;
  inlineMap?: string;
}

interface StationsByLine {
  [index: string]: Station[];
}

// Terminal Stations are listed in all caps
const STATION_ORDER_BY_LINE: StationsByLine = {
  red: [
    {
      name: "Alewife",
      inlineMap: "Red-Trunk-Top",
    },
    {
      name: "Davis",
      inlineMap: "Red-Trunk-Middle",
    },
    {
      name: "Porter",
      inlineMap: "Red-Trunk-Middle",
    },
    {
      name: "Harvard",
      inlineMap: "Red-Trunk-Middle",
    },
    {
      name: "Central",
      inlineMap: "Red-Trunk-Middle",
    },
    {
      name: "Kendall/MIT",
      inlineMap: "Red-Trunk-Middle",
    },
    {
      name: "Charles/MGH",
      inlineMap: "Red-Trunk-Middle",
    },
    {
      name: "Park Street",
      inlineMap: "Red-Trunk-Middle",
    },
    {
      name: "Downtown Crossing",
      inlineMap: "Red-Trunk-Middle",
    },
    {
      name: "South Station",
      inlineMap: "Red-Trunk-Middle",
    },
    {
      name: "Broadway",
      inlineMap: "Red-Trunk-Middle",
    },
    {
      name: "Andrew",
      inlineMap: "Red-Trunk-Middle",
    },
    {
      name: "JFK/UMass",
      inlineMap: "Red-Fork-Down",
    },
    {
      name: "North Quincy",
      inlineMap: "Red-Branch-Middle",
    },
    {
      name: "Wollaston",
      inlineMap: "Red-Branch-Middle",
    },
    {
      name: "Quincy Center",
      inlineMap: "Red-Branch-Middle",
    },
    {
      name: "Quincy Adams",
      inlineMap: "Red-Branch-Middle",
    },
    {
      name: "BRAINTREE",
      inlineMap: "Red-Branch-Bottom",
    },
    {
      name: "Savin Hill",
      inlineMap: "Red-Trunk-Middle",
    },
    {
      name: "Fields Corner",
      inlineMap: "Red-Trunk-Middle",
    },
    {
      name: "Shawmut",
      inlineMap: "Red-Trunk-Middle",
    },
    {
      name: "ASHMONT",
      inlineMap: "Red-Trunk-Bottom",
    },
  ],
  orange: [
    {
      name: "Oak Grove",
      inlineMap: "Orange-Trunk-Top",
    },
    {
      name: "Malden Center",
      inlineMap: "Orange-Trunk-Middle",
    },
    {
      name: "Wellington",
      inlineMap: "Orange-Trunk-Middle",
    },
    {
      name: "Assembly",
      inlineMap: "Orange-Trunk-Middle",
    },
    {
      name: "Sullivan Square",
      inlineMap: "Orange-Trunk-Middle",
    },
    {
      name: "Community College",
      inlineMap: "Orange-Trunk-Middle",
    },
    {
      name: "North Station",
      inlineMap: "Orange-Trunk-Middle",
    },
    {
      name: "Haymarket",
      inlineMap: "Orange-Trunk-Middle",
    },
    {
      name: "State",
      inlineMap: "Orange-Trunk-Middle",
    },
    {
      name: "Downtown Crossing",
      inlineMap: "Orange-Trunk-Middle",
    },
    {
      name: "Chinatown",
      inlineMap: "Orange-Trunk-Middle",
    },
    {
      name: "Tufts Medical Center",
      inlineMap: "Orange-Trunk-Middle",
    },
    {
      name: "Back Bay",
      inlineMap: "Orange-Trunk-Middle",
    },
    {
      name: "Massachusetts Avenue",
      inlineMap: "Orange-Trunk-Middle",
    },
    {
      name: "Ruggles",
      inlineMap: "Orange-Trunk-Middle",
    },
    {
      name: "Roxbury Crossing",
      inlineMap: "Orange-Trunk-Middle",
    },
    {
      name: "Jackson Square",
      inlineMap: "Orange-Trunk-Middle",
    },
    {
      name: "Stony Brook",
      inlineMap: "Orange-Trunk-Middle",
    },
    {
      name: "Green Street",
      inlineMap: "Orange-Trunk-Middle",
    },
    {
      name: "Forest Hills",
      inlineMap: "Orange-Trunk-Bottom",
    },
  ],
  blue: [
    {
      name: "Wonderland",
      inlineMap: "Blue-Trunk-Top",
    },
    {
      name: "Revere Beach",
      inlineMap: "Blue-Trunk-Middle",
    },
    {
      name: "Beachmont",
      inlineMap: "Blue-Trunk-Middle",
    },
    {
      name: "Suffolk Downs",
      inlineMap: "Blue-Trunk-Middle",
    },
    {
      name: "Orient Heights",
      inlineMap: "Blue-Trunk-Middle",
    },
    {
      name: "Wood Island",
      inlineMap: "Blue-Trunk-Middle",
    },
    {
      name: "Airport",
      inlineMap: "Blue-Trunk-Middle",
    },
    {
      name: "Maverick",
      inlineMap: "Blue-Trunk-Middle",
    },
    {
      name: "Aquarium",
      inlineMap: "Blue-Trunk-Middle",
    },
    {
      name: "State",
      inlineMap: "Blue-Trunk-Middle",
    },
    {
      name: "Government Center",
      inlineMap: "Blue-Trunk-Middle",
    },
    {
      name: "Bowdoin",
      inlineMap: "Blue-Trunk-Bottom",
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
      inlineMap: "Green-D-Trunk-Top",
    },
    {
      name: "Lechmere",
      inlineMap: "Green-Trunk-Middle",
    },
    {
      name: "Science Park/West End",
      inlineMap: "Green-Trunk-Middle",
    },
    {
      name: "North Station",
      inlineMap: "Green-Trunk-Middle",
    },
    {
      name: "Haymarket",
      inlineMap: "Green-Trunk-Middle",
    },
    {
      name: "Government Center",
      inlineMap: "Green-Trunk-Middle",
    },
    {
      name: "Park Street",
      inlineMap: "Green-Trunk-Middle",
    },
    {
      name: "Boylston",
      inlineMap: "Green-Trunk-Middle",
    },
    {
      name: "Arlington",
      inlineMap: "Green-Trunk-Middle",
    },
    {
      name: "Copley",
      inlineMap: "Green-Fork-Down",
    },
    {
      name: "Prudential",
      inlineMap: "Green-E-Branch-Middle",
    },
    {
      name: "Symphony",
      inlineMap: "Green-E-Branch-Middle",
    },
    {
      name: "Northeastern University",
      inlineMap: "Green-E-Branch-Middle",
    },
    {
      name: "Museum of Fine Arts",
      inlineMap: "Green-E-Branch-Middle",
    },
    {
      name: "Longwood Medical Area",
      inlineMap: "Green-E-Branch-Middle",
    },
    {
      name: "Brigham Circle",
      inlineMap: "Green-E-Branch-Middle",
    },
    {
      name: "Fenwood Road",
      inlineMap: "Green-E-Branch-Middle",
    },
    {
      name: "Mission Park",
      inlineMap: "Green-E-Branch-Middle",
    },
    {
      name: "Riverway",
      inlineMap: "Green-E-Branch-Middle",
    },
    {
      name: "Back of the Hill",
      inlineMap: "Green-E-Branch-Middle",
    },
    {
      name: "Heath Street",
      inlineMap: "Green-E-Branch-Bottom",
    },
    {
      name: "Hynes Convention Center",
      inlineMap: "Green-Trunk-Middle",
    },
    {
      name: "Kenmore",
      inlineMap: "Green-Fork-Down",
    },
    {
      name: "Blandford Street",
      inlineMap: "Green-B-Branch-Middle",
    },
    {
      name: "Boston University East",
      inlineMap: "Green-B-Branch-Middle",
    },
    {
      name: "Boston University Central",
      inlineMap: "Green-B-Branch-Middle",
    },
    {
      name: "Amory Street",
      inlineMap: "Green-B-Branch-Middle",
    },
    {
      name: "Babcock Street",
      inlineMap: "Green-B-Branch-Middle",
    },
    {
      name: "Packard's Corner",
      inlineMap: "Green-B-Branch-Middle",
    },
    {
      name: "Harvard Avenue",
      inlineMap: "Green-B-Branch-Middle",
    },
    {
      name: "Griggs Street",
      inlineMap: "Green-B-Branch-Middle",
    },
    {
      name: "Allston Street",
      inlineMap: "Green-B-Branch-Middle",
    },
    {
      name: "Warren Street",
      inlineMap: "Green-B-Branch-Middle",
    },
    {
      name: "Washington Street",
      inlineMap: "Green-B-Branch-Middle",
    },
    {
      name: "Sutherland Road",
      inlineMap: "Green-B-Branch-Middle",
    },
    {
      name: "Chiswick Road",
      inlineMap: "Green-B-Branch-Middle",
    },
    {
      name: "Chestnut Hill Avenue",
      inlineMap: "Green-B-Branch-Middle",
    },
    {
      name: "South Street",
      inlineMap: "Green-B-Branch-Middle",
    },
    {
      name: "Boston College",
      inlineMap: "Green-B-Branch-Bottom",
    },
    {
      name: "Saint Mary's Street",
      inlineMap: "Green-C-Branch-Fork-Down",
    },
    {
      name: "Hawes Street",
      inlineMap: "Green-C-Branch-Middle",
    },
    {
      name: "Kent Street",
      inlineMap: "Green-C-Branch-Middle",
    },
    {
      name: "Saint Paul Street",
      inlineMap: "Green-C-Branch-Middle",
    },
    {
      name: "Coolidge Corner",
      inlineMap: "Green-C-Branch-Middle",
    },
    {
      name: "Summit Avenue",
      inlineMap: "Green-C-Branch-Middle",
    },
    {
      name: "Brandon Hall",
      inlineMap: "Green-C-Branch-Middle",
    },
    {
      name: "Fairbanks Street",
      inlineMap: "Green-C-Branch-Middle",
    },
    {
      name: "Washington Square",
      inlineMap: "Green-C-Branch-Middle",
    },
    {
      name: "Tappan Street",
      inlineMap: "Green-C-Branch-Middle",
    },
    {
      name: "Dean Road",
      inlineMap: "Green-C-Branch-Middle",
    },
    {
      name: "Englewood Avenue",
      inlineMap: "Green-C-Branch-Middle",
    },
    {
      name: "Cleveland Circle",
      inlineMap: "Green-C-Branch-Bottom",
    },
    {
      name: "Fenway",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Longwood",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Brookline Village",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Brookline Hills",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Beaconsfield",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Reservoir",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Chestnut Hill",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Newton Centre",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Newton Highlands",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Eliot",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Waban",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Woodland",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Riverside",
      inlineMap: "Green-D-Trunk-Bottom",
    },
  ],
  "green-b": [
    {
      name: "Government Center",
      inlineMap: "Green-B-Trunk-Top",
    },
    {
      name: "Park Street",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "Boylston",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "Arlington",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "Copley",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "Hynes Convention Center",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "Kenmore",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "Blandford Street",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "Boston University East",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "Boston University Central",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "Amory Street",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "Babcock Street",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "Packard's Corner",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "Harvard Avenue",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "Griggs Street",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "Allston Street",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "Warren Street",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "Washington Street",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "Sutherland Road",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "Chiswick Road",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "Chestnut Hill Avenue",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "South Street",
      inlineMap: "Green-B-Trunk-Middle",
    },
    {
      name: "Boston College",
      inlineMap: "Green-B-Trunk-Bottom",
    },
  ],
  "green-c": [
    {
      name: "Government Center",
      inlineMap: "Green-C-Trunk-Top",
    },
    {
      name: "Park Street",
      inlineMap: "Green-C-Trunk-Middle",
    },
    {
      name: "Boylston",
      inlineMap: "Green-C-Trunk-Middle",
    },
    {
      name: "Arlington",
      inlineMap: "Green-C-Trunk-Middle",
    },
    {
      name: "Copley",
      inlineMap: "Green-C-Trunk-Middle",
    },
    {
      name: "Hynes Convention Center",
      inlineMap: "Green-C-Trunk-Middle",
    },
    {
      name: "Kenmore",
      inlineMap: "Green-C-Trunk-Middle",
    },
    {
      name: "Saint Mary's Street",
      inlineMap: "Green-C-Trunk-Middle",
    },
    {
      name: "Hawes Street",
      inlineMap: "Green-C-Trunk-Middle",
    },
    {
      name: "Kent Street",
      inlineMap: "Green-C-Trunk-Middle",
    },
    {
      name: "Saint Paul Street",
      inlineMap: "Green-C-Trunk-Middle",
    },
    {
      name: "Coolidge Corner",
      inlineMap: "Green-C-Trunk-Middle",
    },
    {
      name: "Summit Avenue",
      inlineMap: "Green-C-Trunk-Middle",
    },
    {
      name: "Brandon Hall",
      inlineMap: "Green-C-Trunk-Middle",
    },
    {
      name: "Fairbanks Street",
      inlineMap: "Green-C-Trunk-Middle",
    },
    {
      name: "Washington Square",
      inlineMap: "Green-C-Trunk-Middle",
    },
    {
      name: "Tappan Street",
      inlineMap: "Green-C-Trunk-Middle",
    },
    {
      name: "Dean Road",
      inlineMap: "Green-C-Trunk-Middle",
    },
    {
      name: "Englewood Avenue",
      inlineMap: "Green-C-Trunk-Middle",
    },
    {
      name: "Cleveland Circle",
      inlineMap: "Green-C-Trunk-Bottom",
    },
  ],
  "green-d": [
    {
      name: "North Station",
      inlineMap: "Green-D-Trunk-Top",
    },
    {
      name: "Haymarket",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Government Center",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Park Street",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Boylston",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Arlington",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Copley",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Hynes Convention Center",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Kenmore",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Fenway",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Longwood",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Brookline Village",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Brookline Hills",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Beaconsfield",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Reservoir",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Chestnut Hill",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Newton Centre",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Newton Highlands",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Eliot",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Waban",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Woodland",
      inlineMap: "Green-D-Trunk-Middle",
    },
    {
      name: "Riverside",
      inlineMap: "Green-D-Trunk-Bottom",
    },
  ],
  "green-e": [
    {
      name: "Union Square",
      inlineMap: "Green-E-Trunk-Top",
    },
    {
      name: "Lechmere",
      inlineMap: "Green-E-Trunk-Middle",
    },
    {
      name: "Science Park/West End",
      inlineMap: "Green-E-Trunk-Middle",
    },
    {
      name: "North Station",
      inlineMap: "Green-E-Trunk-Middle",
    },
    {
      name: "Haymarket",
      inlineMap: "Green-E-Trunk-Middle",
    },
    {
      name: "Government Center",
      inlineMap: "Green-E-Trunk-Middle",
    },
    {
      name: "Park Street",
      inlineMap: "Green-E-Trunk-Middle",
    },
    {
      name: "Boylston",
      inlineMap: "Green-E-Trunk-Middle",
    },
    {
      name: "Arlington",
      inlineMap: "Green-E-Trunk-Middle",
    },
    {
      name: "Copley",
      inlineMap: "Green-E-Trunk-Middle",
    },
    {
      name: "Prudential",
      inlineMap: "Green-E-Trunk-Middle",
    },
    {
      name: "Symphony",
      inlineMap: "Green-E-Trunk-Middle",
    },
    {
      name: "Northeastern University",
      inlineMap: "Green-E-Trunk-Middle",
    },
    {
      name: "Museum of Fine Arts",
      inlineMap: "Green-E-Trunk-Middle",
    },
    {
      name: "Longwood Medical Area",
      inlineMap: "Green-E-Trunk-Middle",
    },
    {
      name: "Brigham Circle",
      inlineMap: "Green-E-Trunk-Middle",
    },
    {
      name: "Fenwood Road",
      inlineMap: "Green-E-Trunk-Middle",
    },
    {
      name: "Mission Park",
      inlineMap: "Green-E-Trunk-Middle",
    },
    {
      name: "Riverway",
      inlineMap: "Green-E-Trunk-Middle",
    },
    {
      name: "Back of the Hill",
      inlineMap: "Green-E-Trunk-Middle",
    },
    {
      name: "Heath Street",
      inlineMap: "Green-E-Trunk-Bottom",
    },
  ],
  mattapan: [
    {
      name: "Ashmont",
      inlineMap: "Red-Trunk-Top",
    },
    {
      name: "Cedar Grove",
      inlineMap: "Red-Trunk-Middle",
    },
    {
      name: "Butler",
      inlineMap: "Red-Trunk-Middle",
    },
    {
      name: "Milton",
      inlineMap: "Red-Trunk-Middle",
    },
    {
      name: "Central Avenue",
      inlineMap: "Red-Trunk-Middle",
    },
    {
      name: "Valley Road",
      inlineMap: "Red-Trunk-Middle",
    },
    {
      name: "Capen Street",
      inlineMap: "Red-Trunk-Middle",
    },
    {
      name: "Mattapan",
      inlineMap: "Red-Trunk-Bottom",
    }
  ],
};

export default STATION_ORDER_BY_LINE;
