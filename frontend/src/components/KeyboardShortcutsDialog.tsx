import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Keyboard } from "lucide-react";

interface KeyboardShortcutsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface Shortcut {
  keys: string[];
  description: string;
  category: string;
}

const shortcuts: Shortcut[] = [
  // Navigation
  { keys: ['H'], description: 'Go to Home', category: 'Navigation' },
  { keys: ['E'], description: 'Go to Explore', category: 'Navigation' },
  { keys: ['D'], description: 'Go to Dashboard', category: 'Navigation' },
  
  // Actions
  { keys: ['/'], description: 'Focus search', category: 'Actions' },
  { keys: ['C'], description: 'Create new question', category: 'Actions' },
  { keys: ['Esc'], description: 'Close dialogs/modals', category: 'Actions' },
  
  // Help
  { keys: ['Shift', '?'], description: 'Show this help dialog', category: 'Help' },
];

const categories = Array.from(new Set(shortcuts.map(s => s.category)));

export function KeyboardShortcutsDialog({ open, onOpenChange }: KeyboardShortcutsDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Keyboard className="w-6 h-6 text-primary" />
            Keyboard Shortcuts
          </DialogTitle>
          <DialogDescription>
            Use these keyboard shortcuts to navigate faster
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {categories.map((category) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
                {category}
              </h3>
              <div className="space-y-2">
                {shortcuts
                  .filter((s) => s.category === category)
                  .map((shortcut, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <span className="text-sm text-foreground">
                        {shortcut.description}
                      </span>
                      <div className="flex items-center gap-1">
                        {shortcut.keys.map((key, keyIndex) => (
                          <span key={keyIndex} className="flex items-center gap-1">
                            <kbd className="px-2.5 py-1.5 text-xs font-semibold text-foreground bg-background border border-border rounded-md shadow-sm">
                              {key}
                            </kbd>
                            {keyIndex < shortcut.keys.length - 1 && (
                              <span className="text-muted-foreground text-xs">+</span>
                            )}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 p-4 rounded-lg bg-primary/10 border border-primary/20">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Pro tip:</span> Press{' '}
            <kbd className="px-2 py-1 text-xs font-semibold bg-background border border-border rounded">
              ?
            </kbd>{' '}
            anytime to see this dialog
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
