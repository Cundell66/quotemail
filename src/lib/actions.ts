"use server";

import { generateEmailContent, type GenerateEmailContentInput } from "@/ai/flows/generate-email-content";

export async function generateCruiseEmailAction(input: GenerateEmailContentInput) {
  try {
    const result = await generateEmailContent(input);
    return { success: true, data: result.emailContent };
  } catch (error) {
    console.error("Error generating email:", error);
    return { success: false, error: "Failed to generate email content. The AI service may be temporarily unavailable." };
  }
}
