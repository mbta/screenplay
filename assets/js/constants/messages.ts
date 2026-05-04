const CANNED_MESSAGES = [
  {
    id: 1,
    name: "Leave Station",
    text: {
      indoor: "Emergency reported. Use nearest exit.",
      outdoor: "Station is closed. Do not enter.",
    },
    images: {
      indoor: {
        portrait: "LeaveStation-indoor-portrait.gif",
        landscape: "LeaveStation-indoor-landscape.gif",
      },
      outdoor: {
        portrait: "LeaveStation-outdoor-portrait.gif",
        landscape: "LeaveStation-outdoor-landscape.gif",
      },
    },
  },
  {
    id: 2,
    name: "Follow Instructions",
    text: {
      indoor: "Follow emergency personnel instructions.",
      outdoor: "Follow emergency personnel instructions.",
    },
    images: {
      indoor: {
        portrait: "FollowInstructions-portrait.gif",
        landscape: "FollowInstructions-landscape.gif",
      },
      outdoor: {
        portrait: "FollowInstructions-portrait.gif",
        landscape: "FollowInstructions-landscape.gif",
      },
    },
  },
  {
    id: 3,
    name: "Emergency Ended",
    text: {
      indoor: "Station has re-opened.",
      outdoor: "Station has re-opened.",
    },
    images: {
      indoor: {
        portrait: "EmergencyEnded-portrait.gif",
        landscape: "EmergencyEnded-portrait.gif",
      },
      outdoor: {
        portrait: "EmergencyEnded-portrait.gif",
        landscape: "EmergencyEnded-portrait.gif",
      },
    },
  },
  {
    id: 4,
    name: "Test",
    text: {
      indoor: "This is a test of our messaging system.",
      outdoor: "This is a test of our messaging system.",
    },
    images: {
      indoor: {
        portrait: "Test-indoor-portrait.gif",
        landscape: "Test-indoor-landscape.gif",
      },
      outdoor: {
        portrait: "Test-outdoor-portrait.gif",
        landscape: "Test-outdoor-landscape.gif",
      },
    },
  },
];

export default CANNED_MESSAGES;
