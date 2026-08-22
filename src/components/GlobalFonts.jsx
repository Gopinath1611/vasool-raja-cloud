export default function GlobalFonts() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Manrope:wght@500;700;800&family=Inter:wght@400;500;600&family=Noto+Sans+Tamil:wght@500;700&family=JetBrains+Mono:wght@600&display=swap');
      * { font-family: 'Inter', ui-sans-serif, system-ui; }
      .disp { font-family: 'Manrope', 'Inter', sans-serif; letter-spacing: -0.01em; }
      .tamil { font-family: 'Noto Sans Tamil', sans-serif; }
      .mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
      .hide-scrollbar::-webkit-scrollbar { display: none; }
      .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    `}</style>
  );
}
