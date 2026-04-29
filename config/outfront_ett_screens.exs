import Config

config :screenplay,
  landscape_dir: "Landscape",
  portrait_dir: "Portrait",
  outfront_ett_screens: %{
    red: [
      %{
        place_id: "place-alfcl",
        portrait: true,
        landscape: false,
        sftp_dir_name: "008_RED_ALEWIFE"
      },
      %{
        place_id: "place-davis",
        portrait: true,
        landscape: false,
        sftp_dir_name: "009_RED_DAVIS"
      },
      %{
        place_id: "place-portr",
        portrait: true,
        landscape: false,
        sftp_dir_name: "010_RED_CR_PORTER"
      },
      %{
        place_id: "place-harsq",
        portrait: true,
        landscape: false,
        sftp_dir_name: "011_RED_HARVARD"
      },
      %{
        place_id: "place-cntsq",
        portrait: true,
        landscape: false,
        sftp_dir_name: "012_RED_CENTRAL"
      },
      %{
        place_id: "place-knncl",
        portrait: true,
        landscape: true,
        sftp_dir_name: "013_RED_KENDALL"
      },
      %{
        place_id: "place-chmnl",
        portrait: true,
        landscape: false,
        sftp_dir_name: "014_RED_CHARLES"
      },
      %{
        place_id: "place-pktrm",
        portrait: true,
        landscape: true,
        sftp_dir_name: "001_XFER_RED_GREEN_PARK"
      },
      %{
        place_id: "place-dwnxg",
        portrait: true,
        landscape: false,
        sftp_dir_name: "002_XFER_RED_ORANGE_SILVER_DOWNTOWNCROSSING"
      },
      %{
        place_id: "place-sstat",
        portrait: true,
        landscape: true,
        sftp_dir_name: "003_XFER_RED_SILVER_CR_SOUTHSTATION"
      },
      %{
        place_id: "place-brdwy",
        portrait: true,
        landscape: true,
        sftp_dir_name: "015_RED_BROADWAY"
      },
      %{
        place_id: "place-andrw",
        portrait: false,
        landscape: false,
        sftp_dir_name: "016_RED_ANDREW"
      },
      %{
        place_id: "place-jfk",
        portrait: true,
        landscape: false,
        sftp_dir_name: "017_RED_CR_JFKUMASS"
      },
      %{
        place_id: "place-shmnl",
        portrait: false,
        landscape: false,
        sftp_dir_name: "018_A_RED_SAVINHILL"
      },
      %{
        place_id: "place-fldcr",
        portrait: false,
        landscape: false,
        sftp_dir_name: "019_A_RED_FIELDSCORNER"
      },
      %{
        place_id: "place-smmnl",
        portrait: false,
        landscape: false,
        sftp_dir_name: "020_A_RED_SHAWMUT"
      },
      %{
        place_id: "place-asmnl",
        portrait: false,
        landscape: false,
        sftp_dir_name: "021_A_RED_ASHMONT"
      },
      %{
        place_id: "place-nqncy",
        portrait: false,
        landscape: false,
        sftp_dir_name: "022_B_RED_NORTHQUINCY"
      },
      %{
        place_id: "place-wlsta",
        portrait: false,
        landscape: false,
        sftp_dir_name: "023_B_RED_WOLLASTON"
      },
      %{
        place_id: "place-qnctr",
        portrait: true,
        landscape: true,
        sftp_dir_name: "024_B_RED_CR_QUINCYCENTER"
      },
      %{
        place_id: "place-qamnl",
        portrait: false,
        landscape: false,
        sftp_dir_name: "025_B_RED_QUINCYADAMS"
      },
      %{
        place_id: "place-brntn",
        portrait: false,
        landscape: false,
        sftp_dir_name: "026_B_RED_CR_BRAINTREE"
      }
    ],
    orange: [
      %{
        place_id: "place-ogmnl",
        portrait: false,
        landscape: false,
        sftp_dir_name: "034_ORANGE_OAKGROVE"
      },
      %{
        place_id: "place-mlmnl",
        portrait: true,
        landscape: true,
        sftp_dir_name: "035_ORANGE_CR_MALDENCENTER"
      },
      %{
        place_id: "place-welln",
        portrait: true,
        landscape: false,
        sftp_dir_name: "036_ORANGE_WELLINGTON"
      },
      %{
        place_id: "place-astao",
        portrait: false,
        landscape: false,
        sftp_dir_name: "037_ORANGE_ASSEMBLY"
      },
      %{
        place_id: "place-sull",
        portrait: true,
        landscape: true,
        sftp_dir_name: "038_ORANGE_SULLIVAN"
      },
      %{
        place_id: "place-ccmnl",
        portrait: false,
        landscape: false,
        sftp_dir_name: "039_ORANGE_COMMUNITYCOLLEGE"
      },
      %{
        place_id: "place-north",
        portrait: true,
        landscape: false,
        sftp_dir_name: "004_XFER_ORANGE_GREEN_CR_NORTHSTATION"
      },
      %{
        place_id: "place-haecl",
        portrait: true,
        landscape: true,
        sftp_dir_name: "005_XFER_ORANGE_GREEN_HAYMARKET"
      },
      %{
        place_id: "place-state",
        portrait: true,
        landscape: false,
        sftp_dir_name: "006_XFER_ORANGE_BLUE_STATE"
      },
      %{
        place_id: "place-dwnxg",
        portrait: true,
        landscape: false,
        sftp_dir_name: "002_XFER_RED_ORANGE_SILVER_DOWNTOWNCROSSING"
      },
      %{
        place_id: "place-chncl",
        portrait: false,
        landscape: false,
        sftp_dir_name: "040_ORANGE_SILVER_CHINATOWN"
      },
      %{
        place_id: "place-tumnl",
        portrait: true,
        landscape: true,
        sftp_dir_name: "041_ORANGE_SILVER_TUFTSMEDICAL"
      },
      %{
        place_id: "place-bbsta",
        portrait: true,
        landscape: true,
        sftp_dir_name: "042_ORANGE_CR_BACKBAY"
      },
      %{
        place_id: "place-masta",
        portrait: true,
        landscape: false,
        sftp_dir_name: "043_ORANGE_MASSAVE"
      },
      %{
        place_id: "place-rugg",
        portrait: true,
        landscape: false,
        sftp_dir_name: "044_ORANGE_CR_RUGGLES"
      },
      %{
        place_id: "place-rcmnl",
        portrait: false,
        landscape: false,
        sftp_dir_name: "045_ORANGE_ROXBURYCROSSING"
      },
      %{
        place_id: "place-jaksn",
        portrait: false,
        landscape: false,
        sftp_dir_name: "046_ORANGE_JACKSON"
      },
      %{
        place_id: "place-sbmnl",
        portrait: false,
        landscape: false,
        sftp_dir_name: "047_ORANGE_STONYBROOK"
      },
      %{
        place_id: "place-grnst",
        portrait: false,
        landscape: false,
        sftp_dir_name: "048_ORANGE_GREENST"
      },
      %{
        place_id: "place-forhl",
        portrait: true,
        landscape: false,
        sftp_dir_name: "049_ORANGE_CR_FORESTHILLS"
      }
    ],
    blue: [
      %{
        place_id: "place-bomnl",
        portrait: false,
        landscape: false,
        sftp_dir_name: "059_BLUE_BOWDOIN"
      },
      %{
        place_id: "place-gover",
        portrait: true,
        landscape: false,
        sftp_dir_name: "007_XFER_BLUE_GREEN_GOVERNMENTCENTER"
      },
      %{
        place_id: "place-state",
        portrait: true,
        landscape: false,
        sftp_dir_name: "006_XFER_ORANGE_BLUE_STATE"
      },
      %{
        place_id: "place-aqucl",
        portrait: false,
        landscape: true,
        sftp_dir_name: "058_BLUE_AQUARIUM"
      },
      %{
        place_id: "place-mvbcl",
        portrait: true,
        landscape: true,
        sftp_dir_name: "057_BLUE_MAVERICK"
      },
      %{
        place_id: "place-aport",
        portrait: true,
        landscape: true,
        sftp_dir_name: "056_BLUE_SILVER_AIRPORT"
      },
      %{
        place_id: "place-wimnl",
        portrait: false,
        landscape: false,
        sftp_dir_name: "055_BLUE_WOODISLAND"
      },
      %{
        place_id: "place-orhte",
        portrait: false,
        landscape: false,
        sftp_dir_name: "054_BLUE_ORIENTHEIGHTS"
      },
      %{
        place_id: "place-sdmnl",
        portrait: false,
        landscape: false,
        sftp_dir_name: "053_BLUE_SUFFOLKDOWNS"
      },
      %{
        place_id: "place-bmmnl",
        portrait: false,
        landscape: false,
        sftp_dir_name: "052_BLUE_BEACHMONT"
      },
      %{
        place_id: "place-rbmnl",
        portrait: false,
        landscape: false,
        sftp_dir_name: "051_BLUE_REVEREBEACH"
      },
      %{
        place_id: "place-wondl",
        portrait: false,
        landscape: false,
        sftp_dir_name: "050_BLUE_WONDERLAND"
      }
    ],
    silver: [
      %{
        place_id: "place-wtcst",
        portrait: false,
        landscape: true,
        sftp_dir_name: "125_1_2_3_SILVER_WORLDTRADE"
      }
    ],
    green: [
      %{
        place_id: "place-north",
        portrait: true,
        landscape: false,
        sftp_dir_name: "004_XFER_ORANGE_GREEN_CR_NORTHSTATION"
      },
      %{
        place_id: "place-haecl",
        portrait: true,
        landscape: true,
        sftp_dir_name: "005_XFER_ORANGE_GREEN_HAYMARKET"
      },
      %{
        place_id: "place-gover",
        portrait: true,
        landscape: false,
        sftp_dir_name: "007_XFER_BLUE_GREEN_GOVERNMENTCENTER"
      },
      %{
        place_id: "place-pktrm",
        portrait: true,
        landscape: true,
        sftp_dir_name: "001_XFER_RED_GREEN_PARK"
      },
      %{
        place_id: "place-boyls",
        portrait: true,
        landscape: false,
        sftp_dir_name: "062_GREEN_SILVER_BOYLSTON"
      },
      %{
        place_id: "place-armnl",
        portrait: true,
        landscape: true,
        sftp_dir_name: "063_GREEN_ARLINGTON"
      },
      %{
        place_id: "place-coecl",
        portrait: true,
        landscape: false,
        sftp_dir_name: "064_GREEN_COPLEY"
      },
      %{
        place_id: "place-hymnl",
        portrait: false,
        landscape: false,
        sftp_dir_name: "065_GREEN_HYNES"
      },
      %{
        place_id: "place-kencl",
        portrait: true,
        landscape: true,
        sftp_dir_name: "066_GREEN_KENMORE"
      },
      %{
        place_id: "place-prmnl",
        portrait: false,
        landscape: true,
        sftp_dir_name: "111_E_GREEN_PRUDENTIAL"
      },
      %{
        place_id: "place-symcl",
        portrait: false,
        landscape: false,
        sftp_dir_name: "112_E_GREEN_SYMPHONY"
      }
    ]
  }
