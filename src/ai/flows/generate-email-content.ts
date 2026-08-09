'use server';

/**
 * @fileOverview An AI agent for generating professional, conversion-focused
 * email content (subject + body) based on user input.
 *
 * - generateEmailContent - A function that generates email content.
 * - GenerateEmailContentInput - The input type for the generateEmailContent function.
 * - GenerateEmailContentOutput - The return type for the generateEmailContent function.
 */

import {ai} from '@/ai/genkit';
import { GenerateEmailContentInputSchema, GenerateEmailContentOutputSchema, type GenerateEmailContentInput, type GenerateEmailContentOutput } from "@/lib/schemas";
import { generateEmailTemplate } from "@/lib/email-template";

const generateEmailContentFlow = ai.defineFlow(
  {
    name: 'generateEmailContentFlow',
    inputSchema: GenerateEmailContentInputSchema,
    outputSchema: GenerateEmailContentOutputSchema,
  },
  async (input) => {
    return generateEmailTemplate(input);
  }
);

export async function generateEmailContent(input: GenerateEmailContentInput): Promise<GenerateEmailContentOutput> {
    return await generateEmailContentFlow(input);
}
