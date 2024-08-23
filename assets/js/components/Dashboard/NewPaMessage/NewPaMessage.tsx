import React, { useState } from "react";
import PaMessageForm from "../PaMessageForm";
import { useNavigate } from "react-router-dom";
import { createNewPaMessage } from "Utils/api";

const NewPaMessage = () => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  return (
    <PaMessageForm
      title="New PA/ESS message"
      errors={errors}
      errorMessage={errorMessage}
      onError={setErrorMessage}
      onErrorsChange={setErrors}
      onSubmit={async (formData) => {
        const { status, errors } = await createNewPaMessage(formData);

        if (status === 200) {
          navigate("/pa-messages");
        } else if (status === 422) {
          setErrorMessage("Correct the following errors:");
          setErrors(Object.keys(errors));
        } else {
          setErrorMessage("Something went wrong. Please try again.");
        }
      }}
    />
  );
};

export default NewPaMessage;
