// Note: component name is a bit unclear--this can show detail for both pending and live screens,
// but its presentation is particular to the pending screens page.

import React from "react";
import { Screen } from "../../models/screen";
import { ScreenConfiguration } from "../../models/screen_configuration";
import ScreenSimulation from "./ScreenSimulation";
import { fetchExistingScreens } from "../../utils/api";

interface Props {
  config: ScreenConfiguration;
  // I'm still not super clear what the purpose of this is, or how/where to store it...
  // We now have two different ways of hiding screens from the places list:
  // - When hidden via the old admin tool, the screen is excluded from places_and_screens.json
  // - When hidden this new way, the screen is known to Screenplay--and thus needs a full, valid
  //   config + Screenplay-relevant metadata, since we show info about it here on
  //   the pending page--but ignored when rendering the places list.
  //
  // This seems messy and I'm not sure how to explain the issue to design.
  isHiddenOnPlacesPage: boolean;
  onClickHideOnPlacesPage: () => void;
}

const PendingScreenDetail = (props: Props): JSX.Element => {
  return (
    <div className="pending-screen-detail">

    </div>
  )
}

export default PendingScreenDetail;
