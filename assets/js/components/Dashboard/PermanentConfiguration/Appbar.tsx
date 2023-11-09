import React, { ComponentType } from "react";
import { CloseButton, Container, Navbar } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

interface AppBarProps {
  title: string;
}

const Appbar: ComponentType<AppBarProps> = (props: AppBarProps) => {
  const { title } = props;
  const navigate = useNavigate();

  return (
    <Navbar variant="dark" data-bs-theme="dark">
      <Container>
        <Navbar.Brand>{title}</Navbar.Brand>
        <CloseButton
          className="justify-content-end"
          variant="white"
          onClick={() => navigate(-1)}
        />
      </Container>
    </Navbar>
  );
};

export default Appbar;
