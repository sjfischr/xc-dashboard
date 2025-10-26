"use client";

import { useCallback, useState, type ReactNode } from "react";
import { Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ShareButtonProps {
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost";
  children?: ReactNode;
}

export function ShareButton({
  className,
  variant = "outline",
  children,
}: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleShare = useCallback(async () => {
    const shareUrl = window.location.href;

    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      return;
    }

    const tempInput = document.createElement("input");
    tempInput.value = shareUrl;
    document.body.appendChild(tempInput);
    tempInput.select();
    document.execCommand("copy");
    document.body.removeChild(tempInput);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  return (
    <Button
      type="button"
      variant={variant}
      className={className}
      onClick={handleShare}
    >
      <Share2 className="size-4" />
      {children ?? (copied ? "Copied" : "Share")}
    </Button>
  );
}
