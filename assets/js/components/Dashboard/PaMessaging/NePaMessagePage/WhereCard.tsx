import React from "react";
import { Card, Button } from "react-bootstrap";
import {
  NewPaMessagePageState,
  NewPaMessagePageReducerAction,
} from "./NewPaMessagePage";
import { PlusLg } from "react-bootstrap-icons";

interface Props {
  pageState: NewPaMessagePageState;
  dispatch: React.Dispatch<NewPaMessagePageReducerAction>;
}

const WhereCard = (_props: Props) => {
  return (
    <Card className="where-card">
      <div className="title">Where</div>
      <Button className="add-stations-zones-button">
        <PlusLg width={12} height={12} /> Add Stations & Zones
      </Button>
    </Card>
  );
};

export default WhereCard;
