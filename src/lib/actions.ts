"use server";

import { z } from "zod";
import { format, subWeeks } from "date-fns";
import { generateEmailContent } from "@/ai/flows/generate-email-content";
import { cruiseEmailSchema } from "@/lib/schemas";
import nodemailer from "nodemailer";

type SmtpConfig = {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  senderName: string;
  signature: string;
};

function getSmtpConfig(fromAccount: string): SmtpConfig {
  if (fromAccount === 'get-that-cruise') {
    if (!process.env.GETTHATCRUISE_MAIL_SERVER || !process.env.GETTHATCRUISE_SENDER_EMAIL || !process.env.GETTHATCRUISE_SENDER_PASSWORD || !process.env.GETTHATCRUISE_SIGNATURE) {
        throw new Error("Missing SMTP configuration for Get That Cruise.");
    }
    return {
      host: process.env.GETTHATCRUISE_MAIL_SERVER,
      port: 465,
      secure: true,
      auth: {
        user: process.env.GETTHATCRUISE_SENDER_EMAIL,
        pass: process.env.GETTHATCRUISE_SENDER_PASSWORD,
      },
      senderName: process.env.GETTHATCRUISE_SENDER_NAME || "Get That Cruise",
      signature: process.env.GETTHATCRUISE_SIGNATURE,
    };
  }

  if (fromAccount === 'cruise-aboard') {
     if (!process.env.CRUISEABOARD_MAIL_SERVER || !process.env.CRUISEABOARD_SENDER_EMAIL || !process.env.CRUISEABOARD_SENDER_PASSWORD || !process.env.CRUISEABOARD_SIGNATURE) {
        throw new Error("Missing SMTP configuration for Cruise Aboard.");
    }
    return {
      host: process.env.CRUISEABOARD_MAIL_SERVER,
      port: 465,
      secure: true,
      auth: {
        user: process.env.CRUISEABOARD_SENDER_EMAIL,
        pass: process.env.CRUISEABOARD_SENDER_PASSWORD,
      },
      senderName: process.env.CRUISEABOARD_SENDER_NAME || "Cruise Aboard",
      signature: process.env.CRUISEABOARD_SIGNATURE,
    };
  }

  throw new Error("Invalid 'from' account specified.");
}


export async function generateEmailAction(input: z.infer<typeof cruiseEmailSchema>) {
  try {
    const validatedInput = cruiseEmailSchema.parse(input);
    if (validatedInput.sailings.some(s => s.cruiseDate === null)) {
      throw new Error("Invalid date detected in sailings.");
    }

    const smtpConfig = getSmtpConfig(validatedInput.fromAccount);

    let drinksPackageString = "No drinks package";
    if (validatedInput.drinksPackage) {
      drinksPackageString = validatedInput.children > 0 
        ? "Premium Extra & Minors Drinks Included" 
        : "Premium Extra Drinks Included";
    }

    const generationPayload = {
      ...validatedInput,
      drinksPackage: drinksPackageString,
      sailings: validatedInput.sailings.map(sailing => ({
        ...sailing,
        cruiseDate: format(sailing.cruiseDate!, "PPP"),
        dueDate: format(subWeeks(sailing.cruiseDate!, 14), "PPP"),
      })),
      signature: smtpConfig.signature,
    };
    
    const { dueDate, ...finalPayload } = generationPayload;

    const emailContent = await generateEmailContent(finalPayload as any);
    if (!emailContent) {
      return { success: false, error: "Failed to generate email content." };
    }
    
    return { success: true, data: emailContent };

  } catch (error) {
    console.error("Error in generateEmailAction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: `Failed to process your request: ${errorMessage}` };
  }
}

const sendEmailSchema = z.object({
    customerEmail: z.string().email(),
    fromAccount: z.string(),
    emailContent: z.string(),
});

export async function sendEmailAction(input: z.infer<typeof sendEmailSchema>) {
    try {
        const validatedInput = sendEmailSchema.parse(input);
        const smtpConfig = getSmtpConfig(validatedInput.fromAccount);

        const transporter = nodemailer.createTransport(smtpConfig);
        
        const [emailBody, signature] = validatedInput.emailContent.split('\n\n---SIGNATURE_SEPARATOR---\n\n');

        const htmlBody = emailBody.replace(/\n/g, '<br />');

        const mailOptions = {
            from: `"${smtpConfig.senderName}" <${smtpConfig.auth.user}>`,
            to: validatedInput.customerEmail,
            subject: `Your Cruise Quote from ${smtpConfig.senderName}`,
            html: `${htmlBody}<br /><br />${signature || smtpConfig.signature}`,
            text: `${emailBody}\n\n${(signature || smtpConfig.signature).replace(/<[^>]*>?/gm, '')}`,
        };

        await transporter.sendMail(mailOptions);
        
        return { success: true };

    } catch (error) {
        console.error("Error in sendEmailAction:", error);
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
        return { success: false, error: `Failed to send email: ${errorMessage}` };
    }
}
