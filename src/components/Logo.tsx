type Props = {
  size?: number;
};

export function Logo({ size = 32 }: Props) {
  return (
    <div
      className="flex items-center justify-center rounded-lg bg-[var(--color-facio-blue)] font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.55 }}
      aria-label="Facio"
    >
      <span className="leading-none">f</span>
      <span
        className="ml-[1px] rounded-full bg-[var(--color-menta)]"
        style={{ width: size * 0.14, height: size * 0.14 }}
      />
    </div>
  );
}
