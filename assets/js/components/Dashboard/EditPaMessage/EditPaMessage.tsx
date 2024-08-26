import React, { useEffect, useMemo, useState } from "react";
import useSWR, { mutate } from "swr";
import { useNavigate, useParams } from "react-router-dom";
import { PaMessage } from "Models/pa_message";
import PaMessageForm from "../PaMessageForm";
import { updateExistingPaMessage } from "Utils/api";
import { Alert } from "Models/alert";
import { AudioPreview } from "Components/PaMessageForm/types";

const useAlert = (id: string | null | undefined) => {
  const { data: alerts, isLoading } = useSWR<Array<Alert>>(
    id ? "/api/alerts/non_access_alerts" : null,
    async (url: string | null) => {
      if (url == null) return [];

      const response = await fetch(url);
      const { alerts } = await response.json();
      return alerts;
    },
  );

  const alert = useMemo(() => {
    if (id == null) return null;
    return alerts?.find((a) => a.id === id);
  }, [id, alerts]);

  return {
    alert,
    isLoading,
  };
};

const usePaMessage = (id: string | number) => {
  const {
    data: paMessage,
    isLoading,
    error,
  } = useSWR<PaMessage>(`/api/pa-messages/${id}`, async (url: string) => {
    const response = await fetch(url);
    const body = await response.json();

    if (400 <= response.status) throw response;
    return body;
  });

  return {
    paMessage,
    isLoading,
    error,
  };
};

const FetchPaMessage = ({ id }: { id: string | number }) => {
  const navigate = useNavigate();
  const { paMessage, isLoading, error } = usePaMessage(id);

  useEffect(() => {
    if (error?.status === 404) navigate("/pa-messages");
  }, [error, navigate]);

  if (isLoading || error || paMessage == null) return null;

  return <FetchAlert paMessage={paMessage} />;
};

const FetchAlert = ({ paMessage }: { paMessage: PaMessage }) => {
  const { alert, isLoading } = useAlert(paMessage.alert_id);

  if (isLoading) return null;

  return <EditPaMessage paMessage={paMessage} alert={alert} />;
};

const EditPaMessageContainer = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  useEffect(() => {
    if (!id) navigate("/pa-messages");
  }, [id, navigate]);

  if (!id) return;

  return <FetchPaMessage id={id} />;
};

interface Props {
  paMessage: PaMessage;
  alert?: Alert | null;
}

const EditPaMessage = ({ paMessage, alert }: Props) => {
  const navigate = useNavigate();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  return (
    <PaMessageForm
      key={paMessage.updated_at}
      title="Edit PA/ESS message"
      errors={errors}
      errorMessage={errorMessage}
      onError={setErrorMessage}
      onErrorsChange={setErrors}
      defaultValues={paMessage}
      defaultAlert={alert ?? paMessage.alert_id}
      defaultAudioState={AudioPreview.Reviewed}
      onSubmit={async (data) => {
        const result = await updateExistingPaMessage(paMessage.id, data);

        if (result.status === 200) {
          mutate(`/api/pa-messages/${paMessage.id}`);
          navigate("/pa-messages");
        } else if (result.status === 422) {
          setErrorMessage("Correct the following errors:");
          setErrors(Object.keys(result.body.errors));
        } else {
          setErrorMessage("Something went wrong. Please try again.");
        }
      }}
    />
  );
};

export default EditPaMessageContainer;
