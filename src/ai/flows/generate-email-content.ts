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
import { addDays, differenceInMonths, startOfToday, subWeeks, parse, isBefore } from 'date-fns';


function generateEmailTemplate(input: GenerateEmailContentInput): string {
  let guestsLine = `${input.adults} Adults`;
  if (input.children > 0) {
    const childText = input.children === 1 ? 'Child' : 'Children';
    guestsLine += ` and ${input.children} ${childText}`;
  }

  let anySailingHasMonthlyPayments = false;

  const sailingsText = input.sailings.map(sailing => {
      const cruiseDateObj = parse(sailing.cruiseDate, "PPP", new Date());
      const fourteenWeeksFromToday = addDays(startOfToday(), 14 * 7);
      const isLessThan14Weeks = isBefore(cruiseDateObj, fourteenWeeksFromToday);

      const paymentStartDate = addDays(startOfToday(), 14);
      const paymentCutoffDate = subWeeks(cruiseDateObj, 14);

      const optionsText = sailing.options.map(option => {
        const discountedPrice = option.mscBookPrice - (option.mscBookPrice * (input.discountPercentage / 100));
        const price = Math.floor(discountedPrice / 10) * 10 + 9;
        const formattedPrice = price.toLocaleString('en-GB');
        const balance = price - input.deposit;
        
        let monthlyPaymentText = '';
        if (!isLessThan14Weeks && paymentCutoffDate > paymentStartDate) {
          const monthsBetween = differenceInMonths(paymentCutoffDate, paymentStartDate);
          if (monthsBetween > 0 && balance > 0) {
            const monthlyPayment = Math.ceil(balance / monthsBetween);
            monthlyPaymentText = `${monthsBetween} monthly payments of £${monthlyPayment.toLocaleString('en-GB')} per month by direct debit`;
            anySailingHasMonthlyPayments = true;
          }
        }
        
        const mscPriceLine = !input.hideMscPrice ? `MSC Price - £${option.mscBookPrice.toLocaleString('en-GB')}\n` : '';
        const optionDetails = `${option.experienceType} ${option.cabinType} - Decks ${option.decks}\n${mscPriceLine}My Price - __**£${formattedPrice}**__ per cabin, not per person!`;
        const paymentDetails = monthlyPaymentText ? `\n${monthlyPaymentText}`: '';

        return `${optionDetails}${paymentDetails}`;
      }).join('\n\n');

      let sailingFooter = '';
      if (isLessThan14Weeks) {
        sailingFooter = 'Full amount is due at time of booking as sailing is less than 14 weeks away.';
      } else {
        sailingFooter = `Total deposit for this cruise is £${input.deposit.toLocaleString('en-GB')} with the remaining balance being due by ${sailing.dueDate}`;
      }
      
      return `${sailing.shipName}\n${sailing.cruiseDate} - ${sailing.nights} Nights - ${sailing.cruiseName}\n\n${optionsText}\n\n${sailingFooter}`;
  }).join('\n\n----------------------------------------\n\n');


  let voyagerLine = input.voyagerMember ? 'Voyager Club Discount included\n' : '';
  const monthlyPaymentDisclaimer = anySailingHasMonthlyPayments ? `\n\n*Monthly payment amounts are estimates based on assumed information. Full breakdown available on request.*` : '';

  const emailBody = `Hi ${input.customerName},

Thanks for your Quote Request, I've provided some pricing and info below for you.

${guestsLine}
${input.drinksPackage}
${voyagerLine}
${sailingsText}${monthlyPaymentDisclaimer}`;

  // Combine plain text body with HTML signature, separating them for the mailer
  // Use a unique separator that's unlikely to be in the content
  const emailContent = `${emailBody}\n\n---SIGNATURE_SEPARATOR---\n\n${input.signature}`;


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
