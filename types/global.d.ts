export {};

declare global {
  interface Window {
    /** Custom event tracker from https://www.dealwithmuhammad.com/dwm.js (absent if blocked). */
    dwm?: (name: string) => void;
  }
}
