import { useEffect, useState } from "react";
import { Keyboard, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function KeyboardShortcutHint() {
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the hint before
    const dismissed = localStorage.getItem("keyboard-hint-dismissed");
    if (dismissed) {
      setIsDismissed(true);
      return;
    }

    // Show hint after 2 seconds
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    // Auto-hide after 8 seconds
    const hideTimer = setTimeout(() => {
      setIsVisible(false);
    }, 10000);

    return () => {
      clearTimeout(timer);
      clearTimeout(hideTimer);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setIsDismissed(true);
    localStorage.setItem("keyboard-hint-dismissed", "true");
  };

  if (isDismissed) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50 transition-all duration-500 transform",
        isVisible
          ? "translate-y-0 opacity-100"
          : "translate-y-4 opacity-0 pointer-events-none"
      )}
    >
      <div className="glass-strong border border-primary/20 rounded-xl p-4 shadow-2xl max-w-sm">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Keyboard className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <h4 className="font-semibold text-sm mb-1">Keyboard Shortcuts</h4>
            <p className="text-xs text-muted-foreground mb-2">
              Press{" "}
              <kbd className="px-1.5 py-0.5 text-xs font-semibold bg-background border border-border rounded">
                ?
              </kbd>{" "}
              to see all shortcuts
            </p>
            <div className="flex gap-2 text-xs">
              <span className="text-muted-foreground">
                <kbd className="px-1.5 py-0.5 font-semibold bg-background border border-border rounded">
                  /
                </kbd>{" "}
                Search
              </span>
              <span className="text-muted-foreground">
                <kbd className="px-1.5 py-0.5 font-semibold bg-background border border-border rounded">
                  C
                </kbd>{" "}
                Ask
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full"
            onClick={handleDismiss}
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
