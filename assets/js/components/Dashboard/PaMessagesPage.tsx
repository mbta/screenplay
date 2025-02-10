import React, { ComponentType, useState, useMemo, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import { BoxArrowUpRight, PlusCircleFill } from "react-bootstrap-icons";
import { Link, useSearchParams } from "react-router-dom";
import useSWR, { mutate } from "swr";
import { PaMessage } from "Models/pa_message";
import { useRouteToRouteIDsMap } from "Hooks/useRouteToRouteIDsMap";
import Toast, { type ToastProps } from "Components/Toast";
import FilterGroup from "./FilterGroup";
import { isPaMessageAdmin } from "Utils/auth";
import MessageTable from "../Tables/MessageTable";
import PaMessageRow from "../Tables/Rows/PaMessageRow";

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
  const isReadOnly = !isPaMessageAdmin();

  const showMoreActions = stateFilter == "current";

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

  const [toastProps, setToastProps] = useState<ToastProps | null>();

  return (
    <>
      <div className="pa-message-page-header">PA/ESS Messages</div>
      <Container fluid>
        <Row>
          <Col className="pa-message-filter-selection">
            <section>
              {!isReadOnly && (
                <Link to="/pa-messages/new" className="add-new-button">
                  <PlusCircleFill className="add-new-icon" /> Add New
                </Link>
              )}
              <Link
                to="https://mbta.splunkcloud.com/en-US/app/search/paess__pa_message_annoucement_log"
                target="_blank"
                className="system-log-link"
              >
                <span className="link-text">Announcement Log</span>
                <BoxArrowUpRight />
              </Link>
              <Link
                to="https://mbta.splunkcloud.com/en-US/app/search/paess_device_status_by_station_clone"
                target="_blank"
                className="system-log-link"
              >
                <span className="link-text">Device Status</span>
                <BoxArrowUpRight />
              </Link>
            </section>
            <FilterGroup
              className="mb-5"
              header="Filter by message state"
              onFilterSelect={(selected) =>
                setStateFilter(selected as StateFilter)
              }
              selectedFilter={stateFilter.toLowerCase()}
              filters={[
                { label: "Live", value: "current" },
                { label: "Future", value: "future" },
                { label: "Past", value: "past" },
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
              <MessageTable
                isLoading={shouldShowLoadingState}
                headers={["Message", "Interval", "Start-End"]}
                addSelectColumn={false}
                addMoreActions={showMoreActions}
                isReadOnly={isReadOnly}
                rows={
                  data
                    ? data.map((paMessage: PaMessage) => {
                        const onUpdate = () => {
                          mutate(`/api/pa-messages?${params.toString()}`);
                        };
                        return (
                          <PaMessageRow
                            key={paMessage.id}
                            paMessage={paMessage}
                            onEndNow={() => {
                              setToastProps({
                                variant: "info",
                                message:
                                  "PA/ESS message has ended, and moved to “Done.”",
                                autoHide: true,
                              });
                              onUpdate();
                            }}
                            onError={() =>
                              setToastProps({
                                variant: "warning",
                                message:
                                  "Something went wrong. Please try again.",
                              })
                            }
                            showMoreActions={showMoreActions}
                            onUpdate={onUpdate}
                            setErrorMessage={setErrorMessage}
                            isReadOnly={isReadOnly}
                          />
                        );
                      })
                    : []
                }
                emptyStateText="There are no PA/ESS Messages matching the current filters."
              />
              {toastProps != null && (
                <Toast
                  {...toastProps}
                  onClose={() => {
                    setToastProps(null);
                  }}
                />
              )}
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

export default PaMessagesPage;
