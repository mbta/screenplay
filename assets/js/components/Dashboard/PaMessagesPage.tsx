import React, { ComponentType, useState, useMemo, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  ButtonGroup,
  Button,
  Spinner,
  Dropdown,
} from "react-bootstrap";
import { BoxArrowUpRight, PlusCircleFill } from "react-bootstrap-icons";
import { PaMessage } from "Models/pa_message";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import cx from "classnames";
import useSWR from "swr";
import { useRouteToRouteIDsMap } from "Hooks/useRouteToRouteIDsMap";
import ThreeDotsDropdown from "./ThreeDotsDropdown";
import { updateExistingPaMessage } from "Utils/api";
import Toast from "Components/Toast";
import moment from "moment";

type StateFilter = "active" | "future" | "done";

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

  const { data, isLoading, mutate } = usePaMessages({
    serviceTypes,
    stateFilter,
  });

  const shouldShowLoadingState = useDelayedLoadingState(isLoading);

  return (
    <>
      <div className="pa-message-page-header">PA/ESS Messages</div>
      <Container fluid>
        <Row>
          <Col className="pa-message-filter-selection">
            <section>
              <Link to="/pa-messages/new" className="add-new-button">
                <PlusCircleFill className="add-new-icon" /> Add New
              </Link>
              <Link
                to="https://mbta.splunkcloud.com/en-US/app/search/paess__pa_message_annoucement_log"
                target="_blank"
                className="system-log-link"
              >
                <span className="link-text">System Log</span>
                <BoxArrowUpRight />
              </Link>
            </section>
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
                  className={cx("button", { active: stateFilter === "done" })}
                  onClick={() => setStateFilter("done")}
                >
                  Done
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
            <Row>
              <PaMessageTable
                paMessages={data ?? []}
                isLoading={shouldShowLoadingState}
                filter={stateFilter}
                updateData={() => mutate()}
              />
            </Row>
          </Col>
        </Row>
      </Container>
    </>
  );
};

type ToastProps = {
  variant: "info" | "warning";
  message: string;
  autoHide?: boolean;
};

interface PaMessageTableProps {
  paMessages: PaMessage[];
  isLoading: boolean;
  filter: "active" | "future" | "done";
  updateData: () => void;
}

const PaMessageTable: ComponentType<PaMessageTableProps> = ({
  paMessages,
  isLoading,
  filter,
  updateData,
}: PaMessageTableProps) => {
  const [toastProps, setToastProps] = useState<ToastProps | null>();
  const data = isLoading ? [] : paMessages;

  return (
    <>
      <table className="pa-message-table">
        <thead>
          <tr>
            <th>Message</th>
            <th>Interval</th>
            <th className="pa-message-table__start-end">Start-End</th>
            {filter === "active" && <th></th>}
          </tr>
        </thead>
        <tbody>
          {data.map((paMessage: PaMessage) => {
            return (
              <PaMessageRow
                key={paMessage.id}
                paMessage={paMessage}
                filter={filter}
                onEndNow={() => {
                  setToastProps({
                    variant: "info",
                    message: "PA/ESS message has ended, and moved to “Done.",
                    autoHide: true,
                  });
                  updateData();
                }}
                onError={() =>
                  setToastProps({
                    variant: "warning",
                    message: "Something went wrong. Please try again.",
                  })
                }
              />
            );
          })}
        </tbody>
      </table>
      {toastProps != null && (
        <Toast
          {...toastProps}
          onClose={() => {
            setToastProps(null);
          }}
        />
      )}
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
  filter: "active" | "future" | "done";
  onEndNow: () => void;
  onError: () => void;
}

const PaMessageRow: ComponentType<PaMessageRowProps> = ({
  paMessage,
  filter,
  onEndNow,
  onError,
}: PaMessageRowProps) => {
  const navigate = useNavigate();
  const start = new Date(paMessage.start_datetime);
  const end =
    paMessage.end_datetime === null ? null : new Date(paMessage.end_datetime);

  const endMessage = (paMessage: PaMessage) => {
    updateExistingPaMessage(paMessage.id, {
      ...paMessage,
      end_datetime: moment().utc().add(-1, "second").toISOString(),
    }).then(({ status }) => {
      if (status === 200) {
        onEndNow();
      } else {
        onError();
      }
    });
  };

  return (
    <>
      <tr onClick={() => navigate(`/pa-messages/${paMessage.id}/edit`)}>
        <td>{paMessage.visual_text}</td>
        <td>{paMessage.interval_in_minutes} min</td>
        <td className="pa-message-table__start-end">
          {start.toLocaleString().replace(",", "")}
          <br />
          {end && end.toLocaleString().replace(",", "")}
        </td>
        {filter === "active" && (
          <td onClick={(e) => e.stopPropagation()}>
            <ThreeDotsDropdown>
              <Dropdown.Item
                className="three-dots-vertical-dropdown__item"
                onClick={() => endMessage(paMessage)}
              >
                End Now
              </Dropdown.Item>
            </ThreeDotsDropdown>
          </td>
        )}
      </tr>
    </>
  );
};

export default PaMessagesPage;
