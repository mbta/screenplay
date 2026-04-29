import Config

config :screenplay,
  landscape_dir: "Landscape",
  portrait_dir: "Portrait",
  outfront_takeover_screens: %{
    red: [
      %{
        place_id: "place-alfcl",
        name: "Alewife",
        portrait: true,
        landscape: false,
        sftp_dir_name: "008_RED_ALEWIFE"
      },
      %{
        place_id: "place-davis",
        name: "Davis",
        portrait: true,
        landscape: false,
        sftp_dir_name: "009_RED_DAVIS"
      },
      %{
        place_id: "place-portr",
        name: "Porter",
        portrait: true,
        landscape: false,
        sftp_dir_name: "010_RED_CR_PORTER"
      },
      %{
        place_id: "place-harsq",
        name: "Harvard",
        portrait: true,
        landscape: false,
        sftp_dir_name: "011_RED_HARVARD"
      },
      %{
        place_id: "place-cntsq",
        name: "Central",
        portrait: true,
        landscape: false,
        sftp_dir_name: "012_RED_CENTRAL"
      },
      %{
        place_id: "place-knncl",
        name: "Kendall/MIT",
        portrait: true,
        landscape: true,
        sftp_dir_name: "013_RED_KENDALL"
      },
      %{
        place_id: "place-chmnl",
        name: "Charles/MGH",
        portrait: true,
        landscape: false,
        sftp_dir_name: "014_RED_CHARLES"
      },
      %{
        place_id: "place-pktrm",
        name: "Park Street",
        portrait: true,
        landscape: true,
        sftp_dir_name: "001_XFER_RED_GREEN_PARK"
      },
      %{
        place_id: "place-dwnxg",
        name: "Downtown Crossing",
        portrait: true,
        landscape: false,
        sftp_dir_name: "002_XFER_RED_ORANGE_SILVER_DOWNTOWNCROSSING"
      },
      %{
        place_id: "place-sstat",
        name: "South Station",
        portrait: true,
        landscape: true,
        sftp_dir_name: "003_XFER_RED_SILVER_CR_SOUTHSTATION"
      },
      %{
        place_id: "place-brdwy",
        name: "Broadway",
        portrait: true,
        landscape: true,
        sftp_dir_name: "015_RED_BROADWAY"
      },
      %{
        place_id: "place-andrw",
        name: "Andrew",
        portrait: false,
        landscape: false,
        sftp_dir_name: "016_RED_ANDREW"
      },
      %{
        place_id: "place-jfk",
        name: "JFK/UMass",
        portrait: true,
        landscape: false,
        sftp_dir_name: "017_RED_CR_JFKUMASS"
      },
      %{
        place_id: "place-shmnl",
        name: "Savin Hill",
        portrait: false,
        landscape: false,
        sftp_dir_name: "018_A_RED_SAVINHILL"
      },
      %{
        place_id: "place-fldcr",
        name: "Fields Corner",
        portrait: false,
        landscape: false,
        sftp_dir_name: "019_A_RED_FIELDSCORNER"
      },
      %{
        place_id: "place-smmnl",
        name: "Shawmut",
        portrait: false,
        landscape: false,
        sftp_dir_name: "020_A_RED_SHAWMUT"
      },
      %{
        place_id: "place-asmnl",
        name: "Ashmont",
        portrait: false,
        landscape: false,
        sftp_dir_name: "021_A_RED_ASHMONT"
      },
      %{
        place_id: "place-nqncy",
        name: "North Quincy",
        portrait: false,
        landscape: false,
        sftp_dir_name: "022_B_RED_NORTHQUINCY"
      },
      %{
        place_id: "place-wlsta",
        name: "Wollaston",
        portrait: false,
        landscape: false,
        sftp_dir_name: "023_B_RED_WOLLASTON"
      },
      %{
        place_id: "place-qnctr",
        name: "Quincy Center",
        portrait: true,
        landscape: true,
        sftp_dir_name: "024_B_RED_CR_QUINCYCENTER"
      },
      %{
        place_id: "place-qamnl",
        name: "Quincy Adams",
        portrait: false,
        landscape: false,
        sftp_dir_name: "025_B_RED_QUINCYADAMS"
      },
      %{
        place_id: "place-brntn",
        name: "Braintree",
        portrait: false,
        landscape: false,
        sftp_dir_name: "026_B_RED_CR_BRAINTREE"
      }
    ],
    orange: [
      %{
        place_id: "place-ogmnl",
        name: "Oak Grove",
        portrait: false,
        landscape: false,
        sftp_dir_name: "034_ORANGE_OAKGROVE"
      },
      %{
        place_id: "place-mlmnl",
        name: "Malden Center",
        portrait: true,
        landscape: true,
        sftp_dir_name: "035_ORANGE_CR_MALDENCENTER"
      },
      %{
        place_id: "place-welln",
        name: "Wellington",
        portrait: true,
        landscape: false,
        sftp_dir_name: "036_ORANGE_WELLINGTON"
      },
      %{
        place_id: "place-astao",
        name: "Assembly",
        portrait: false,
        landscape: false,
        sftp_dir_name: "037_ORANGE_ASSEMBLY"
      },
      %{
        place_id: "place-sull",
        name: "Sullivan Square",
        portrait: true,
        landscape: true,
        sftp_dir_name: "038_ORANGE_SULLIVAN"
      },
      %{
        place_id: "place-ccmnl",
        name: "Community College",
        portrait: false,
        landscape: false,
        sftp_dir_name: "039_ORANGE_COMMUNITYCOLLEGE"
      },
      %{
        place_id: "place-north",
        name: "North Station",
        portrait: true,
        landscape: false,
        sftp_dir_name: "004_XFER_ORANGE_GREEN_CR_NORTHSTATION"
      },
      %{
        place_id: "place-haecl",
        name: "Haymarket",
        portrait: true,
        landscape: true,
        sftp_dir_name: "005_XFER_ORANGE_GREEN_HAYMARKET"
      },
      %{
        place_id: "place-state",
        name: "State",
        portrait: true,
        landscape: false,
        sftp_dir_name: "006_XFER_ORANGE_BLUE_STATE"
      },
      %{
        place_id: "place-dwnxg",
        name: "Downtown Crossing",
        portrait: true,
        landscape: false,
        sftp_dir_name: "002_XFER_RED_ORANGE_SILVER_DOWNTOWNCROSSING"
      },
      %{
        place_id: "place-chncl",
        name: "Chinatown",
        portrait: false,
        landscape: false,
        sftp_dir_name: "040_ORANGE_SILVER_CHINATOWN"
      },
      %{
        place_id: "place-tumnl",
        name: "Tufts Medical Center",
        portrait: true,
        landscape: true,
        sftp_dir_name: "041_ORANGE_SILVER_TUFTSMEDICAL"
      },
      %{
        place_id: "place-bbsta",
        name: "Back Bay",
        portrait: true,
        landscape: true,
        sftp_dir_name: "042_ORANGE_CR_BACKBAY"
      },
      %{
        place_id: "place-masta",
        name: "Massachusetts Avenue",
        portrait: true,
        landscape: false,
        sftp_dir_name: "043_ORANGE_MASSAVE"
      },
      %{
        place_id: "place-rugg",
        name: "Ruggles",
        portrait: true,
        landscape: false,
        sftp_dir_name: "044_ORANGE_CR_RUGGLES"
      },
      %{
        place_id: "place-rcmnl",
        name: "Roxbury Crossing",
        portrait: false,
        landscape: false,
        sftp_dir_name: "045_ORANGE_ROXBURYCROSSING"
      },
      %{
        place_id: "place-jaksn",
        name: "Jackson Square",
        portrait: false,
        landscape: false,
        sftp_dir_name: "046_ORANGE_JACKSON"
      },
      %{
        place_id: "place-sbmnl",
        name: "Stony Brook",
        portrait: false,
        landscape: false,
        sftp_dir_name: "047_ORANGE_STONYBROOK"
      },
      %{
        place_id: "place-grnst",
        name: "Green Street",
        portrait: false,
        landscape: false,
        sftp_dir_name: "048_ORANGE_GREENST"
      },
      %{
        place_id: "place-forhl",
        name: "Forest Hills",
        portrait: true,
        landscape: false,
        sftp_dir_name: "049_ORANGE_CR_FORESTHILLS"
      }
    ],
    blue: [
      %{
        place_id: "place-bomnl",
        name: "Bowdoin",
        portrait: false,
        landscape: false,
        sftp_dir_name: "059_BLUE_BOWDOIN"
      },
      %{
        place_id: "place-gover",
        name: "Government Center",
        portrait: true,
        landscape: false,
        sftp_dir_name: "007_XFER_BLUE_GREEN_GOVERNMENTCENTER"
      },
      %{
        place_id: "place-state",
        name: "State",
        portrait: true,
        landscape: false,
        sftp_dir_name: "006_XFER_ORANGE_BLUE_STATE"
      },
      %{
        place_id: "place-aquar",
        name: "Aquarium",
        portrait: false,
        landscape: true,
        sftp_dir_name: "058_BLUE_AQUARIUM"
      },
      %{
        place_id: "place-mvbcl",
        name: "Maverick",
        portrait: true,
        landscape: true,
        sftp_dir_name: "057_BLUE_MAVERICK"
      },
      %{
        place_id: "place-aport",
        name: "Airport",
        portrait: true,
        landscape: true,
        sftp_dir_name: "056_BLUE_SILVER_AIRPORT"
      },
      %{
        place_id: "place-wimnl",
        name: "Wood Island",
        portrait: false,
        landscape: false,
        sftp_dir_name: "055_BLUE_WOODISLAND"
      },
      %{
        place_id: "place-orhte",
        name: "Orient Heights",
        portrait: false,
        landscape: false,
        sftp_dir_name: "054_BLUE_ORIENTHEIGHTS"
      },
      %{
        place_id: "place-sdmnl",
        name: "Suffolk Downs",
        portrait: false,
        landscape: false,
        sftp_dir_name: "053_BLUE_SUFFOLKDOWNS"
      },
      %{
        place_id: "place-bmmnl",
        name: "Beachmont",
        portrait: false,
        landscape: false,
        sftp_dir_name: "052_BLUE_BEACHMONT"
      },
      %{
        place_id: "place-rbmnl",
        name: "Revere Beach",
        portrait: false,
        landscape: false,
        sftp_dir_name: "051_BLUE_REVEREBEACH"
      },
      %{
        place_id: "place-wondl",
        name: "Wonderland",
        portrait: false,
        landscape: false,
        sftp_dir_name: "050_BLUE_WONDERLAND"
      }
    ],
    silver: [
      %{
        place_id: "place-wtcst",
        name: "World Trade Center",
        portrait: false,
        landscape: true,
        sftp_dir_name: "125_1_2_3_SILVER_WORLDTRADE"
      }
    ],
    green: [
      %{
        place_id: "place-north",
        name: "North Station",
        portrait: true,
        landscape: false,
        sftp_dir_name: "004_XFER_ORANGE_GREEN_CR_NORTHSTATION"
      },
      %{
        place_id: "place-haecl",
        name: "Haymarket",
        portrait: true,
        landscape: true,
        sftp_dir_name: "005_XFER_ORANGE_GREEN_HAYMARKET"
      },
      %{
        place_id: "place-gover",
        name: "Government Center",
        portrait: true,
        landscape: false,
        sftp_dir_name: "007_XFER_BLUE_GREEN_GOVERNMENTCENTER"
      },
      %{
        place_id: "place-pktrm",
        name: "Park Street",
        portrait: true,
        landscape: true,
        sftp_dir_name: "001_XFER_RED_GREEN_PARK"
      },
      %{
        place_id: "place-boyls",
        name: "Boylston",
        portrait: true,
        landscape: false,
        sftp_dir_name: "062_GREEN_SILVER_BOYLSTON"
      },
      %{
        place_id: "place-armnl",
        name: "Arlington",
        portrait: true,
        landscape: true,
        sftp_dir_name: "063_GREEN_ARLINGTON"
      },
      %{
        place_id: "place-coecl",
        name: "Copley",
        portrait: true,
        landscape: false,
        sftp_dir_name: "064_GREEN_COPLEY"
      },
      %{
        place_id: "place-hymnl",
        name: "Hynes Convention Center",
        portrait: false,
        landscape: false,
        sftp_dir_name: "065_GREEN_HYNES"
      },
      %{
        place_id: "place-kencl",
        name: "Kenmore",
        portrait: true,
        landscape: true,
        sftp_dir_name: "066_GREEN_KENMORE"
      },
      %{
        place_id: "place-prmnl",
        name: "Prudential",
        portrait: false,
        landscape: true,
        sftp_dir_name: "111_E_GREEN_PRUDENTIAL"
      },
      %{
        place_id: "place-symcl",
        name: "Symphony",
        portrait: false,
        landscape: false,
        sftp_dir_name: "112_E_GREEN_SYMPHONY"
      }
    ]
  }
