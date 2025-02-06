import React, { useState } from "react";
import PaMessageForm from "../PaMessageForm";
import { useNavigate } from "react-router-dom";
import { createNewPaMessage } from "Utils/api";
import { isPaMessageAdmin } from "Utils/auth";

const NewPaMessage = () => {
  const initialError = isPaMessageAdmin()
    ? null
    : "You don't have permission to create PA messages.";

  const [errorMessage, setErrorMessage] = useState(initialError);
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();

  return (
    <PaMessageForm
      title="New PA/ESS message"
      errors={errors}
      errorMessage={errorMessage}
      isReadOnly={!isPaMessageAdmin()}
      onError={setErrorMessage}
      onErrorsChange={setErrors}
      paused={false}
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
