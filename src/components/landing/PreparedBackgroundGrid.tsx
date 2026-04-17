export function PreparedBackgroundGrid() {
  return (
    <div className="absolute inset-x-0 inset-y-0 w-full h-full pointer-events-none z-0 overflow-hidden mix-blend-overlay">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-12 h-full">
        {/* We use a grid to create the 4 thin vertical lines (left edge, inner 1, inner 2, right edge) */}
        <div className="w-full h-full grid grid-cols-3 border-x border-indigo-600/[0.04]">
          <div className="h-full border-r border-indigo-600/[0.04]"></div>
          <div className="h-full border-r border-indigo-600/[0.04]"></div>
          <div className="h-full"></div>
        </div>
      </div>
    </div>
  );
}
