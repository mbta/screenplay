import React, { ComponentType } from "react";
import { Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const PendingScreensPage: ComponentType = () => {
  const navigate = useNavigate();
  const appId = "gl-eink";

  return (
    <div>
      <div className="page-content__header">Pending</div>
      <Button
        onClick={() => {
          navigate(`/configure-screens/${appId}`, {
            state: { place_id: "place-hsmnl" },
          });
        }}
      >
        Navigate
      </Button>
    </div>
  );
};

export default PendingScreensPage;
