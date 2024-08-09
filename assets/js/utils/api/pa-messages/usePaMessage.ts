import { z } from "zod";
import { useMemo } from "react";
import useSWR from "swr";
import { buildSafeFetcher } from "../fetcher";
import { PaMessage, paMessageSchema } from "../../../models/pa_message";

export const stateFilterSchema = z.union([
  z.literal("active"),
  z.literal("future"),
  z.literal("past"),
]);

export type StateFilter = z.infer<typeof stateFilterSchema>;

const fetcher = buildSafeFetcher(paMessageSchema.array());

export const usePaMessages = ({
  stateFilter,
}: {
  stateFilter?: StateFilter | null;
}) => {
  const url = useMemo(() => {
    const params = new URLSearchParams();

    if (stateFilter) params.set("state", stateFilter);

    return `/api/pa-messages?${params.toString()}`;
  }, [stateFilter]);

  return useSWR<PaMessage[]>(url, fetcher);
};
