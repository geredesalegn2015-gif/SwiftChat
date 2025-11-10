import { createGlobalStyle } from "styled-components";

const GlobalStyles = createGlobalStyle`
/* paste the full GlobalStyles you gave earlier — exact content */
:root {
  &, &.light-mode {
    --color-grey-0: #ffffff;
    --color-grey-50: #f6f9fb;
    --color-grey-100: #eef3f7;
    --color-grey-200: #dfe7ed;
    --color-grey-300: #c8d7e1;
    --color-grey-400: #9fb5c4;
    --color-grey-500: #7a94a7;
    --color-grey-600: #5c7284;
    --color-grey-700: #465867;
    --color-grey-800: #2e3e4c;
    --color-grey-900: #1c2b36;

    --color-blue-100: #d7f3ff;
    --color-blue-700: #229ED9;
    --color-green-100: #dcf8c6;
    --color-brand-500: #229ED9;
    --border-radius-md: 8px;
  }

  &.dark-mode {
    --color-grey-0: #0e1621;
    --color-grey-50: #15202b;
    --color-blue-700: #2AABEE;
  }
}

/* rest of your GlobalStyles (copy entire content you provided earlier) */
*, *::before, *::after { box-sizing: border-box; padding:0; margin:0; transition: background-color 0.3s, border 0.3s; }
html { font-size: 62.5%; }
body { font-family: "Poppins", "Segoe UI", Roboto, sans-serif; color: var(--color-grey-800); background-color: var(--color-grey-0); transition: color 0.3s, background-color 0.3s; min-height:100vh; line-height:1.5; font-size:1.6rem; }
`;

export default GlobalStyles;
