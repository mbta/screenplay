import React, { ComponentType, useState, useMemo, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Spinner,
  Dropdown,
  FormCheck,
} from "react-bootstrap";
import { BoxArrowUpRight, PlusCircleFill } from "react-bootstrap-icons";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import cx from "classnames";
import useSWR, { mutate } from "swr";
import moment from "moment";
import { PaMessage } from "Models/pa_message";
import { useRouteToRouteIDsMap } from "Hooks/useRouteToRouteIDsMap";
import KebabMenu from "Components/KebabMenu";
import { updateExistingPaMessage } from "Utils/api";
import { UpdatePaMessageBody } from "Models/pa_message";
import Toast, { type ToastProps } from "Components/Toast";
import FilterGroup from "./FilterGroup";

type StateFilter = "current" | "future" | "past";

type ServiceType =
  | "All"
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
    () => (params.get("state") as StateFilter) ?? "current",
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

  const { data, isLoading } = usePaMessages({
    serviceTypes,
    stateFilter,
  });

  const shouldShowLoadingState = useDelayedLoadingState(isLoading);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
            <FilterGroup
              header="Filter by message state"
              onFilterSelect={(selected) => {
                const stateFilter = selected.toLowerCase() as StateFilter;
                setStateFilter(stateFilter);
              }}
              selectedFilter={stateFilter.toLowerCase()}
              filters={[
                { label: "Now", value: "current" },
                { label: "Future", value: "future" },
                { label: "Done", value: "past" },
              ]}
            />
            <FilterGroup
              header="Filter by service type"
              onFilterSelect={(selected) => {
                const serviceType = selected as ServiceType;
                if (serviceType === "All") {
                  setServiceTypes([]);
                } else {
                  setServiceTypes([serviceType]);
                }
              }}
              selectedFilter={
                serviceTypes.length === 0 ? "All" : serviceTypes[0]
              }
              filters={[
                { label: "All", value: "All" },
                ...SERVICE_TYPES.map((serviceType) => {
                  return {
                    label: getServiceLabel(serviceType),
                    value: serviceType,
                  };
                }),
              ]}
            />
          </Col>
          <Col className="pa-message-table-container">
            <Row>
              <PaMessageTable
                paMessages={data ?? []}
                isLoading={shouldShowLoadingState}
                stateFilter={stateFilter}
                onUpdate={() => mutate(`/api/pa-messages?${params.toString()}`)}
                setErrorMessage={setErrorMessage}
              />
            </Row>
          </Col>
        </Row>
      </Container>
      <Toast
        variant="warning"
        message={errorMessage}
        onClose={() => {
          setErrorMessage(null);
        }}
      />
    </>
  );
};

interface PaMessageTableProps {
  paMessages: PaMessage[];
  isLoading: boolean;
  stateFilter: StateFilter;
  onUpdate: () => void;
  setErrorMessage: (message: string | null) => void;
}

const PaMessageTable: ComponentType<PaMessageTableProps> = ({
  paMessages,
  isLoading,
  stateFilter,
  onUpdate,
  setErrorMessage,
}: PaMessageTableProps) => {
  const [toastProps, setToastProps] = useState<ToastProps | null>();
  const data = isLoading ? [] : paMessages;
  const showMoreActions = stateFilter == "current";

  return (
    <>
      <table className="pa-message-table">
        <thead>
          <tr>
            <th className="pa-message-table__message">Message</th>
            <th className="pa-message-table__interval">Interval</th>
            <th className="pa-message-table__start-end">Start-End</th>
            {showMoreActions && (
              <>
                <th className="pa-message-table__actions">Actions</th>
                <th className="pa-message-table__kebab"></th>
              </>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((paMessage: PaMessage) => {
            return (
              <PaMessageRow
                key={paMessage.id}
                paMessage={paMessage}
                onEndNow={() => {
                  setToastProps({
                    variant: "info",
                    message: "PA/ESS message has ended, and moved to “Done.”",
                    autoHide: true,
                  });
                  onUpdate();
                }}
                onError={() =>
                  setToastProps({
                    variant: "warning",
                    message: "Something went wrong. Please try again.",
                  })
                }
                showMoreActions={showMoreActions}
                onUpdate={onUpdate}
                setErrorMessage={setErrorMessage}
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
  onEndNow: () => void;
  onError: () => void;
  showMoreActions: boolean;
  onUpdate: () => void;
  setErrorMessage: (message: string | null) => void;
}

const PaMessageRow: ComponentType<PaMessageRowProps> = ({
  paMessage,
  onEndNow,
  onError,
  showMoreActions,
  onUpdate,
  setErrorMessage,
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

  const togglePaused = async (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
    try {
      await updateExistingPaMessage(paMessage.id, {
        paused: !paMessage.paused,
      } as UpdatePaMessageBody);
      onUpdate();
    } catch (error) {
      setErrorMessage((error as Error).message);
    }
  };

  return (
    <tr onClick={() => navigate(`/pa-messages/${paMessage.id}/edit`)}>
      <td className="pa-message-table__message">{paMessage.visual_text}</td>
      <td className="pa-message-table__interval">
        {paMessage.interval_in_minutes} min
      </td>
      <td className="pa-message-table__start-end">
        {start.toLocaleString().replace(",", "")}
        <br />
        {end
          ? end.toLocaleString().replace(",", "")
          : `At end of alert ${paMessage.alert_id}`}
      </td>
      {showMoreActions && (
        <>
          <td className="pa-message-table__actions">
            <div
              className="pause-active-switch-container"
              onClick={togglePaused}
            >
              <FormCheck
                className={"pause-active-switch"}
                type="switch"
                checked={!paMessage.paused}
                onChange={() => {}}
              />
              <div
                className={cx("switch-text", {
                  paused: paMessage.paused,
                  active: !paMessage.paused,
                })}
              >
                {paMessage.paused ? "Paused" : "Active"}
              </div>
            </div>
          </td>
          <td
            onClick={(e) => e.stopPropagation()}
            className="pa-message-table__kebab"
          >
            <KebabMenu>
              <Dropdown.Item
                className="kebab-menu-dropdown__item"
                onClick={() => endMessage(paMessage)}
              >
                End Now
              </Dropdown.Item>
            </KebabMenu>
          </td>
        </>
      )}
    </tr>
  );
};

export default PaMessagesPage;
