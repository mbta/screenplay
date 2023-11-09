import React, { ComponentType } from "react";
import { Button } from "react-bootstrap";

interface ButtonImageProps {
  fileName: string;
  label: string;
}

const ButtonImage: ComponentType<ButtonImageProps> = (
  props: ButtonImageProps
) => {
  const { fileName, label } = props;
  return (
    <Button className="button-image">
      <div className="button-image__image-container">
        <img alt="" src={`/images/${fileName}`} />
      </div>
      <div>{label}</div>
    </Button>
  );
};

export default ButtonImage;
