import React, { ComponentType, useState, useMemo, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  ButtonGroup,
  Button,
  Spinner,
} from "react-bootstrap";
import { PlusCircleFill } from "react-bootstrap-icons";
import { PaMessage } from "Models/pa_message";
import { Link, useSearchParams } from "react-router-dom";
import cx from "classnames";
import useSWR from "swr";
import { useRouteToRouteIDsMap } from "Hooks/useRouteToRouteIDsMap";

type StateFilter = "active" | "future" | "past";

type ServiceType =
  | "Green"
  | "Red"
  | "Orange"
  | "Blue"
  | "Mattapan"
  | "Silver"
  | "Bus";

const SERVICE_TYPES: Array<ServiceType> = [
  "Green",
  "Red",
  "Orange",
  "Blue",
  "Mattapan",
  "Silver",
  "Bus",
];

const getServiceLabel = (serviceType: ServiceType): string => {
  switch (serviceType) {
    case "Silver":
      return "Silver line";
    case "Bus":
      return "Busway";
    default:
      return serviceType;
  }
};

const fetcher = (...args: Parameters<typeof fetch>) =>
  fetch(...args).then((resp) => resp.json());
const usePaMessages = ({
  stateFilter,
  serviceTypes,
}: {
  stateFilter?: StateFilter | null;
  serviceTypes: Array<ServiceType>;
}) => {
  const routeToRouteIds = useRouteToRouteIDsMap();
  const url = useMemo(() => {
    const params = new URLSearchParams();

    if (stateFilter) params.set("state", stateFilter);

    for (const serviceType of serviceTypes) {
      for (const route of routeToRouteIds[serviceType]) {
        params.append("routes[]", route);
      }
    }

    return `/api/pa-messages?${params.toString()}`;
  }, [stateFilter, serviceTypes, routeToRouteIds]);

  return useSWR<PaMessage[]>(url, fetcher, { keepPreviousData: true });
};

const useDelayedLoadingState = (value: boolean, delay = 250) => {
  const [delayedLoadingState, setDelayedLoadingState] =
    useState<boolean>(value);
  useEffect(() => {
    if (value) {
      const timeout = setTimeout(() => {
        setDelayedLoadingState(value);
      }, delay);

      return () => clearTimeout(timeout);
    } else {
      setDelayedLoadingState(value);
    }
  }, [delay, value]);

  return delayedLoadingState;
};

const PaMessagesPage: ComponentType = () => {
  const [params, setParams] = useSearchParams();
  const [stateFilter, setStateFilter] = useState<StateFilter>(
    () => (params.get("state") as StateFilter) ?? "active",
  );
  const [serviceTypes, setServiceTypes] = useState<Array<ServiceType>>(
    () => (params.getAll("serviceTypes[]") as Array<ServiceType>) ?? [],
  );

  useEffect(() => {
    setParams(() => {
      const newParams = new URLSearchParams();
      if (stateFilter) newParams.set("state", stateFilter);
      for (const serviceType of serviceTypes) {
        newParams.append("serviceTypes[]", serviceType);
      }

      return newParams;
    });
  }, [setParams, stateFilter, serviceTypes]);

  const { data, isLoading } = usePaMessages({ serviceTypes, stateFilter });
  const shouldShowLoadingState = useDelayedLoadingState(isLoading);

  return (
    <>
      <div className="pa-message-page-header">PA/ESS Messages</div>
      <Container fluid>
        <Row>
          <Col className="pa-message-filter-selection">
            <section>
              <header>Filter by message state</header>
              <ButtonGroup className="button-group" vertical>
                <Button
                  className={cx("button", { active: stateFilter === "active" })}
                  onClick={() => setStateFilter("active")}
                >
                  Active
                </Button>
                <Button
                  className={cx("button", { active: stateFilter === "future" })}
                  onClick={() => setStateFilter("future")}
                >
                  Future
                </Button>
                <Button
                  className={cx("button", { active: stateFilter === "past" })}
                  onClick={() => setStateFilter("past")}
                >
                  Past
                </Button>
              </ButtonGroup>
            </section>

            <section>
              <header>Filter by service type</header>
              <ButtonGroup className="button-group" vertical>
                <Button
                  className={cx("button", {
                    active: serviceTypes.length === 0,
                  })}
                  onClick={() => setServiceTypes([])}
                >
                  All
                </Button>
                {SERVICE_TYPES.map((serviceType) => (
                  <Button
                    key={serviceType}
                    className={cx("button", {
                      active: serviceTypes.includes(serviceType),
                    })}
                    onClick={() => setServiceTypes([serviceType])}
                  >
                    {getServiceLabel(serviceType)}
                  </Button>
                ))}
              </ButtonGroup>
            </section>
          </Col>
          <Col className="pa-message-table-container">
            <Row className="pa-message-table-action-bar">
              <Col>
                <Link to="/pa-messages/new" className="add-new-button">
                  <PlusCircleFill className="pa-message-table-action-bar__plus" />{" "}
                  Add New
                </Link>
              </Col>
            </Row>
            <Row>
              <PaMessageTable
                paMessages={data ?? []}
                isLoading={shouldShowLoadingState}
              />
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
};

interface PaMessageTableProps {
  paMessages: PaMessage[];
  isLoading: boolean;
}

const PaMessageTable: ComponentType<PaMessageTableProps> = ({
  paMessages,
  isLoading,
}: PaMessageTableProps) => {
  const data = isLoading ? [] : paMessages;

  return (
    <>
      <table className="pa-message-table">
        <thead>
          <tr>
            <th>Message</th>
            <th>Interval</th>
            <th className="pa-message-table__start-end">Start-End</th>
          </tr>
        </thead>
        <tbody>
          {data.map((paMessage: PaMessage) => {
            return <PaMessageRow key={paMessage.id} paMessage={paMessage} />;
          })}
        </tbody>
      </table>
      {data.length == 0 && (
        <div className="pa-message-table__empty">
          {isLoading ? (
            <div className="pa-message-table__loading">
              <Spinner role="status">
                <span className="visually-hidden">Loading...</span>
              </Spinner>
            </div>
          ) : (
            "There are no PA/ESS Messages matching the current filters."
          )}
        </div>
      )}
    </>
  );
};

interface PaMessageRowProps {
  paMessage: PaMessage;
}

const PaMessageRow: ComponentType<PaMessageRowProps> = ({
  paMessage,
}: PaMessageRowProps) => {
  const start = new Date(paMessage.start_datetime);
  const end =
    paMessage.end_datetime === null ? null : new Date(paMessage.end_datetime);

  return (
    <tr>
      <td>{paMessage.visual_text}</td>
      <td>{paMessage.interval_in_minutes} min</td>
      <td className="pa-message-table__start-end">
        {start.toLocaleString().replace(",", "")}
        <br />
        {end && end.toLocaleString().replace(",", "")}
      </td>
      {/* <td>
        <FormCheck />
      </td>
      <td className="pa-message-table__actions">
        <a href="/pa-messages">
          <u>Pause</u>
        </a>
        <a href="/pa-messages">
          <u>Copy</u>
        </a>
      </td> */}
    </tr>
  );
};

export default PaMessagesPage;
