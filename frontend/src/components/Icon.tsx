/** A Material Symbol, the icon set the design is drawn with.
 *
 * The name is the ligature Google's font maps to a glyph ("shield", "call_end"),
 * which is exactly what the mockups use — so an icon in a mockup and an icon on
 * screen are the same icon, not an approximation of one.
 */
export function Icon({
  name,
  className = "",
  filled = false,
}: {
  name: string;
  className?: string;
  filled?: boolean;
}) {
  return (
    <span
      aria-hidden="true"
      className={`material-symbols-outlined select-none ${className}`}
      style={filled ? { fontVariationSettings: '"FILL" 1' } : undefined}
    >
      {name}
    </span>
  );
}
