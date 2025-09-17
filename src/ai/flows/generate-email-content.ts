'use server';

/**
 * @fileOverview An AI agent for generating professional email content based on user input.
 *
 * - generateEmailContent - A function that generates email content.
 * - GenerateEmailContentInput - The input type for the generateEmailContent function.
 * - GenerateEmailContentOutput - The return type for the generateEmailContent function.
 */

import {z} from 'genkit';

export const GenerateEmailContentInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  shipName: z.string().describe('The name of the ship.'),
  cruiseDate: z.string().describe('The date of the cruise.'),
  nights: z.number().describe('The number of nights of the cruise.'),
  cruiseName: z.string().describe('The name of the cruise.'),
  adults: z.number().describe('The number of adults on the cruise.'),
  children: z.number().describe('The number of children on the cruise.'),
  drinksPackage: z.string().describe('The type of drinks package.'),
  experienceType: z.string().describe('The type of cruise experience.'),
  cabinType: z.string().describe('The type of cabin.'),
  decks: z.string().describe('The deck number or name.'),
  mscBookPrice: z.number().describe('The MSC Book price of the cruise.'),
  discountPercentage: z.number().describe('The discount percentage applied.'),
  deposit: z.number().describe('The deposit amount paid.'),
  dueDate: z.string().describe('The due date for the remaining payment.'),
});
export type GenerateEmailContentInput = z.infer<typeof GenerateEmailContentInputSchema>;
