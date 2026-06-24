import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import type { CodeBlock } from "../../lib/types";

const KEYWORDS = /\b(import|from|def|class|return|if|else|for|in|while|with|as|pass|None|True|False|lambda|try|except|finally|raise|yield)\b/g;
const STRINGS = /(".*?"|'.*?')/g;
const PLACEHOLDER_RE = /# \[PASSO EM BRANCO - IMPLEMENTE AQUI A LOGICA\]/g;
const COMMENTS = /(#.*?)$/gm;
const NUMBERS = /\b(\d+\.?\d*)\b/g;
const BUILTINS = /\b(int|str|float|list|dict|tuple|len|range|print|super|self)\b/g;

function highlight(code: string): string {
  const esc = code
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  return esc
    .replace(
      PLACEHOLDER_RE,
      '<span class="ph-blank">$&</span>'
    )
    .replace(COMMENTS, (m) =>
      m.includes("ph-blank") ? m : `<span class="tk-comment">${m}</span>`
    )
    .replace(STRINGS, '<span class="tk-string">$&</span>')
    .replace(KEYWORDS, '<span class="tk-keyword">$&</span>')
    .replace(BUILTINS, '<span class="tk-builtin">$&</span>')
    .replace(NUMBERS, '<span class="tk-number">$&</span>');
}

export function CodeBlockView({ block }: { block: CodeBlock }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(block.code);
      setCopied(true);
      toast.success("Código copiado");
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error("Não foi possível copiar");
    }
  }

  return (
    <div className="rounded-lg border border-white/10 overflow-hidden bg-[#0c0c12]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/70" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/70" />
          <span className="w-3 h-3 rounded-full bg-emerald-500/70" />
          <span className="ml-3 text-xs text-white/60 font-mono">{block.title}</span>
        </div>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 text-xs text-white/60 hover:text-white px-2 py-1 rounded transition-colors"
        >
          {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copied ? "Copiado" : "Copiar"}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-sm leading-relaxed font-mono">
        <code
          className="block"
          dangerouslySetInnerHTML={{ __html: highlight(block.code) }}
        />
      </pre>
      <style>{`
        .tk-keyword { color: #c084fc; }
        .tk-string { color: #6ee7b7; }
        .tk-comment { color: #6b7280; font-style: italic; }
        .tk-number { color: #f0abfc; }
        .tk-builtin { color: #67e8f9; }
        .ph-blank {
          background: rgba(239, 68, 68, 0.15);
          color: #fca5a5;
          padding: 1px 6px;
          border: 1px dashed rgba(239,68,68,0.5);
          border-radius: 4px;
          text-shadow: 0 0 8px rgba(239,68,68,0.5);
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
