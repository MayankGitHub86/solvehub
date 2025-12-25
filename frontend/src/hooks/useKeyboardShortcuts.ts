import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  description: string;
  action: () => void;
}

export function useKeyboardShortcuts(
  shortcuts: KeyboardShortcut[],
  enabled: boolean = true
) {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in input fields
      const target = event.target as HTMLElement;
      const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
      
      shortcuts.forEach((shortcut) => {
        // Skip if event.key or shortcut.key is undefined
        if (!event.key || !shortcut.key) return;
        
        const ctrlMatch = shortcut.ctrl ? event.ctrlKey || event.metaKey : !event.ctrlKey && !event.metaKey;
        const shiftMatch = shortcut.shift ? event.shiftKey : !event.shiftKey;
        const altMatch = shortcut.alt ? event.altKey : !event.altKey;
        const keyMatch = event.key.toLowerCase() === shortcut.key.toLowerCase();

        // Special handling for '/' - allow even in inputs
        if (shortcut.key === '/' && keyMatch && !event.ctrlKey && !event.shiftKey && !event.altKey) {
          event.preventDefault();
          shortcut.action();
          return;
        }

        // For other shortcuts, skip if in input field
        if (isInput && shortcut.key !== '/') return;

        if (ctrlMatch && shiftMatch && altMatch && keyMatch) {
          event.preventDefault();
          shortcut.action();
        }
      });
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [shortcuts, enabled]);
}

// Global keyboard shortcuts hook
export function useGlobalKeyboardShortcuts(
  onAskQuestion: () => void,
  onShowHelp: () => void,
  onFocusSearch: () => void
) {
  const navigate = useNavigate();

  const shortcuts: KeyboardShortcut[] = [
    {
      key: '/',
      description: 'Focus search',
      action: onFocusSearch,
    },
    {
      key: 'c',
      description: 'Create question',
      action: onAskQuestion,
    },
    {
      key: 'h',
      description: 'Go to home',
      action: () => navigate('/'),
    },
    {
      key: 'e',
      description: 'Go to explore',
      action: () => navigate('/explore'),
    },
    {
      key: 'd',
      description: 'Go to dashboard',
      action: () => navigate('/dashboard'),
    },
    {
      key: '?',
      shift: true,
      description: 'Show keyboard shortcuts',
      action: onShowHelp,
    },
    {
      key: 'Escape',
      description: 'Close dialogs',
      action: () => {
        // This will be handled by individual components
      },
    },
  ];

  useKeyboardShortcuts(shortcuts);
}
