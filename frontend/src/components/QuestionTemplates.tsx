import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Bug, Lightbulb, Code2, HelpCircle } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  description: string;
  icon: any;
  title: string;
  content: string;
  tags: string[];
}

const templates: Template[] = [
  {
    id: "bug-report",
    name: "Bug Report",
    description: "Report a bug or unexpected behavior",
    icon: Bug,
    title: "[Bug] Brief description of the issue",
    content: `## Description
Describe the bug clearly and concisely.

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Code Example
\`\`\`javascript
// Your code here
\`\`\`

## Error Message
\`\`\`
Paste error message here
\`\`\`

## Environment
- OS: [e.g., Windows 10, macOS 12]
- Browser: [e.g., Chrome 96, Firefox 95]
- Version: [e.g., 1.0.0]

## Additional Context
Add any other context about the problem here.`,
    tags: ["bug", "help"],
  },
  {
    id: "feature-request",
    name: "Feature Request",
    description: "Suggest a new feature or enhancement",
    icon: Lightbulb,
    title: "[Feature] Brief description of the feature",
    content: `## Problem Statement
Describe the problem you're trying to solve.

## Proposed Solution
Describe your proposed solution clearly.

## Use Case
Explain how this feature would be used.

## Example
\`\`\`javascript
// Example of how the feature might work
\`\`\`

## Alternatives Considered
What other solutions have you considered?

## Benefits
- Benefit 1
- Benefit 2
- Benefit 3

## Additional Context
Add any other context or screenshots about the feature request here.`,
    tags: ["feature-request", "enhancement"],
  },
  {
    id: "code-review",
    name: "Code Review",
    description: "Request feedback on your code",
    icon: Code2,
    title: "Code Review: [Brief description]",
    content: `## Context
Explain what your code does and what you're trying to achieve.

## Code
\`\`\`javascript
// Paste your code here
function example() {
  // Your implementation
}
\`\`\`

## Specific Questions
1. Is this approach correct?
2. How can I improve performance?
3. Are there any security concerns?

## What I've Tried
- Approach 1: ...
- Approach 2: ...

## Concerns
- Performance
- Readability
- Best practices

## Additional Information
- Framework/Library: [e.g., React, Vue]
- Version: [e.g., 18.2.0]`,
    tags: ["code-review", "best-practices"],
  },
  {
    id: "how-to",
    name: "How-To Question",
    description: "Ask how to accomplish something",
    icon: HelpCircle,
    title: "How to [accomplish specific task]?",
    content: `## Goal
Clearly state what you're trying to accomplish.

## Current Situation
Describe your current setup and what you have so far.

## What I've Tried
\`\`\`javascript
// Code you've already tried
\`\`\`

## Expected Outcome
Describe what you want to achieve.

## Constraints
- Must work with [technology/version]
- Should be compatible with [requirement]
- Performance considerations

## Research Done
- Checked documentation: [link]
- Tried tutorial: [link]
- Similar questions: [link]

## Additional Context
Any other relevant information.`,
    tags: ["how-to", "help"],
  },
  {
    id: "general",
    name: "General Question",
    description: "Ask a general programming question",
    icon: FileText,
    title: "Your question title here",
    content: `## Question
State your question clearly and concisely.

## Context
Provide relevant background information.

## Code (if applicable)
\`\`\`javascript
// Your code here
\`\`\`

## What I've Tried
Describe what you've already attempted.

## Expected Result
What you expect to happen.

## Actual Result
What actually happens.

## Additional Information
Any other relevant details.`,
    tags: ["question"],
  },
];

interface QuestionTemplatesProps {
  onSelectTemplate: (template: Template) => void;
}

export function QuestionTemplates({ onSelectTemplate }: QuestionTemplatesProps) {
  const [open, setOpen] = useState(false);

  const handleSelectTemplate = (template: Template) => {
    onSelectTemplate(template);
    setOpen(false);
    toast.success(`Template "${template.name}" applied!`);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <FileText className="w-4 h-4" />
          Use Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <FileText className="w-6 h-6 text-primary" />
            Question Templates
          </DialogTitle>
          <DialogDescription>
            Choose a template to help structure your question effectively
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          {templates.map((template) => {
            const Icon = template.icon;
            return (
              <Card
                key={template.id}
                className="cursor-pointer hover:border-primary/50 transition-all duration-200 hover:shadow-lg"
                onClick={() => handleSelectTemplate(template)}
              >
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <Icon className="w-5 h-5 text-primary" />
                    </div>
                    {template.name}
                  </CardTitle>
                  <CardDescription>{template.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {template.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2 py-1 text-xs rounded-full bg-secondary/20 text-secondary-foreground"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="mt-4 p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
          <p className="text-sm text-blue-600 dark:text-blue-400">
            <strong>💡 Tip:</strong> Using templates helps you provide all necessary
            information, making it easier for others to help you!
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
