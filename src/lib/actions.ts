"use server";

import type { GenerateEmailContentInput } from "@/ai/flows/generate-email-content";

function generateEmailTemplate(input: GenerateEmailContentInput & { voyagerMember?: boolean }): string {
  const totalDiscountPercentage = input.discountPercentage + (input.voyagerMember ? 5 : 0);
  const discountedPrice = input.mscBookPrice - (input.mscBookPrice * (totalDiscountPercentage / 100));
  const price = Math.floor(discountedPrice / 10) * 10 + 9;
  const formattedPrice = price.toLocaleString('en-GB');

  let guestsLine = `${input.adults} Adults`;
  if (input.children > 0) {
    guestsLine += ` and ${input.children} Children`;
  }

  let voyagerLine = input.voyagerMember ? 'Voyager Club Discount added\n' : '';

  const emailContent = `Hi ${input.customerName},

Thanks for your Quote Request, I've attached some pricing and info below for you.

${input.shipName}
${input.cruiseDate} - ${input.nights} Nights - ${input.cruiseName}
${guestsLine}
${input.drinksPackage}
${voyagerLine}
${input.experienceType} ${input.cabinType} - Decks ${input.decks}
My Price - __**£${formattedPrice}**__ per cabin, not per person!

Total deposit for this cruise is £${input.deposit.toLocaleString('en-GB')} with the remaining balance being due by ${input.dueDate} (14 weeks before sailing)

If you would like to go ahead and book this cruise, please let me know and I'll start searching for the perfect cabin for you.
`;

  return emailContent;
}


export async function generateCruiseEmailAction(input: GenerateEmailContentInput & { voyagerMember?: boolean }) {
  try {
    const result = generateEmailTemplate(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating email:", error);
    return { success: false, error: "Failed to generate email content." };
  }
}
