import { useState } from "react";
import fp from "lodash/fp";

export const useUniqueId = () => {
  const [id] = useState(() => fp.uniqueId("unique-id-"));
  return id;
};
