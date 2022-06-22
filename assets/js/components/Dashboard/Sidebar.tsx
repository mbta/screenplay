import React from "react";
import { Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";
import { CollectionFill, ExclamationTriangleFill, PersonFill } from "react-bootstrap-icons"
import TSquare from '../../../static/images/t-square.svg';

const Sidebar = () => {
  const pathname = useLocation().pathname;
  const username = document.getElementById("app").dataset.username;

  return (
    pathname.includes('dashboard') ?
      <div className="sidebar-container">
        <Link to="/dashboard" className="sidebar-brand">
          <img src={TSquare} alt="Screenplay Logo" />
          <div className="sidebar-brand__text">Screenplay</div>
        </Link>
        {/* TODO: Both the Link and the Button allow for tab selection. Only one should. */}
        <nav>
          <Link to="/dashboard">
            <Button className={pathname==="/dashboard" ? "selected" : ""}>
              <CollectionFill size={20} />
              <span className="nav-link__name">Places</span>
            </Button>
          </Link>
          <Link to="/dashboard/alerts">
            <Button className={pathname==="/dashboard/alerts" ? "selected" : ""}>
              <ExclamationTriangleFill size={20} />
              <span className="nav-link__name">Posted Alerts</span>
            </Button>
          </Link>
          {/* This button slightly different to trigger a reload */}
          <Button href="/" className="takeover-button">
            <ExclamationTriangleFill size={20} />
            <span className="nav-link__name">Emergency T</span>
          </Button>
        </nav>
        {/* User info */}
        <div className="sidebar__user-info">
          <PersonFill size={20} style={{ opacity: 0.4 }} />
          <span className="username">{ username }</span>
        </div>
      </div>
      : <></>
  )
}

export default Sidebar
