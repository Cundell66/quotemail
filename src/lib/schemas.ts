import { z } from "zod";
import { addDays, startOfToday } from "date-fns";

const cruiseOptionSchema = z.object({
  experienceType: z.string().min(1, "Experience type is required."),
  cabinType: z.string().min(1, "Cabin type is required."),
  decks: z.string().min(1, "Decks information is required."),
  mscBookPrice: z.coerce.number({invalid_type_error: "Must be a number."}).positive("Price must be positive."),
});

export const cruiseEmailSchema = z.object({
  customerName: z.string().min(1, { message: "Customer name is required." }),
  shipName: z.string().min(1, { message: "Ship name is required." }),
  cruiseDate: z.date({ required_error: "A cruise date is required." }).min(addDays(startOfToday(), 14), { message: "Cruise date must be at least 2 weeks from today." }),
  nights: z.coerce.number({invalid_type_error: "Must be a number."}).int().positive("Must be a positive number."),
  cruiseName: z.string().min(1, { message: "Cruise name is required." }),
  adults: z.coerce.number({invalid_type_error: "Must be a number."}).int().min(1, "At least one adult is required."),
  children: z.coerce.number({invalid_type_error: "Must be a number."}).int().min(0, "Cannot be negative."),
  drinksPackage: z.boolean(),
  options: z.array(cruiseOptionSchema).min(1, "At least one cruise option is required."),
  discountPercentage: z.coerce.number({invalid_type_error: "Must be a number."}).min(0, "Cannot be negative.").max(100, "Cannot exceed 100."),
  deposit: z.coerce.number({invalid_type_error: "Must be a number."}).min(0), // Can be 0 if no guests
  dueDate: z.date({ required_error: "A due date is required." }),
  voyagerMember: z.boolean(),
});
