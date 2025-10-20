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
};

function getSmtpConfig(fromAccount: string): SmtpConfig {
  if (fromAccount === 'get-that-cruise') {
    if (!process.env.GETTHATCRUISE_MAIL_SERVER || !process.env.GETTHATCRUISE_SENDER_EMAIL || !process.env.GETTHATCRUISE_SENDER_PASSWORD) {
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
    };
  }

  if (fromAccount === 'cruise-aboard') {
     if (!process.env.CRUISEABOARD_MAIL_SERVER || !process.env.CRUISEABOARD_SENDER_EMAIL || !process.env.CRUISEABOARD_SENDER_PASSWORD) {
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
    };
  }

  throw new Error("Invalid 'from' account specified.");
}


export async function generateAndSendEmailAction(input: z.infer<typeof cruiseEmailSchema>) {
  try {
    // 1. Prepare payload for email content generation
    let drinksPackageString = "No drinks package";
    if (input.drinksPackage) {
      drinksPackageString = input.children > 0 
        ? "Premium Extra & Minors Drinks Included" 
        : "Premium Extra Drinks Included";
    }

    const generationPayload = {
      ...input,
      drinksPackage: drinksPackageString,
      sailings: input.sailings.map(sailing => ({
        ...sailing,
        cruiseDate: format(sailing.cruiseDate, "PPP"),
        dueDate: format(subWeeks(sailing.cruiseDate, 14), "PPP"),
      })),
    };
    
    // We are not using dueDate from the top-level form values in the payload
    const { dueDate, ...finalPayload } = generationPayload;

    // 2. Generate the email content
    const emailContent = await generateEmailContent(finalPayload as any); // The schema is slightly different, but compatible
    if (!emailContent) {
      return { success: false, error: "Failed to generate email content." };
    }

    // 3. Send the email via SMTP
    const smtpConfig = getSmtpConfig(input.fromAccount);
    const transporter = nodemailer.createTransport(smtpConfig);
    
    const mailOptions = {
        from: `"${smtpConfig.senderName}" <${smtpConfig.auth.user}>`,
        to: input.customerEmail,
        subject: `Your Cruise Quote from ${smtpConfig.senderName}`,
        html: emailContent.replace(/\n/g, '<br />'),
        text: emailContent,
    };

    await transporter.sendMail(mailOptions);
    
    // Return the generated content to display in the preview
    return { success: true, data: emailContent };

  } catch (error) {
    console.error("Error in generateAndSendEmailAction:", error);
    const errorMessage = error instanceof Error ? error.message : "An unknown error occurred";
    return { success: false, error: `Failed to process your request: ${errorMessage}` };
  }
}
