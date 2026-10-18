import { heroui } from "@heroui/theme";
// Primary is the logo's blue (public/icon.svg).
const primary = { DEFAULT: "#1f6fe0", foreground: "#ffffff" };

export default heroui({
  themes: {
    light: { colors: { primary } },
    dark: { colors: { primary } },
  },
});
