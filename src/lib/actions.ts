"use server";

type CruiseOption = {
    experienceType: string;
    cabinType: string;
    decks: string;
    mscBookPrice: number;
};

type GenerateEmailTemplateInput = {
    customerName: string;
    shipName: string;
    cruiseDate: string;
    nights: number;
    cruiseName: string;
    adults: number;
    children: number;
    drinksPackage: string;
    voyagerMember?: boolean;
    options: CruiseOption[];
    discountPercentage: number;
    deposit: number;
    dueDate: string;
};

function generateEmailTemplate(input: GenerateEmailTemplateInput): string {
  let guestsLine = `${input.adults} Adults`;
  if (input.children > 0) {
    guestsLine += ` and ${input.children} Children`;
  }

  const optionsText = input.options.map(option => {
    const discountedPrice = option.mscBookPrice - (option.mscBookPrice * (input.discountPercentage / 100));
    const price = Math.floor(discountedPrice / 10) * 10 + 9;
    const formattedPrice = price.toLocaleString('en-GB');
    
    return `${option.experienceType} ${option.cabinType} - Decks ${option.decks}\nMy Price - __**£${formattedPrice}**__ per cabin, not per person!`;
  }).join('\n\n');

  let voyagerLine = input.voyagerMember ? 'Voyager Club Discount included\n' : '';

  const emailContent = `Hi ${input.customerName},

Thanks for your Quote Request, I've attached some pricing and info below for you.

${input.shipName}
${input.cruiseDate} - ${input.nights} Nights - ${input.cruiseName}
${guestsLine}
${input.drinksPackage}
${voyagerLine}
${optionsText}

Total deposit for this cruise is £${input.deposit.toLocaleString('en-GB')} with the remaining balance being due by ${input.dueDate} (14 weeks before sailing)

If you would like to go ahead and book this cruise, please let me know and I'll start searching for the perfect cabin for you.
`;

  return emailContent;
}


export async function generateCruiseEmailAction(input: GenerateEmailTemplateInput) {
  try {
    const result = generateEmailTemplate(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error generating email:", error);
    return { success: false, error: "Failed to generate email content." };
  }
}
