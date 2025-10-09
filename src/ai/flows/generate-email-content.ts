'use server';

/**
 * @fileOverview An AI agent for generating professional email content based on user input.
 *
 * - generateEmailContent - A function that generates email content.
 * - GenerateEmailContentInput - The input type for the generateEmailContent function.
 * - GenerateEmailContentOutput - The return type for the generateEmailContent function.
 */

import {ai} from '@/ai/genkit';
import { GenerateEmailContentInputSchema, GenerateEmailContentOutputSchema, type GenerateEmailContentInput, type GenerateEmailContentOutput } from "@/lib/schemas";
import { addDays, differenceInMonths, startOfToday, subWeeks, parse } from 'date-fns';


function generateEmailTemplate(input: GenerateEmailContentInput): string {
  let guestsLine = `${input.adults} Adults`;
  if (input.children > 0) {
    guestsLine += ` and ${input.children} Children`;
  }

  const sailingsText = input.sailings.map(sailing => {
      const cruiseDateObj = parse(sailing.cruiseDate, "PPP", new Date());
      const paymentStartDate = addDays(startOfToday(), 14);
      const paymentCutoffDate = subWeeks(cruiseDateObj, 6);

      const optionsText = sailing.options.map(option => {
        const discountedPrice = option.mscBookPrice - (option.mscBookPrice * (input.discountPercentage / 100));
        const price = Math.floor(discountedPrice / 10) * 10 + 9;
        const formattedPrice = price.toLocaleString('en-GB');
        const balance = price - input.deposit;
        
        let monthlyPaymentText = '';
        if (paymentCutoffDate > paymentStartDate) {
          const monthsBetween = differenceInMonths(paymentCutoffDate, paymentStartDate);
          if (monthsBetween > 0 && balance > 0) {
            const monthlyPayment = Math.ceil(balance / monthsBetween);
            monthlyPaymentText = `${monthsBetween} monthly payments of £${monthlyPayment.toLocaleString('en-GB')} per month by direct debit`;
          }
        }
        
        const mscPriceLine = !input.hideMscPrice ? `MSC Price - £${option.mscBookPrice.toLocaleString('en-GB')}\n` : '';
        const optionDetails = `${option.experienceType} ${option.cabinType} - Decks ${option.decks}\n${mscPriceLine}My Price - __**£${formattedPrice}**__ per cabin, not per person!`;
        const paymentDetails = monthlyPaymentText ? `\n${monthlyPaymentText}`: '';

        return `${optionDetails}${paymentDetails}`;
      }).join('\n\n');

      const sailingFooter = `Total deposit for this cruise is £${input.deposit.toLocaleString('en-GB')} with the remaining balance being due by ${sailing.dueDate}`;
      
      return `${sailing.shipName}\n${sailing.cruiseDate} - ${sailing.nights} Nights - ${sailing.cruiseName}\n\n${optionsText}\n\n${sailingFooter}`;
  }).join('\n\n----------------------------------------\n\n');


  let voyagerLine = input.voyagerMember ? 'Voyager Club Discount included\n' : '';

  const emailContent = `Hi ${input.customerName},

Thanks for your Quote Request, I've attached some pricing and info below for you.

${guestsLine}
${input.drinksPackage}
${voyagerLine}
${sailingsText}

If you would like to go ahead and book a cruise, please let me know and I'll start searching for the perfect cabin for you.

*Monthly payment amounts are estimates based on assumed information. Full breakdown available on request.*
`;

  return emailContent;
}

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
