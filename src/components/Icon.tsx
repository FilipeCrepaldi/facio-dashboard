import {
  IconAddressBook,
  IconAlertTriangle,
  IconBeach,
  IconBell,
  IconBook,
  IconBooks,
  IconBrain,
  IconBrandSlack,
  IconBriefcase,
  IconBuildingStore,
  IconCalendar,
  IconChartBar,
  IconChartPie,
  IconCheck,
  IconCircleCheck,
  IconClock,
  IconCode,
  IconCoin,
  IconCompass,
  IconCreditCard,
  IconDatabase,
  IconDeviceMobile,
  IconFile,
  IconFileText,
  IconFlag,
  IconFolder,
  IconGauge,
  IconHeadset,
  IconHelpCircle,
  IconHome,
  IconKey,
  IconLink,
  IconList,
  IconMail,
  IconMessage,
  IconPalette,
  IconPhone,
  IconRocket,
  IconSettings,
  IconShield,
  IconSitemap,
  IconStar,
  IconTag,
  IconTerminal,
  IconTicket,
  IconTools,
  IconTrendingUp,
  IconUsers,
  IconWorld,
} from "@tabler/icons-react";
import type { Icon as TablerIcon } from "@tabler/icons-react";

const ICONS: Record<string, TablerIcon> = {
  "address-book": IconAddressBook,
  "alert-triangle": IconAlertTriangle,
  beach: IconBeach,
  bell: IconBell,
  book: IconBook,
  books: IconBooks,
  brain: IconBrain,
  "brand-slack": IconBrandSlack,
  briefcase: IconBriefcase,
  "building-store": IconBuildingStore,
  calendar: IconCalendar,
  "chart-bar": IconChartBar,
  "chart-pie": IconChartPie,
  check: IconCheck,
  "circle-check": IconCircleCheck,
  clock: IconClock,
  code: IconCode,
  coin: IconCoin,
  compass: IconCompass,
  "credit-card": IconCreditCard,
  database: IconDatabase,
  "device-mobile": IconDeviceMobile,
  file: IconFile,
  "file-text": IconFileText,
  flag: IconFlag,
  folder: IconFolder,
  gauge: IconGauge,
  headset: IconHeadset,
  "help-circle": IconHelpCircle,
  home: IconHome,
  key: IconKey,
  link: IconLink,
  list: IconList,
  mail: IconMail,
  message: IconMessage,
  palette: IconPalette,
  phone: IconPhone,
  rocket: IconRocket,
  settings: IconSettings,
  shield: IconShield,
  sitemap: IconSitemap,
  star: IconStar,
  tag: IconTag,
  terminal: IconTerminal,
  ticket: IconTicket,
  tools: IconTools,
  "trending-up": IconTrendingUp,
  users: IconUsers,
  world: IconWorld,
};

export const ICON_NAMES = Object.keys(ICONS).sort();

type Props = {
  name?: string | null;
  size?: number;
  className?: string;
};

export function Icon({ name, size = 16, className }: Props) {
  const Component = name ? ICONS[name] : undefined;

  if (!Component) {
    return (
      <span
        aria-hidden
        className={[
          "inline-block h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-50",
          className ?? "",
        ].join(" ")}
      />
    );
  }

  return (
    <Component
      size={size}
      stroke={1.75}
      className={["shrink-0", className ?? ""].join(" ")}
      aria-hidden
    />
  );
}
