import { AccessibilityInfo } from 'react-native';

export const a11y = {
  // Screen reader announcements
  announce: (message: string) => {
    AccessibilityInfo.announceForAccessibility(message);
  },

  // Set accessibility focus
  setFocus: (ref: React.RefObject<any>) => {
    if (ref.current) {
      ref.current.setAccessibilityFocus();
    }
  },

  // Generate accessibility labels
  generateLabel: (text: string, context?: string) => {
    return context ? `${text}, ${context}` : text;
  },

  // Accessibility hints
  hints: {
    button: 'Double tap to activate',
    link: 'Double tap to open',
    image: 'Image',
    textInput: 'Double tap to edit',
    switch: 'Double tap to toggle',
    slider: 'Double tap and hold to adjust',
  },
};
