import React, { ComponentType, useEffect, useState } from "react";
import "../../../css/screenplay.scss";
import { Place } from "../../models/place";
import { Alert } from "../../models/alert";
import Sidebar from "./Sidebar";
import PlacesPage from "./PlacesPage";
import AlertsPage from "./AlertsPage";
import OverridesPage from "./OverridesPage";

interface Props {
  page: "places" | "alerts" | "overrides";
}

const Dashboard: ComponentType<Props> = (props: Props) => {
  const [places, setPlaces] = useState<Place[]>([]);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => response.json())
      .then((placeList: []) => {
        setPlaces(placeList);
      });
  }, []);

  const visible = {
    places: props.page === "places",
    alerts: props.page === "alerts",
    overrides: props.page === "overrides",
  };

  return (
    <div className="screenplay-container">
      <Sidebar />
      <div className="page-content">
        <PlacesPage places={places} isVisible={visible.places} />
        <AlertsPage alerts={dummyAlerts} isVisible={visible.alerts} />
        <OverridesPage isVisible={visible.overrides} />
      </div>
    </div>
  );
};

const dummyAlerts: Alert[] = [
  {
    id: "1",
    attributes: {
      active_period: [
        {
          end: "2022-10-29T02:30:00-04:00",
          start: "2022-08-28T04:30:00-04:00",
        },
      ],
      informed_entity: [
        {
          route: "Orange",
          route_type: 1,
        },
      ],
    },
  },
  {
    id: "2",
    attributes: {
      active_period: [
        {
          end: "2022-10-30T02:30:00-04:00",
          start: "2022-08-28T04:30:00-04:00",
        },
      ],
      informed_entity: [
        {
          route: "Red",
          route_type: 1,
        },
        {
          route: "Mattapan",
          route_type: 0,
        },
      ],
    },
  },
  {
    id: "3",
    attributes: {
      active_period: [
        {
          end: "2022-10-28T02:30:00-04:00",
          start: "2022-08-27T04:30:00-04:00",
        },
      ],
      informed_entity: [
        {
          route: "Blue",
          route_type: 1,
        },
        {
          route: "Boat",
          route_type: 4,
        },
      ],
    },
  },
  {
    id: "4",
    attributes: {
      active_period: [
        {
          end: "2022-10-28T02:30:00-04:00",
          start: "2022-08-27T04:30:00-04:00",
        },
      ],
      informed_entity: [
        {
          route: "Green-B",
          route_type: 0,
        },
      ],
    },
  },
  {
    id: "5",
    attributes: {
      active_period: [
        {
          end: null,
          start: "2022-08-29T04:30:00-04:00",
        },
      ],
      informed_entity: [
        {
          route: "Green-C",
          route_type: 0,
        },
      ],
    },
  },
  {
    id: "6",
    attributes: {
      active_period: [
        {
          end: null,
          start: "2022-07-29T04:30:00-04:00",
        },
      ],
      informed_entity: [
        {
          route: "Green-D",
          route_type: 0,
        },
      ],
    },
  },
  {
    id: "7",
    attributes: {
      active_period: [
        {
          end: null,
          start: "2022-09-29T04:30:00-04:00",
        },
      ],
      informed_entity: [
        {
          route: "Green-E",
          route_type: 0,
        },
      ],
    },
  },
  {
    id: "8",
    attributes: {
      active_period: [
        {
          end: "2022-09-17T02:30:00-04:00",
          start: "2022-09-16T23:00:00-04:00",
        },
        {
          end: "2022-09-18T02:30:00-04:00",
          start: "2022-09-17T23:00:00-04:00",
        },
        {
          end: "2022-09-19T02:30:00-04:00",
          start: "2022-09-18T23:00:00-04:00",
        },
        {
          end: "2022-09-24T02:30:00-04:00",
          start: "2022-09-23T23:00:00-04:00",
        },
        {
          end: "2022-09-25T02:30:00-04:00",
          start: "2022-09-24T23:00:00-04:00",
        },
        {
          end: "2022-09-26T02:30:00-04:00",
          start: "2022-09-25T23:00:00-04:00",
        },
      ],
      informed_entity: [
        {
          route: "Green-B",
          route_type: 0,
        },
        {
          route: "Green-C",
          route_type: 0,
        },
        {
          route: "Green-D",
          route_type: 0,
        },
        {
          route: "Green-E",
          route_type: 0,
        },
      ],
    },
  },
  {
    id: "9",
    attributes: {
      active_period: [
        {
          end: "2022-09-17T02:30:00-04:00",
          start: "2022-09-16T23:00:00-04:00",
        },
        {
          end: "2022-09-18T02:30:00-04:00",
          start: "2022-09-17T23:00:00-04:00",
        },
        {
          end: "2022-09-19T02:30:00-04:00",
          start: "2022-09-18T23:00:00-04:00",
        },
        {
          end: "2022-09-24T02:30:00-04:00",
          start: "2022-09-23T23:00:00-04:00",
        },
      ],
      informed_entity: [
        {
          route: "Orange",
          route_type: 1,
        },
        {
          route: "CR-something",
          route_type: 2,
        },
      ],
    },
  },
  {
    id: "10",
    attributes: {
      active_period: [
        {
          end: "2022-09-17T02:30:00-04:00",
          start: "2022-08-16T23:00:00-04:00",
        },
        {
          end: "2022-09-18T02:30:00-04:00",
          start: "2022-09-17T23:00:00-04:00",
        },
        {
          end: "2022-09-19T02:30:00-04:00",
          start: "2022-09-18T23:00:00-04:00",
        },
        {
          end: "2022-09-24T02:30:00-04:00",
          start: "2022-09-23T23:00:00-04:00",
        },
      ],
      informed_entity: [
        {
          route: "Red",
          route_type: 1,
        },
        {
          route: "100",
          route_type: 3,
        },
      ],
    },
  },
];

export default Dashboard;
