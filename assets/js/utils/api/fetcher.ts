import { z } from "zod";

export const buildSafeFetcher =
  <T extends z.ZodTypeAny>(schema: T) =>
  async (...args: Parameters<typeof fetch>) => {
    const response = await fetch(...args);
    const json = await response.json();

    // This type cast is safe by definition
    // https://zod.dev/?id=inferring-the-inferred-type
    return schema.parse(json) as z.infer<T>;
  };
