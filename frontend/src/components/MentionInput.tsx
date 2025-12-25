import { useState, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  points: number;
}

interface MentionInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
  className?: string;
  autoFocus?: boolean;
}

export const MentionInput = ({
  value,
  onChange,
  placeholder,
  rows = 3,
  className,
  autoFocus
}: MentionInputProps) => {
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [mentionQuery, setMentionQuery] = useState("");
  const [mentionStart, setMentionStart] = useState(-1);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Search users for mentions
  const { data: usersData } = useQuery({
    queryKey: ["users-search", mentionQuery],
    queryFn: async () => {
      const res: any = await api.searchUsers(mentionQuery);
      return res.data;
    },
    enabled: mentionQuery.length >= 2,
  });

  const users: User[] = usersData || [];

  // Handle text change
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const cursorPos = e.target.selectionStart;
    
    onChange(newValue);

    // Check if we're typing a mention
    const textBeforeCursor = newValue.substring(0, cursorPos);
    const lastAtIndex = textBeforeCursor.lastIndexOf("@");
    
    if (lastAtIndex !== -1) {
      const textAfterAt = textBeforeCursor.substring(lastAtIndex + 1);
      
      // Check if there's no space after @
      if (!textAfterAt.includes(" ") && !textAfterAt.includes("\n")) {
        setMentionStart(lastAtIndex);
        setMentionQuery(textAfterAt);
        setShowSuggestions(true);
        setSelectedIndex(0);
        return;
      }
    }
    
    setShowSuggestions(false);
  };

  // Handle key down for navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (!showSuggestions || users.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % users.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + users.length) % users.length);
    } else if (e.key === "Enter" || e.key === "Tab") {
      e.preventDefault();
      selectUser(users[selectedIndex]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
    }
  };

  // Select a user from suggestions
  const selectUser = (user: User) => {
    if (mentionStart === -1) return;

    const before = value.substring(0, mentionStart);
    const after = value.substring(textareaRef.current?.selectionStart || value.length);
    const newValue = `${before}@${user.username} ${after}`;
    
    onChange(newValue);
    setShowSuggestions(false);
    setMentionQuery("");
    
    // Set cursor position after the mention
    setTimeout(() => {
      const newCursorPos = mentionStart + user.username.length + 2;
      textareaRef.current?.setSelectionRange(newCursorPos, newCursorPos);
      textareaRef.current?.focus();
    }, 0);
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target as Node) &&
        textareaRef.current &&
        !textareaRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        rows={rows}
        className={className}
        autoFocus={autoFocus}
      />

      {/* Mention Suggestions */}
      {showSuggestions && users.length > 0 && (
        <div
          ref={suggestionsRef}
          className="absolute z-50 w-full max-w-sm mt-1 glass rounded-lg border border-border shadow-lg overflow-hidden"
        >
          <div className="max-h-60 overflow-y-auto">
            {users.map((user, index) => (
              <button
                key={user.id}
                onClick={() => selectUser(user)}
                className={cn(
                  "w-full flex items-center gap-3 p-3 text-left transition-colors",
                  index === selectedIndex
                    ? "bg-primary/20"
                    : "hover:bg-muted/50"
                )}
              >
                <Avatar className="w-8 h-8">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback>{user.name[0]}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{user.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    @{user.username} · {user.points} pts
                  </div>
                </div>
              </button>
            ))}
          </div>
          <div className="px-3 py-2 text-xs text-muted-foreground border-t border-border bg-muted/30">
            Use ↑↓ to navigate, Enter to select, Esc to close
          </div>
        </div>
      )}
    </div>
  );
};
