"use client";

import * as React from "react";
import { Check, Copy, Bot, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type EmailPreviewProps = {
  emailContent: string;
  isLoading: boolean;
  isSending: boolean;
  onSend: () => void;
};

// A simple markdown-to-HTML converter
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
  const [body, signature] = text.split('\n\n---SIGNATURE_SEPARATOR---\n\n');

  const bodyHtml = body
    .replace(/__\*\*(.*?)\*\*__/g, '<u><b>$1</b></u>') // bold and underline for price
    .replace(/\n/g, '<br />');

  // The signature is assumed to be HTML, so we just append it.
  const finalHtml = signature ? `${bodyHtml}<br /><br />${signature}` : bodyHtml;

  return <div dangerouslySetInnerHTML={{ __html: finalHtml }} />;
};


export function EmailPreview({ emailContent, isLoading, isSending, onSend }: EmailPreviewProps) {
  const [isCopied, setIsCopied] = React.useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    if (!emailContent) return;
    try {
      // For copying, we'll provide a plain text version
      const [body, signature] = emailContent.split('\n\n---SIGNATURE_SEPARATOR---\n\n');
      const plainTextSignature = signature ? signature.replace(/<[^>]*>?/gm, '') : '';
      const textToCopy = `${body}\n\n${plainTextSignature}`;

      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      toast({
        title: "Copied to clipboard!",
        description: "You can now paste the email content.",
      });
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Copy Failed",
        description: "Could not copy text to clipboard.",
      });
    }
  };

  return (
    <Card className="lg:sticky lg:top-8 flex flex-col">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <Bot />
            Live Email Preview
          </CardTitle>
          <CardDescription>
            The generated email will appear below.
          </CardDescription>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleCopy}
                disabled={isLoading || !emailContent}
                aria-label="Copy email content"
              >
                {isCopied ? (
                  <Check className="h-5 w-5 transition-transform duration-300 ease-in-out scale-110" />
                ) : (
                  <Copy className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Copy to Clipboard</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="flex-grow">
        <div className="prose prose-sm dark:prose-invert min-h-[300px] w-full rounded-md border bg-muted/20 p-4 transition-all">
          {isLoading ? (
            <div className="space-y-3 pt-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          ) : (
            <div className="whitespace-pre-wrap font-sans text-sm text-foreground">
              {emailContent ? (
                <SimpleMarkdown text={emailContent} />
              ) : (
                "Fill out the form to see the generated email..."
              )}
            </div>
          )}
        </div>
      </CardContent>
       <CardFooter>
        <Button 
          onClick={onSend} 
          disabled={!emailContent || isSending || isLoading} 
          className="w-full"
        >
          {isSending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="mr-2 h-4 w-4" />
              Send Email
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
