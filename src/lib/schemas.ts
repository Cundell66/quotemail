import { z } from "zod";
import { addDays, startOfToday } from "date-fns";

const cruiseOptionSchema = z.object({
  experienceType: z.string().min(1, "Experience type is required."),
  cabinType: z.string().min(1, "Cabin type is required."),
  decks: z.string().min(1, "Decks information is required."),
  mscBookPrice: z.coerce.number({invalid_type_error: "Must be a number."}).positive("Price must be positive."),
});

const sailingSchema = z.object({
  shipName: z.string().min(1, { message: "Ship name is required." }),
  cruiseDate: z.date({ required_error: "A cruise date is required." }).nullable().refine(val => val !== null, { message: "A cruise date is required." }).refine(val => val === null || val > addDays(startOfToday(), 13), { message: "Cruise date must be at least 2 weeks from today." }),
  nights: z.coerce.number({invalid_type_error: "Must be a number."}).int().positive("Must be a positive number."),
  cruiseName: z.string().min(1, { message: "Cruise name is required." }),
  options: z.array(cruiseOptionSchema).min(1, "At least one cruise option is required."),
});


// This schema is used for client-side form validation
export const cruiseEmailSchema = z.object({
  customerName: z.string().min(1, { message: "Customer name is required." }),
  customerEmail: z.string().email({ message: "Please enter a valid email address." }),
  fromAccount: z.string().min(1, { message: "Please select a sending account." }),
  adults: z.coerce.number({invalid_type_error: "Must be a number."}).int().min(1, "At least one adult is required."),
  children: z.coerce.number({invalid_type_error: "Must be a number."}).int().min(0, "Cannot be negative."),
  drinksPackage: z.boolean(),
  discountPercentage: z.coerce.number({invalid_type_error: "Must be a number."}).min(0, "Cannot be negative.").max(100, "Cannot exceed 100."),
  deposit: z.coerce.number({invalid_type_error: "Must be a number."}).min(0), // Can be 0 if no guests
  dueDate: z.date({ required_error: "A due date is required." }).nullable(),
  voyagerMember: z.boolean(),
  sailings: z.array(sailingSchema).min(1, "At least one sailing is required."),
  hideMscPrice: z.boolean(),
});

// This schema is for the Genkit flow input
const GenkitCruiseOptionSchema = z.object({
    experienceType: z.string(),
    cabinType: z.string(),
    decks: z.string(),
    mscBookPrice: z.number(),
});

const GenkitSailingSchema = z.object({
    shipName: z.string().describe('The name of the ship.'),
    cruiseDate: z.string().describe('The date of the cruise.'),
    nights: z.number().describe('The number of nights of the cruise.'),
    cruiseName: z.string().describe('The name of the cruise.'),
    options: z.array(GenkitCruiseOptionSchema).describe('The different cruise options available.'),
    dueDate: z.string().describe('The due date for the remaining payment.'),
});

export const GenerateEmailContentInputSchema = z.object({
  customerName: z.string().describe('The name of the customer.'),
  adults: z.number().describe('The number of adults on the cruise.'),
  children: z.number().describe('The number of children on the cruise.'),
  drinksPackage: z.string().describe('The type of drinks package.'),
  discountPercentage: z.number().describe('The discount percentage applied.'),
  deposit: z.number().describe('The deposit amount paid.'),
  voyagerMember: z.boolean().optional().describe('Whether the customer is a Voyager Member.'),
  sailings: z.array(GenkitSailingSchema).describe('The different sailings available.'),
  hideMscPrice: z.boolean().describe('Whether to hide the MSC book price from the email.'),
  signature: z.string().describe('The email signature to be appended.'),
});
export type GenerateEmailContentInput = z.infer<typeof GenerateEmailContentInputSchema>;

export const GenerateEmailContentOutputSchema = z.string();
export type GenerateEmailContentOutput = z.infer<typeof GenerateEmailContentOutputSchema>;
