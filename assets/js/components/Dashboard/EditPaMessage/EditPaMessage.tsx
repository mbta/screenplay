import React, { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import { useNavigate, useParams } from "react-router-dom";
import { PaMessage } from "Models/pa_message";
import PaMessageForm from "../PaMessageForm";
import { updateExistingPaMessage } from "Utils/api";
import { Alert } from "Models/alert";
import { AudioPreview } from "Components/PaMessageForm/types";
import { STATIC_TEMPLATES } from "Components/PaMessageForm/StaticTemplatePage";

interface PaMessageResponse {
  pa_message: PaMessage;
  alert: Alert | null;
}

const usePaMessage = (id: string | number) => {
  const { data, isLoading, error } = useSWR<PaMessageResponse>(
    `/api/pa-messages/${id}`,
    async (url: string) => {
      const response = await fetch(url);
      const body = await response.json();

      if (400 <= response.status) throw response;
      return body;
    },
  );

  return {
    data,
    isLoading,
    error,
  };
};

const FetchPaMessage = ({ id }: { id: string | number }) => {
  const navigate = useNavigate();
  const { data, isLoading, error } = usePaMessage(id);

  useEffect(() => {
    if (error?.status === 404) navigate("/pa-messages");
  }, [error, navigate]);

  if (isLoading || error || data?.pa_message == null) return null;

  return <EditPaMessage paMessage={data.pa_message} alert={data.alert} />;
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
      defaultTemplate={STATIC_TEMPLATES.find(
        (t) => t.id === paMessage.template_id,
      )}
      defaultAudioState={AudioPreview.Reviewed}
      paused={paMessage.paused}
      onSubmit={async (data) => {
        try {
          await updateExistingPaMessage(paMessage.id, data);
          mutate(`/api/pa-messages/${paMessage.id}`);
          navigate("/pa-messages");
        } catch (error) {
          if (Array.isArray(error)) {
            setErrorMessage("Correct the following errors:");
            setErrors(error);
          } else {
            setErrorMessage((error as Error).message);
          }
        }
      }}
    />
  );
};

export default EditPaMessageContainer;
