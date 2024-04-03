import React, { ComponentType } from "react";
import { Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import {
  CollectionFill,
  ExclamationTriangleFill,
  PersonFill,
  PlusLg,
  ClockFill,
} from "react-bootstrap-icons";
import TSquare from "../../../static/images/t-square.svg";

const Sidebar: ComponentType = () => {
  const pathname = useLocation().pathname;

  // @ts-ignore Suppressing "object could be null" warning
  const username = document
    .querySelector("meta[name=username]")
    ?.getAttribute("content");

  const isScreensAdmin = document.querySelector("meta[name=is-screens-admin]");

  return !pathname.includes("emergency-takeover") ? (
    <div className="sidebar-container">
      {/*
        We use a regular web link for this rather than a React-Router Link,
        so that the page reloads with fresh state.
      */}
      <a href="/dashboard" className="sidebar-brand">
        <img src={TSquare} alt="Screenplay Logo" />
        <div className="sidebar-brand__text">Screenplay</div>
      </a>
      {/* TODO: Both the Link and the Button allow for tab selection. Only one should. */}
      <nav>
        <Link className="sidebar-link" to="/dashboard">
          <Button className={pathname === "dashboard" ? "selected" : ""}>
            <CollectionFill size={20} className="sidebar-link__icon" />
            <span className="nav-link__name">Places</span>
          </Button>
        </Link>
        <Link className="sidebar-link" to="/alerts">
          <Button className={pathname === "alerts" ? "selected" : ""}>
            <ExclamationTriangleFill size={20} className="sidebar-link__icon" />
            <span className="nav-link__name">Posted Alerts</span>
          </Button>
        </Link>
        {isScreensAdmin && (
          <>
            <Link className="sidebar-link" to="/pending">
              <Button className={pathname === "pending" ? "selected" : ""}>
                <ClockFill size={20} className="sidebar-link__icon" />
                <span className="nav-link__name">Pending</span>
              </Button>
            </Link>
            <Link className="sidebar-link" to="/configure-screens">
              <Button
                className={pathname === "configure-screens" ? "selected" : ""}
              >
                <PlusLg size={20} className="sidebar-link__icon" />
                <span className="nav-link__name">Configure</span>
              </Button>
            </Link>
          </>
        )}
        {/* This button slightly different to trigger a reload */}
        <Button href="/" className="takeover-button">
          <ExclamationTriangleFill size={20} className="sidebar-link__icon" />
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
