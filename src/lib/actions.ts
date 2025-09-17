"use server";

import type { GenerateEmailContentInput } from "@/ai/flows/generate-email-content";

function generateEmailTemplate(input: GenerateEmailContentInput): string {
  const discountedPrice = input.mscBookPrice - (input.mscBookPrice * (input.discountPercentage / 100));
  const price = Math.floor(discountedPrice / 10) * 10 + 9;

  const emailContent = `Hi ${input.customerName},

Thanks for your Quote Request, I've attached some pricing and info below for you.

${input.shipName}
${input.cruiseDate} - ${input.nights} Nights - ${input.cruiseName}
${input.adults} Adults and ${input.children} Children
${input.drinksPackage}

${input.experienceType} ${input.cabinType} - Decks ${input.decks}
My Price - __**£${price}**__ per cabin, not per person!

Deposit for this cruise is £${input.deposit}pp with the remaining balance being due by ${input.dueDate}

If you would like to go ahead and book this cruise, please let me know and I'll start searching for the perfect cabin for you.
`;

  return emailContent;
}


export async function generateCruiseEmailAction(input: GenerateEmailContentInput) {
  try {
    const result = generateEmailTemplate(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating email:", error);
    return { success: false, error: "Failed to generate email content." };
  }
}
