import React, { ReactNode } from "react";
import { NavLink } from "react-router-dom";
import {
  GeoAlt,
  GeoAltFill,
  ExclamationTriangle,
  ExclamationTriangleFill,
  VolumeUp,
  VolumeUpFill,
  Lightning,
  LightningFill,
  Signpost,
  SignpostFill,
  Icon,
} from "react-bootstrap-icons";
import TLogo from "../../../static/images/t-logo.svg";

const SidebarLink = ({
  to,
  icon,
  activeIcon,
  reloadDocument,
  children,
}: {
  to: string;
  icon: Icon;
  activeIcon: Icon;
  reloadDocument?: boolean;
  children: ReactNode;
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => `sidebar-link ${isActive ? "active" : ""}`}
      reloadDocument={reloadDocument}
    >
      {({ isActive }) => {
        const IconComponent = isActive ? activeIcon : icon;
        return (
          <>
            <span className="sidebar-link-highlight">
              <IconComponent size={36} />
            </span>
            <span>{children}</span>
          </>
        );
      }}
    </NavLink>
  );
};

const Sidebar = () => {
  const isScreensAdmin = !!document.querySelector(
    "meta[name=is-screens-admin]",
  );
  const isPaMessageAdmin = !!document.querySelector(
    "meta[name=is-pa-message-admin]",
  );

  return (
    <nav className="sidebar-container">
      <a href="/dashboard" className="sidebar-logo">
        <img src={TLogo} alt="Screenplay Logo" style={{ width: 32 }} />
      </a>
      <SidebarLink to="/dashboard" icon={GeoAlt} activeIcon={GeoAltFill}>
        Places
      </SidebarLink>
      <SidebarLink
        to="/alerts"
        icon={ExclamationTriangle}
        activeIcon={ExclamationTriangleFill}
      >
        Posted Alerts
      </SidebarLink>
      {isPaMessageAdmin && (
        <SidebarLink
          to="/pa-messages"
          icon={VolumeUp}
          activeIcon={VolumeUpFill}
        >
          PA/ESS
        </SidebarLink>
      )}
      <SidebarLink
        to="/emergency-takeover"
        icon={Lightning}
        activeIcon={LightningFill}
        reloadDocument
      >
        Emergency Takeover
      </SidebarLink>
      {isScreensAdmin && (
        <SidebarLink to="/pending" icon={Signpost} activeIcon={SignpostFill}>
          Configure
        </SidebarLink>
      )}
    </nav>
  );
};

export default Sidebar;
