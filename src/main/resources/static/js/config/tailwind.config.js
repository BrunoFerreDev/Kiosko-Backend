window.tailwindConfig = {
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "on-background": "#121c28",
        "inverse-surface": "#27313e",
        "outline-variant": "#c3c6d7",
        "surface-container-highest": "#d9e3f4",
        "surface": "#f8f9ff",
        "on-primary-fixed-variant": "#003ea8",
        "surface-container-high": "#dfe9fa",
        "surface-tint": "#0053db",
        "tertiary-fixed-dim": "#ffb596",
        "secondary": "#904d00",
        "primary-fixed": "#dbe1ff",
        "secondary-container": "#fe932c",
        "secondary-fixed": "#ffdcc3",
        "tertiary-container": "#bc4800",
        "surface-variant": "#d9e3f4",
        "outline": "#737686",
        "on-secondary-container": "#663500",
        "secondary-fixed-dim": "#ffb77d",
        "on-error-container": "#93000a",
        "error-container": "#ffdad6",
        "on-primary-fixed": "#00174b",
        "surface-container-lowest": "#ffffff",
        "on-tertiary-container": "#ffede6",
        "on-tertiary-fixed-variant": "#7d2d00",
        "inverse-on-surface": "#eaf1ff",
        "surface-container-low": "#eef4ff",
        "on-primary-container": "#eeefff",
        "primary-container": "#2563eb",
        "on-surface-variant": "#434655",
        "inverse-primary": "#b4c5ff",
        "on-secondary-fixed": "#2f1500",
        "surface-bright": "#f8f9ff",
        "primary-fixed-dim": "#b4c5ff",
        "on-secondary-fixed-variant": "#6e3900",
        "background": "#f8f9ff",
        "on-tertiary-fixed": "#360f00",
        "tertiary-fixed": "#ffdbcd",
        "on-error": "#ffffff",
        "tertiary": "#943700",
        "on-tertiary": "#ffffff",
        "error": "#ba1a1a",
        "on-secondary": "#ffffff",
        "surface-dim": "#d1dbec",
        "on-primary": "#ffffff",
        "on-surface": "#121c28",
        "surface-container": "#e5eeff",
        "primary": "#004ac6"
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "full": "9999px"
      },
      spacing: {
        "gutter": "16px",
        "touch-target-min": "48px",
        "unit": "8px",
        "card-gap": "20px",
        "container-padding": "24px"
      },
      fontFamily: {
        "headline-md-mobile": ["Plus Jakarta Sans"],
        "display-lg": ["Plus Jakarta Sans"],
        "headline-sm": ["Plus Jakarta Sans"],
        "headline-md": ["Plus Jakarta Sans"],
        "data-table": ["Inter"],
        "label-caps": ["Inter"],
        "body-md": ["Inter"],
        "body-lg": ["Inter"]
      },
      fontSize: {
        "headline-md-mobile": ["20px", { "lineHeight": "1.3", "fontWeight": "600" }],
        "display-lg": ["36px", { "lineHeight": "1.2", "letterSpacing": "-0.02em", "fontWeight": "700" }],
        "headline-sm": ["20px", { "lineHeight": "1.4", "fontWeight": "600" }],
        "headline-md": ["24px", { "lineHeight": "1.3", "fontWeight": "600" }],
        "data-table": ["14px", { "lineHeight": "1.4", "fontWeight": "500" }],
        "label-caps": ["12px", { "lineHeight": "1", "letterSpacing": "0.05em", "fontWeight": "600" }],
        "body-md": ["16px", { "lineHeight": "1.5", "fontWeight": "400" }],
        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }]
      },
      boxShadow: {
        "card": "0 4px 12px 0 rgba(0, 0, 0, 0.05)",
        "active": "0 8px 16px 0 rgba(0, 0, 0, 0.08)"
      }
    }
  }
};
if (typeof tailwind !== 'undefined') {
  tailwind.config = window.tailwindConfig;
}
