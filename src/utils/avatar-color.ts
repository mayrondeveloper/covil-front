// Paleta soft/pastel alinhada ao tema editorial (gold/amber/emerald/slate-warm).
const PALETTE: { bg: string; text: string }[] = [
  { bg: "#E8D8A8", text: "#5A4518" }, // gold
  { bg: "#F2D9B0", text: "#5A3A10" }, // amber
  { bg: "#CFE4D4", text: "#1F4632" }, // emerald
  { bg: "#E0D6C8", text: "#4A3F33" }, // slate-warm
  { bg: "#EED9C4", text: "#5A3A1C" }, // peach
  { bg: "#D8DCE4", text: "#2F3A4A" }, // cool slate
  { bg: "#E4D3DB", text: "#55324A" }, // dusty rose
  { bg: "#D4DDCB", text: "#3A4A2E" }, // sage
];

const hash = (name: string): number => {
  const s = (name ?? "").trim();
  if (!s) return 0;
  let sum = 0;
  for (let i = 0; i < s.length; i++) sum += s.charCodeAt(i);
  return sum % PALETTE.length;
};

export const colorForName = (name: string): string => PALETTE[hash(name)].bg;
export const bgColorForName = (name: string): string => PALETTE[hash(name)].bg;
export const textColorForName = (name: string): string => PALETTE[hash(name)].text;
