/**
 * Semantic design tokens for the mobile app.
 *
 * These tokens mirror the naming conventions used in web artifacts (index.css)
 * so that multi-artifact projects share a cohesive visual identity.
 *
 * Replace the placeholder values below with values that match the project's
 * brand. If a sibling web artifact exists, read its index.css and convert the
 * HSL values to hex so both artifacts use the same palette.
 *
 * To add dark mode, add a `dark` key with the same token names.
 * The useColors() hook will automatically pick it up.
 */

const colors = {
  light: {
    // Legacy aliases (kept for backward compatibility)
    text: '#E8F0F6',
    tint: '#24D6B5',

    // Core surfaces
    background: '#07131F',
    foreground: '#E8F0F6',

    // Cards / elevated surfaces
    card: '#102333',
    cardForeground: '#E8F0F6',

    // Primary action color (buttons, links, active states)
    primary: '#24D6B5',
    primaryForeground: '#07131F',

    // Secondary / less-emphasis interactive surfaces
    secondary: '#183346',
    secondaryForeground: '#DCE9F1',

    // Muted / subdued elements (dividers, timestamps, placeholders)
    muted: '#142A3A',
    mutedForeground: '#8EA6B8',

    // Accent highlights (badges, selected items, focus rings)
    accent: '#173A4B',
    accentForeground: '#B8F4E7',

    // Destructive actions (delete, error states)
    destructive: '#FF6B6B',
    destructiveForeground: '#FFFFFF',

    // Borders and input outlines
    border: '#24465A',
    input: '#24465A',
  },

  // Border radius (in px). Sync from the sibling web artifact's --radius
  // CSS variable. This value applies to cards, buttons, inputs, and modals.
  radius: 8,
};

export default colors;
