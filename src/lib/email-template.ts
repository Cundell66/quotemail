import { addDays, differenceInMonths, startOfToday, subWeeks, parse, isBefore } from 'date-fns';
import type { GenerateEmailContentInput, GenerateEmailContentOutput } from "@/lib/schemas";


function getDiscountedPrice(mscBookPrice: number, discountPercentage: number): number {
  const discountedPrice = mscBookPrice - (mscBookPrice * (discountPercentage / 100));
  return Math.floor(discountedPrice / 10) * 10 + 9;
}

export function generateEmailTemplate(input: GenerateEmailContentInput): GenerateEmailContentOutput {
  const firstName = input.customerName.trim().split(/\s+/)[0] || input.customerName;

  let guestsLine = `${input.adults} Adults`;
  if (input.children > 0) {
    const childText = input.children === 1 ? 'Child' : 'Children';
    guestsLine += ` and ${input.children} ${childText}`;
  }

  let anySailingHasMonthlyPayments = false;
  let anySailingLessThan14Weeks = false;
  let cheapestPrice: number | null = null;

  const sailingsText = input.sailings.map(sailing => {
      const cruiseDateObj = parse(sailing.cruiseDate, "PPP", new Date());
      const fourteenWeeksFromToday = addDays(startOfToday(), 14 * 7);
      const isLessThan14Weeks = isBefore(cruiseDateObj, fourteenWeeksFromToday);
      if (isLessThan14Weeks) anySailingLessThan14Weeks = true;

      const paymentStartDate = addDays(startOfToday(), 14);
      const paymentCutoffDate = subWeeks(cruiseDateObj, 14);

      const optionsText = sailing.options.map(option => {
        const price = getDiscountedPrice(option.mscBookPrice, input.discountPercentage);
        const formattedPrice = price.toLocaleString('en-GB');
        if (cheapestPrice === null || price < cheapestPrice) cheapestPrice = price;
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
        const paymentDetails = monthlyPaymentText ? `\nOr spread the cost: ${monthlyPaymentText}` : '';

        return `${optionDetails}${paymentDetails}`;
      }).join('\n\n');

      let sailingFooter = '';
      if (isLessThan14Weeks) {
        sailingFooter = 'Full balance payable at booking — this sailing is less than 14 weeks away.';
      } else {
        sailingFooter = `Secure it with a deposit of £${input.deposit.toLocaleString('en-GB')} — the remaining balance is due by ${sailing.dueDate}.`;
      }

      return `${sailing.shipName}\n${sailing.cruiseDate} - ${sailing.nights} Nights - ${sailing.cruiseName}\n\n${optionsText}\n\n${sailingFooter}`;
  }).join('\n\n----------------------------------------\n\n');

  let voyagerLine = input.voyagerMember ? 'Voyager Club Discount included\n' : '';
  const monthlyPaymentDisclaimer = anySailingHasMonthlyPayments ? `\n\n*Monthly payment amounts are estimates based on assumed information. Full breakdown available on request.*` : '';

  const singleSailing = input.sailings.length === 1;
  const firstSailing = input.sailings[0];
  const hasBalcony = firstSailing.options.some(o => o.cabinType.toLowerCase().includes('balcony'));

  const hookLine = `Good news — I've found ${singleSailing ? `a great fit on ${firstSailing.shipName}` : 'some great options'} for your ${input.children > 0 ? 'family' : 'trip'}, and the price is better than you might expect.`;

  let dreamText = '';
  if (singleSailing) {
    const balconyBit = hasBalcony
      ? 'Your own private balcony to watch the world drift by. '
      : 'A comfortable cabin and a new view every morning. ';
    const familyBit = input.children > 0
      ? 'The kids entertained all day while you actually get to relax. '
      : 'Total peace and quiet. ';
    dreamText = `Picture ${firstSailing.nights} nights on ${firstSailing.shipName}, cruising ${firstSailing.cruiseName} from ${firstSailing.cruiseDate}. ${balconyBit}No airport queues, no packing and unpacking every few days — unpack once and wake up somewhere new. ${familyBit}`;
  }

  const urgencyText = anySailingLessThan14Weeks
    ? 'Here\'s the honest bit: this price exists because the sailing is under 14 weeks away and the balance is due at booking. That also means it won\'t be around forever — once these cabins are gone at this rate, they\'re gone. If you\'re keen, don\'t sit on it.'
    : 'You don\'t need to pay it all today — a deposit secures it, with the balance due later (details below). Prices at this level don\'t tend to hang around though.';

  const dreamSection = dreamText ? `${dreamText}\n` : '';

  const emailBody = `Hi ${input.customerName},

${hookLine}

${dreamSection}Here's what I've put together for you:

${guestsLine}
${input.drinksPackage}
${voyagerLine}
${sailingsText}${monthlyPaymentDisclaimer}

All prices above are per cabin — for the whole family, not per person.

${urgencyText}

You're in safe hands — Get That Cruise is an agent for Bradley Travelstore, ATOL 11753, so your money is fully protected from day one. And if you receive a more attractive like-for-like quote elsewhere, I'd genuinely welcome the chance to review it and, where possible, match it.

To book, just reply to this email and say "BOOK IT" — I'll confirm everything and send your invoice over. Prefer to talk it through first? Reply and I'll call you at a time that suits.

P.S. — If this one isn't quite right, tell me what you're after — different dates, ship or cabin — and I'll find it for you. But at this price, these cabins don't tend to hang around.`;

  // Combine plain text body with HTML signature, separating them for the mailer
  // Use a unique separator that's unlikely to be in the content
  const emailContent = `${emailBody}\n\n---SIGNATURE_SEPARATOR---\n\n${input.signature}`;

  const cheapestFormatted = (cheapestPrice ?? 0).toLocaleString('en-GB');
  const subject = singleSailing
    ? `${firstName}, your ${firstSailing.shipName} quote: £${cheapestFormatted} per cabin`
    : `${firstName}, your cruise quotes are ready — from £${cheapestFormatted} per cabin`;

  return { subject, body: emailContent };
}
