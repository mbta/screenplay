import React from "react";
import { Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import {
  CollectionFill,
  ExclamationTriangleFill,
  PersonFill,
} from "react-bootstrap-icons";
import TSquare from "../../../static/images/t-square.svg";

const Sidebar = (props: { goToHome: () => void }): JSX.Element => {
  const pathname = useLocation().pathname;
  // @ts-ignore Suppressing "object could be null" warning
  const username = document.getElementById("app").dataset.username;

  return !pathname.includes("emergency-takeover") ? (
    <div className="sidebar-container">
      <Link to="/dashboard/" className="sidebar-brand" onClick={props.goToHome}>
        <img src={TSquare} alt="Screenplay Logo" />
        <div className="sidebar-brand__text">Screenplay</div>
      </Link>
      {/* TODO: Both the Link and the Button allow for tab selection. Only one should. */}
      <nav>
        <Link className="sidebar-link" to="/dashboard/">
          <Button className={pathname === "/dashboard/" ? "selected" : ""}>
            <CollectionFill size={20} />
            <span className="nav-link__name">Places</span>
          </Button>
        </Link>
        <Link className="sidebar-link" to="/alerts/">
          <Button className={pathname === "/alerts/" ? "selected" : ""}>
            <ExclamationTriangleFill size={20} />
            <span className="nav-link__name">Posted Alerts</span>
          </Button>
        </Link>
        {/* This button slightly different to trigger a reload */}
        <Button href="/" className="takeover-button">
          <ExclamationTriangleFill size={20} />
          <span className="nav-link__name">Outfront Emergency Takeover</span>
        </Button>
      </nav>
      {/* User info */}
      <div className="sidebar__user-info">
        <PersonFill size={20} style={{ opacity: 0.4 }} />
        <span className="username">{username}</span>
      </div>
    </div>
  ) : (
    <></>
  );
};

export default Sidebar;
