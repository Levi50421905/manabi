/**
 * Kelopak sakura jatuh — dekoratif, murni CSS (tanpa library, tanpa JS).
 * Nilai tiap kelopak ditulis statis (bukan Math.random) agar hasil SSR dan
 * client identik, sehingga tidak ada hydration mismatch.
 */
const PETALS = [
  { left: 3, size: 10, duration: 13, delay: -1 },
  { left: 9, size: 14, duration: 17, delay: -6 },
  { left: 16, size: 9, duration: 11, delay: -9 },
  { left: 23, size: 12, duration: 15, delay: -3 },
  { left: 31, size: 16, duration: 19, delay: -12 },
  { left: 38, size: 11, duration: 14, delay: -7 },
  { left: 45, size: 13, duration: 16, delay: -2 },
  { left: 52, size: 9, duration: 12, delay: -10 },
  { left: 59, size: 15, duration: 18, delay: -5 },
  { left: 66, size: 10, duration: 13, delay: -14 },
  { left: 73, size: 12, duration: 15, delay: -8 },
  { left: 80, size: 14, duration: 17, delay: -4 },
  { left: 87, size: 9, duration: 11, delay: -11 },
  { left: 93, size: 13, duration: 16, delay: -13 },
];

export function SakuraRain() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {PETALS.map((petal, index) => (
        <span
          key={index}
          className="sakura-petal"
          style={{
            left: `${petal.left}%`,
            width: petal.size,
            height: petal.size * 0.85,
            animationDuration: `${petal.duration}s`,
            animationDelay: `${petal.delay}s`,
          }}
        />
      ))}
    </div>
  );
}
