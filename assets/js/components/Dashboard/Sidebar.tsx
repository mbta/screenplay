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
  ArrowDownShort,
  Icon,
} from "react-bootstrap-icons";
import TLogo from "Images/t-logo.svg";
import TLogoBlack from "Images/t-logo-black.svg";
import cx from "classnames";
import * as sidebarStyles from "Styles/sidebar.module.scss";
import * as predictionSuppressionStyles from "Styles/prediction-suppression.module.scss";

import { isEmergencyAdmin, isScreensAdmin } from "Utils/auth";
import { usePredictionSuppressionState } from "Hooks/useScreenplayContext";

const SidebarLink = ({
  to,
  icon,
  activeIcon,
  reloadDocument,
  children,
  extraContent,
}: {
  to: string;
  icon: Icon;
  activeIcon: Icon;
  reloadDocument?: boolean;
  children: ReactNode;
  extraContent?: ReactNode;
}) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cx(sidebarStyles.link, { [sidebarStyles.active]: isActive })
      }
      reloadDocument={reloadDocument}
    >
      {({ isActive }) => {
        const IconComponent = isActive ? activeIcon : icon;
        return (
          <>
            <span className={sidebarStyles.linkHighlight}>
              <IconComponent size={36} />
              {extraContent}
            </span>
            <span>{children}</span>
          </>
        );
      }}
    </NavLink>
  );
};

const Sidebar = () => {
  const { suppressedPredictions } = usePredictionSuppressionState();

  const environment =
    document
      .querySelector("meta[name=environment-name]")
      ?.getAttribute("content") ?? "prod";

  return (
    <nav className={sidebarStyles.container}>
      <a href="/dashboard" className={cx(sidebarStyles.logo, environment)}>
        <img
          src={environment === "prod" ? TLogo : TLogoBlack}
          alt="Screenplay Logo"
          style={{ width: 32 }}
        />
        <span className={sidebarStyles.environmentName}>
          {{ dev: "Dev", "dev-green": "Dev-Green" }[environment]}
        </span>
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
      <SidebarLink
        to="/prediction-suppression"
        icon={ArrowDownShort}
        activeIcon={ArrowDownShort}
        extraContent={
          !!suppressedPredictions?.length && (
            <span
              style={{ position: "absolute", bottom: -4, right: -14 }}
              className={predictionSuppressionStyles.badge}
            >
              {suppressedPredictions?.length}
            </span>
          )
        }
      >
        Suppress Predictions
      </SidebarLink>
      <SidebarLink to="/pa-messages" icon={VolumeUp} activeIcon={VolumeUpFill}>
        PA/ESS
      </SidebarLink>
      {isEmergencyAdmin() && (
        <SidebarLink
          to="/emergency-takeover"
          icon={Lightning}
          activeIcon={LightningFill}
          reloadDocument
        >
          Emergency Takeover
        </SidebarLink>
      )}
      {isScreensAdmin() && (
        <SidebarLink to="/pending" icon={Signpost} activeIcon={SignpostFill}>
          Configure
        </SidebarLink>
      )}
    </nav>
  );
};

export default Sidebar;
