import React, { ComponentType, useState, useMemo, useEffect } from "react";
import { BoxArrowUpRight, PlusCircleFill } from "react-bootstrap-icons";
import { Link, useSearchParams } from "react-router-dom";
import useSWR, { mutate } from "swr";
import { PaMessage } from "Models/pa_message";
import { useRouteToRouteIDsMap } from "Hooks/useRouteToRouteIDsMap";
import Toast, { type ToastProps } from "Components/Toast";
import { isPaMessageAdmin } from "Utils/auth";
import MessageTable from "../Tables/MessageTable";
import PaMessageRow from "../Tables/Rows/PaMessageRow";
import { RadioList } from "./RadioList";
import * as styles from "Styles/pa-messages.module.scss";
import cx from "classnames";

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

  const showMoreActions = stateFilter === "current";

  useEffect(() => {
    const newParams = new URLSearchParams();
    if (stateFilter) newParams.set("state", stateFilter);
    for (const serviceType of serviceTypes) {
      newParams.append("serviceTypes[]", serviceType);
    }
    setParams(newParams, { replace: true });
  }, [setParams, stateFilter, serviceTypes]);

  const { data, isLoading } = usePaMessages({
    serviceTypes,
    stateFilter,
  });

  const shouldShowLoadingState = useDelayedLoadingState(isLoading);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [toastProps, setToastProps] = useState<ToastProps | null>(null);

  return (
    <div className="mx-5 my-4">
      <h1 className="mb-5">PA/ESS Messages</h1>
      <div className="d-flex gap-5">
        <div style={{ flex: "0 0 200px" }}>
          <section>
            {!isReadOnly && (
              <Link to="/pa-messages/new" className="btn button-primary">
                <PlusCircleFill className="add-new-icon" /> Add New
              </Link>
            )}
            <Link
              to="https://mbta.splunkcloud.com/en-US/app/search/paess__pa_message_annoucement_log"
              target="_blank"
              className={cx(styles.dashboardLink, "d-inline-block mt-3")}
            >
              <span className={styles.text}>Announcement Log</span>
              <BoxArrowUpRight />
            </Link>
            <Link
              to="https://mbta.splunkcloud.com/en-US/app/search/paess_device_status_by_station_clone"
              target="_blank"
              className={cx(styles.dashboardLink, "d-inline-block mt-3 mb-5")}
            >
              <span className={styles.text}>Device Status</span>
              <BoxArrowUpRight />
            </Link>
          </section>
          <div className="mb-2">Filter by message state</div>
          <RadioList<StateFilter>
            className="mb-5"
            value={stateFilter.toLowerCase() as StateFilter}
            onChange={setStateFilter}
            items={[
              { value: "current", content: "Live" },
              { value: "future", content: "Future" },
              { value: "past", content: "Past" },
            ]}
          />
          <div className="mb-2">Filter by service type</div>
          <RadioList<ServiceType[]>
            value={serviceTypes}
            onChange={setServiceTypes}
            items={[
              { value: [], content: "All" },
              { value: ["Green"], content: "Green" },
              { value: ["Red"], content: "Red" },
              { value: ["Orange"], content: "Orange" },
              { value: ["Blue"], content: "Blue" },
              { value: ["Mattapan"], content: "Mattapan" },
              { value: ["Silver"], content: "Silver line" },
              { value: ["Bus"], content: "Busway" },
            ]}
          />
        </div>
        <div style={{ flex: 1 }}>
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
                            message: "Something went wrong. Please try again.",
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
        </div>
        {toastProps !== null && (
          <Toast
            {...toastProps}
            onClose={() => {
              setToastProps(null);
            }}
          />
        )}
      </div>
      <Toast
        variant="warning"
        message={errorMessage}
        onClose={() => {
          setErrorMessage(null);
        }}
      />
    </div>
  );
};

export default PaMessagesPage;
