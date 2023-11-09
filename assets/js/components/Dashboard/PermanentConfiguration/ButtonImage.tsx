import React, { ComponentType } from "react";
import { Button } from "react-bootstrap";

interface ButtonImageProps {
  fileName: string;
  label: string;
  onClick: () => unknown;
}

const ButtonImage: ComponentType<ButtonImageProps> = (
  props: ButtonImageProps
) => {
  const { fileName, label, onClick } = props;
  return (
    <Button className="button-image" onClick={onClick}>
      <div className="button-image__image-container">
        <img alt="" src={`/images/${fileName}`} />
      </div>
      <div>{label}</div>
    </Button>
  );
};

export default ButtonImage;
