import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CodeBlock, InlineCode } from "./CodeBlock";
import {
  Bold,
  Italic,
  Code,
  Link,
  List,
  ListOrdered,
  Quote,
  Heading2,
  Eye,
  Edit3,
  Code2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  minHeight?: string;
  showToolbar?: boolean;
  showPreview?: boolean;
}

export function MarkdownEditor({
  value,
  onChange,
  placeholder = "Write your content here... (Markdown supported)",
  minHeight = "300px",
  showToolbar = true,
  showPreview = true,
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");

  const insertMarkdown = (before: string, after: string = "") => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newText);

    // Set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + before.length,
        start + before.length + selectedText.length
      );
    }, 0);
  };

  const toolbarButtons = [
    {
      icon: Bold,
      label: "Bold",
      action: () => insertMarkdown("**", "**"),
    },
    {
      icon: Italic,
      label: "Italic",
      action: () => insertMarkdown("*", "*"),
    },
    {
      icon: Code,
      label: "Inline Code",
      action: () => insertMarkdown("`", "`"),
    },
    {
      icon: Code2,
      label: "Code Block",
      action: () => insertMarkdown("\n```javascript\n", "\n```\n"),
    },
    {
      icon: Heading2,
      label: "Heading",
      action: () => insertMarkdown("## "),
    },
    {
      icon: Link,
      label: "Link",
      action: () => insertMarkdown("[", "](url)"),
    },
    {
      icon: List,
      label: "Bullet List",
      action: () => insertMarkdown("\n- "),
    },
    {
      icon: ListOrdered,
      label: "Numbered List",
      action: () => insertMarkdown("\n1. "),
    },
    {
      icon: Quote,
      label: "Quote",
      action: () => insertMarkdown("\n> "),
    },
  ];

  return (
    <div className="space-y-2">
      {showToolbar && (
        <div className="flex items-center gap-1 flex-wrap p-2 rounded-lg bg-muted/30 border border-border">
          {toolbarButtons.map((button, index) => {
            const Icon = button.icon;
            return (
              <Button
                key={index}
                type="button"
                variant="ghost"
                size="sm"
                onClick={button.action}
                title={button.label}
                className="h-8 w-8 p-0"
              >
                <Icon className="w-4 h-4" />
              </Button>
            );
          })}
        </div>
      )}

      {showPreview ? (
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="write" className="gap-2">
              <Edit3 className="w-4 h-4" />
              Write
            </TabsTrigger>
            <TabsTrigger value="preview" className="gap-2">
              <Eye className="w-4 h-4" />
              Preview
            </TabsTrigger>
          </TabsList>

          <TabsContent value="write" className="mt-2">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="font-mono"
              style={{ minHeight }}
            />
          </TabsContent>

          <TabsContent value="preview" className="mt-2">
            <div
              className="prose prose-sm dark:prose-invert max-w-none p-4 rounded-lg border border-border bg-muted/30"
              style={{ minHeight }}
            >
              {value ? (
                <MarkdownPreview content={value} />
              ) : (
                <p className="text-muted-foreground italic">
                  Nothing to preview yet...
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>
      ) : (
        <Textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="font-mono"
          style={{ minHeight }}
        />
      )}

      {/* Markdown Guide */}
      <details className="text-xs text-muted-foreground">
        <summary className="cursor-pointer hover:text-foreground">
          Markdown Guide
        </summary>
        <div className="mt-2 space-y-1 pl-4">
          <p>
            <InlineCode>**bold**</InlineCode> → <strong>bold</strong>
          </p>
          <p>
            <InlineCode>*italic*</InlineCode> → <em>italic</em>
          </p>
          <p>
            <InlineCode>`code`</InlineCode> → <code>code</code>
          </p>
          <p>
            <InlineCode>[link](url)</InlineCode> → link
          </p>
          <p>
            <InlineCode>## Heading</InlineCode> → Heading
          </p>
          <p>
            <InlineCode>- List item</InlineCode> → • List item
          </p>
          <p>
            <InlineCode>&gt; Quote</InlineCode> → Quote
          </p>
        </div>
      </details>
    </div>
  );
}

// Markdown Preview Component
export function MarkdownPreview({ content }: { content: string }) {
  return (
    <ReactMarkdown
      remarkPlugins={[remarkGfm]}
      components={{
        code({ node, inline, className, children, ...props }) {
          const match = /language-(\w+)/.exec(className || "");
          const language = match ? match[1] : "text";

          if (inline) {
            return <InlineCode>{children}</InlineCode>;
          }

          return (
            <CodeBlock
              code={String(children).replace(/\n$/, "")}
              language={language}
              showLineNumbers={true}
            />
          );
        },
        a({ node, children, href, ...props }) {
          return (
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline"
              {...props}
            >
              {children}
            </a>
          );
        },
        img({ node, src, alt, ...props }) {
          return (
            <img
              src={src}
              alt={alt}
              className="rounded-lg max-w-full h-auto"
              loading="lazy"
              {...props}
            />
          );
        },
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
