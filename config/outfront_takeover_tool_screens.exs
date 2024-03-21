import Config

config :screenplay,
  outfront_takeover_tool_screens: %{
    red: [
      %{
        name: "Alewife",
        portrait: true,
        landscape: false,
        sftp_dir_name: "008_RED_ALEWIFE"
      },
      %{
        name: "Davis",
        portrait: true,
        landscape: false,
        sftp_dir_name: "009_RED_DAVIS"
      },
      %{
        name: "Porter",
        portrait: true,
        landscape: false,
        sftp_dir_name: "010_RED_CR_PORTER"
      },
      %{
        name: "Harvard",
        portrait: true,
        landscape: false,
        sftp_dir_name: "011_RED_HARVARD"
      },
      %{
        name: "Central",
        portrait: true,
        landscape: false,
        sftp_dir_name: "012_RED_CENTRAL"
      },
      %{
        name: "Kendall/MIT",
        portrait: true,
        landscape: false,
        sftp_dir_name: "013_RED_KENDALL"
      },
      %{
        name: "Charles/MGH",
        portrait: true,
        landscape: false,
        sftp_dir_name: "014_RED_CHARLES"
      },
      %{
        name: "Park Street",
        portrait: true,
        landscape: false,
        sftp_dir_name: "001_XFER_RED_GREEN_PARK"
      },
      %{
        name: "Downtown Crossing",
        portrait: true,
        landscape: false,
        sftp_dir_name: "002_XFER_RED_ORANGE_SILVER_DOWNTOWNCROSSING"
      },
      %{
        name: "South Station",
        portrait: true,
        landscape: false,
        sftp_dir_name: "003_XFER_RED_SILVER_CR_SOUTHSTATION"
      },
      %{
        name: "Broadway",
        portrait: true,
        landscape: true,
        sftp_dir_name: "015_RED_BROADWAY"
      },
      %{
        name: "Andrew",
        portrait: false,
        landscape: false,
        sftp_dir_name: "016_RED_ANDREW"
      },
      %{
        name: "JFK/UMass",
        portrait: true,
        landscape: false,
        sftp_dir_name: "017_RED_CR_JFKUMASS"
      },
      %{
        name: "Savin Hill",
        portrait: false,
        landscape: false,
        sftp_dir_name: "018_A_RED_SAVINHILL"
      },
      %{
        name: "Fields Corner",
        portrait: false,
        landscape: false,
        sftp_dir_name: "019_A_RED_FIELDSCORNER"
      },
      %{
        name: "Shawmut",
        portrait: false,
        landscape: false,
        sftp_dir_name: "020_A_RED_SHAWMUT"
      },
      %{
        name: "ASHMONT",
        portrait: false,
        landscape: false,
        sftp_dir_name: "021_A_RED_ASHMONT"
      },
      %{
        name: "North Quincy",
        portrait: false,
        landscape: false,
        sftp_dir_name: "022_B_RED_NORTHQUINCY"
      },
      %{
        name: "Wollaston",
        portrait: false,
        landscape: false,
        sftp_dir_name: "023_B_RED_WOLLASTON"
      },
      %{
        name: "Quincy Center",
        portrait: true,
        landscape: true,
        sftp_dir_name: "024_B_RED_CR_QUINCYCENTER"
      },
      %{
        name: "Quincy Adams",
        portrait: false,
        landscape: false,
        sftp_dir_name: "025_B_RED_QUINCYADAMS"
      },
      %{
        name: "BRAINTREE",
        portrait: false,
        landscape: false,
        sftp_dir_name: "026_B_RED_CR_BRAINTREE"
      }
    ],
    orange: [
      %{
        name: "Oak Grove",
        portrait: false,
        landscape: false,
        sftp_dir_name: "034_ORANGE_OAKGROVE"
      },
      %{
        name: "Malden Center",
        portrait: true,
        landscape: true,
        sftp_dir_name: "035_ORANGE_CR_MALDENCENTER"
      },
      %{
        name: "Wellington",
        portrait: true,
        landscape: false,
        sftp_dir_name: "036_ORANGE_WELLINGTON"
      },
      %{
        name: "Assembly",
        portrait: false,
        landscape: false,
        sftp_dir_name: "037_ORANGE_ASSEMBLY"
      },
      %{
        name: "Sullivan Square",
        portrait: true,
        landscape: true,
        sftp_dir_name: "038_ORANGE_SULLIVAN"
      },
      %{
        name: "Community College",
        portrait: false,
        landscape: false,
        sftp_dir_name: "039_ORANGE_COMMUNITYCOLLEGE"
      },
      %{
        name: "North Station",
        portrait: true,
        landscape: false,
        sftp_dir_name: "004_XFER_ORANGE_GREEN_CR_NORTHSTATION"
      },
      %{
        name: "Haymarket",
        portrait: true,
        landscape: true,
        sftp_dir_name: "005_XFER_ORANGE_GREEN_HAYMARKET"
      },
      %{
        name: "State",
        portrait: true,
        landscape: false,
        sftp_dir_name: "006_XFER_ORANGE_BLUE_STATE"
      },
      %{
        name: "Downtown Crossing",
        portrait: true,
        landscape: false,
        sftp_dir_name: "002_XFER_RED_ORANGE_SILVER_DOWNTOWNCROSSING"
      },
      %{
        name: "Chinatown",
        portrait: false,
        landscape: false,
        sftp_dir_name: "040_ORANGE_SILVER_CHINATOWN"
      },
      %{
        name: "Tufts Medical Center",
        portrait: true,
        landscape: true,
        sftp_dir_name: "041_ORANGE_SILVER_TUFTSMEDICAL"
      },
      %{
        name: "Back Bay",
        portrait: true,
        landscape: true,
        sftp_dir_name: "042_ORANGE_CR_BACKBAY"
      },
      %{
        name: "Massachusetts Avenue",
        portrait: true,
        landscape: false,
        sftp_dir_name: "043_ORANGE_MASSAVE"
      },
      %{
        name: "Ruggles",
        portrait: true,
        landscape: false,
        sftp_dir_name: "044_ORANGE_CR_RUGGLES"
      },
      %{
        name: "Roxbury Crossing",
        portrait: false,
        landscape: false,
        sftp_dir_name: "045_ORANGE_ROXBURYCROSSING"
      },
      %{
        name: "Jackson Square",
        portrait: false,
        landscape: false,
        sftp_dir_name: "046_ORANGE_JACKSON"
      },
      %{
        name: "Stony Brook",
        portrait: false,
        landscape: false,
        sftp_dir_name: "047_ORANGE_STONYBROOK"
      },
      %{
        name: "Green Street",
        portrait: false,
        landscape: false,
        sftp_dir_name: "048_ORANGE_GREENST"
      },
      %{
        name: "Forest Hills",
        portrait: true,
        landscape: false,
        sftp_dir_name: "049_ORANGE_CR_FORESTHILLS"
      }
    ],
    blue: [
      %{
        name: "Bowdoin",
        portrait: false,
        landscape: false,
        sftp_dir_name: "059_BLUE_BOWDOIN"
      },
      %{
        name: "Government Center",
        portrait: true,
        landscape: false,
        sftp_dir_name: "007_XFER_BLUE_GREEN_GOVERNMENTCENTER"
      },
      %{
        name: "State",
        portrait: true,
        landscape: false,
        sftp_dir_name: "006_XFER_ORANGE_BLUE_STATE"
      },
      %{
        name: "Aquarium",
        portrait: false,
        landscape: true,
        sftp_dir_name: "058_BLUE_AQUARIUM"
      },
      %{
        name: "Maverick",
        portrait: true,
        landscape: true,
        sftp_dir_name: "057_BLUE_MAVERICK"
      },
      %{
        name: "Airport",
        portrait: true,
        landscape: true,
        sftp_dir_name: "056_BLUE_SILVER_AIRPORT"
      },
      %{
        name: "Wood Island",
        portrait: false,
        landscape: false,
        sftp_dir_name: "055_BLUE_WOODISLAND"
      },
      %{
        name: "Orient Heights",
        portrait: false,
        landscape: false,
        sftp_dir_name: "054_BLUE_ORIENTHEIGHTS"
      },
      %{
        name: "Suffolk Downs",
        portrait: false,
        landscape: false,
        sftp_dir_name: "053_BLUE_SUFFOLKDOWNS"
      },
      %{
        name: "Beachmont",
        portrait: false,
        landscape: false,
        sftp_dir_name: "052_BLUE_BEACHMONT"
      },
      %{
        name: "Revere Beach",
        portrait: false,
        landscape: false,
        sftp_dir_name: "051_BLUE_REVEREBEACH"
      },
      %{
        name: "Wonderland",
        portrait: false,
        landscape: false,
        sftp_dir_name: "050_BLUE_WONDERLAND"
      }
    ],
    silver: [
      %{
        name: "World Trade Center",
        portrait: false,
        landscape: true,
        sftp_dir_name: "125_1_2_3_SILVER_WORLDTRADE"
      }
    ],
    green: [
      %{
        name: "North Station",
        portrait: true,
        landscape: false,
        sftp_dir_name: "004_XFER_ORANGE_GREEN_CR_NORTHSTATION"
      },
      %{
        name: "Haymarket",
        portrait: true,
        landscape: true,
        sftp_dir_name: "005_XFER_ORANGE_GREEN_HAYMARKET"
      },
      %{
        name: "Government Center",
        portrait: true,
        landscape: false,
        sftp_dir_name: "007_XFER_BLUE_GREEN_GOVERNMENTCENTER"
      },
      %{
        name: "Park Street",
        portrait: true,
        landscape: false,
        sftp_dir_name: "001_XFER_RED_GREEN_PARK"
      },
      %{
        name: "Boylston",
        portrait: true,
        landscape: false,
        sftp_dir_name: "062_GREEN_SILVER_BOYLSTON"
      },
      %{
        name: "Arlington",
        portrait: true,
        landscape: false,
        sftp_dir_name: "063_GREEN_ARLINGTON"
      },
      %{
        name: "Copley",
        portrait: true,
        landscape: false,
        sftp_dir_name: "064_GREEN_COPLEY"
      },
      %{
        name: "Hynes Convention Center",
        portrait: false,
        landscape: false,
        sftp_dir_name: "065_GREEN_HYNES"
      },
      %{
        name: "Kenmore",
        portrait: true,
        landscape: true,
        sftp_dir_name: "066_GREEN_KENMORE"
      },
      %{
        name: "Prudential",
        portrait: false,
        landscape: true,
        sftp_dir_name: "111_E_GREEN_PRUDENTIAL"
      },
      %{
        name: "Symphony",
        portrait: false,
        landscape: false,
        sftp_dir_name: "112_E_GREEN_SYMPHONY"
      }
    ]
  }
