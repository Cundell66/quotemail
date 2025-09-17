'use server';

/**
 * @fileOverview An AI agent for generating professional email content based on user input.
 *
 * - generateEmailContent - A function that generates email content.
 * - GenerateEmailContentInput - The input type for the generateEmailContent function.
 * - GenerateEmailContentOutput - The return type for the generateEmailContent function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateEmailContentInputSchema = z.object({
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

const GenerateEmailContentOutputSchema = z.object({
  emailContent: z.string().describe('The generated email content.'),
});
export type GenerateEmailContentOutput = z.infer<typeof GenerateEmailContentOutputSchema>;

export async function generateEmailContent(input: GenerateEmailContentInput): Promise<GenerateEmailContentOutput> {
  return generateEmailContentFlow(input);
}

const generateEmailContentPrompt = ai.definePrompt({
  name: 'generateEmailContentPrompt',
  input: {schema: GenerateEmailContentInputSchema.extend({ price: z.number() })},
  output: {schema: GenerateEmailContentOutputSchema},
  prompt: `You are a professional email writer for a cruise company.
  Generate a personalized and engaging email to a customer based on the following cruise details.
  The total price should be calculated as the MSC Book Price minus the discount.

  Customer Name: {{{customerName}}}
  Ship Name: {{{shipName}}}
  Cruise Date: {{{cruiseDate}}}
  Nights: {{{nights}}}
  Cruise Name: {{{cruiseName}}}
  Adults: {{{adults}}}
  Children: {{{children}}}
  Drinks Package: {{{drinksPackage}}}
  Experience Type: {{{experienceType}}}
  Cabin Type: {{{cabinType}}}
  Decks: {{{decks}}}
  MSCBook Price: {{{mscBookPrice}}}
  Discount Percentage: {{{discountPercentage}}}
  Deposit: {{{deposit}}}
  Due Date: {{{dueDate}}}

  The email should follow this exact format, including all line breaks:
  Hi {{{customerName}}},

  Thanks for your Quote Request, I've attached some pricing and info below for you.

  {{{shipName}}}
  {{{cruiseDate}}} - {{{nights}}} Nights - {{{cruiseName}}}
  {{{adults}}} Adults and {{{children}}} Children
  {{{drinksPackage}}}

  {{{experienceType}}} {{{cabinType}}} - Decks {{{decks}}}
  My Price - __**£{{price}}**__ per cabin, not per person!

  Deposit for this cruise is £{{{deposit}}}pp with the remaining balance being due by {{{dueDate}}}

  If you would like to go ahead and book this cruise, please let me know and I'll start searching for the perfect cabin for you.
  `,
});

const generateEmailContentFlow = ai.defineFlow(
  {
    name: 'generateEmailContentFlow',
    inputSchema: GenerateEmailContentInputSchema,
    outputSchema: GenerateEmailContentOutputSchema,
  },
  async input => {
    const discountedPrice = input.mscBookPrice - (input.mscBookPrice * (input.discountPercentage / 100));
    const price = Math.floor(discountedPrice / 10) * 10 + 9;
    const {output} = await generateEmailContentPrompt({...input, price});
    return output!;
  }
);
