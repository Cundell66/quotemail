"use server";

import { generateEmailContent } from "@/ai/flows/generate-email-content";
import type { GenerateEmailContentInput } from "@/lib/schemas";

export async function generateCruiseEmailAction(input: GenerateEmailContentInput) {
  try {
    const result = await generateEmailContent(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating email:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: `Failed to generate email content: ${errorMessage}` };
  }
}
