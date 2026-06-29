/**
 * Curated branding font choices. Stored as the CSS family name (≤64 chars per
 * `UpdateBrandingRequestContract.fontFamily`); rendering falls back to the theme
 * default when a family isn't available. An empty value means "use the default".
 */
export const FONT_FAMILIES = [
  'Geist',
  'Inter',
  'Roboto',
  'Montserrat',
  'Poppins',
  'Open Sans',
  'Lato',
  'Nunito',
  'Playfair Display',
  'Merriweather',
  'Georgia',
] as const;
