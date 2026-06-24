"use client";

import * as React from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeBlockProps {
  title: string;
  language: string;
  code: string;
}

export function CodeBlock({ title, language, code }: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard indisponivel (ex.: contexto sem https) - ignora silenciosamente
    }
  }

  return (
    <div className="overflow-hidden rounded-lg border border-border bg-[#0b0f17]">
      <div className="flex items-center justify-between border-b border-border bg-muted/30 px-4 py-2">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium text-foreground">{title}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">{language}</span>
        </div>
        <Button variant="ghost" size="sm" onClick={copy} aria-label="Copiar codigo">
          {copied ? <Check className="h-4 w-4 text-am" /> : <Copy className="h-4 w-4" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
      </div>
      <pre className="max-h-[480px] overflow-auto p-4 text-sm leading-relaxed">
        <code className="font-mono text-[#e6edf3]">{code}</code>
      </pre>
    </div>
  );
}
