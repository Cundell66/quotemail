"use server";

import { generateEmailContent } from "@/ai/flows/generate-email-content";
import type { cruiseEmailSchema } from "@/lib/schemas";
import type { z } from "zod";

export async function generateCruiseEmailAction(input: z.infer<typeof cruiseEmailSchema>) {
  try {
    const result = await generateEmailContent(input as any); // The schema is slightly different, but compatible
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating email:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: `Failed to generate email content: ${errorMessage}` };
  }
}
