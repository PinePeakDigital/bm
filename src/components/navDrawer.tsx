import { useEffect, useState } from "preact/hooks";
import { JSX } from "preact/jsx-runtime";
import {
  BookOpen,
  CirclePlus,
  Gem,
  LifeBuoy,
  LogOut,
  Menu,
  Newspaper,
  Settings,
  TreePalm,
  X,
} from "lucide-preact";
import { logout } from "../auth";
import { beeminderAuthUrl } from "../lib/beeminderAuthUrl";
import breakDatesUrl from "../lib/breakDatesUrl";
import ViewLink from "./viewLink";
import "./navDrawer.css";

// The global navigation drawer: a hamburger pinned to the top-right of every
// authenticated page that slides out a panel of the rarely-used actions. These
// used to be a row of unlabelled icons crammed into the dashboard header; most
// just deep-link out to Beeminder, so they live here behind labels instead,
// leaving the header for the frequent controls (filter + refresh).

type BaseItem = { name: string; icon: JSX.Element };
// Opens an external site in this tab/new tab via a real anchor.
type ExternalItem = BaseItem & { href: string };
// Runs an in-app action (usually a Beeminder deep-link or logout).
type ButtonItem = BaseItem & { onClick: () => void };
// Navigates client-side to one of our own routes.
type RouteItem = BaseItem & { to: string };
type DrawerItem = ExternalItem | ButtonItem | RouteItem;

// Beeminder actions that bounce out to beeminder.com (authenticated deep-links).
const beeminderActions: DrawerItem[] = [
  {
    name: "Add goal",
    icon: <CirclePlus />,
    onClick: () => {
      window.location.href = beeminderAuthUrl("https://beeminder.com/new");
    },
  },
  {
    name: "Add breaks",
    icon: <TreePalm />,
    onClick: () => {
      const start = window.prompt("Start date (YYYY-MM-DD)") || "";
      const finish = window.prompt("Finish date (YYYY-MM-DD)") || "";
      const url = breakDatesUrl(start, finish);
      if (!url) {
        window.alert("Invalid date format. Please use YYYY-MM-DD.");
        return;
      }
      window.open(beeminderAuthUrl(url), "_blank", "noopener,noreferrer");
    },
  },
  {
    name: "Account settings",
    icon: <Settings />,
    onClick: () => {
      window.location.href = beeminderAuthUrl(
        "https://beeminder.com/settings/account"
      );
    },
  },
  {
    name: "Premium",
    icon: <Gem />,
    onClick: () => {
      window.location.href = beeminderAuthUrl(
        "https://www.beeminder.com/premium"
      );
    },
  },
];

// bm's own pages.
const bmLinks: DrawerItem[] = [
  { name: "How bm works", icon: <BookOpen />, to: "/docs" },
];

// Beeminder's own help/reference sites.
const beeminderLinks: DrawerItem[] = [
  { name: "Beeminder blog", icon: <Newspaper />, href: "https://blog.beeminder.com/" },
  { name: "Beeminder help", icon: <LifeBuoy />, href: "https://help.beeminder.com/" },
];

const sessionActions: DrawerItem[] = [
  { name: "Log out", icon: <LogOut />, onClick: logout },
];

// A single drawer row. Every variant closes the drawer when activated, so the
// panel never lingers open over the page the user just navigated to.
function DrawerRow({ item, close }: { item: DrawerItem; close: () => void }) {
  if ("to" in item) {
    return (
      <ViewLink to={item.to} class="navDrawer__row" onClick={close}>
        {item.icon}
        <span>{item.name}</span>
      </ViewLink>
    );
  }
  if ("href" in item) {
    return (
      <a
        class="navDrawer__row"
        href={item.href}
        target="_blank"
        rel="noreferrer"
        onClick={close}
      >
        {item.icon}
        <span>{item.name}</span>
      </a>
    );
  }
  return (
    <button
      class="navDrawer__row"
      onClick={() => {
        item.onClick();
        close();
      }}
    >
      {item.icon}
      <span>{item.name}</span>
    </button>
  );
}

const groups: DrawerItem[][] = [
  beeminderActions,
  bmLinks,
  beeminderLinks,
  sessionActions,
];

export default function NavDrawer() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  // Escape closes the drawer, mirroring the goal pager's keyboard handling.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <button
        class="icon-button navDrawer__trigger"
        title="Menu"
        aria-label="Menu"
        aria-expanded={open}
        onClick={() => setOpen(true)}
      >
        <Menu />
      </button>

      {open && (
        <div class="navDrawer__overlay" onClick={close}>
          <nav
            class="navDrawer__panel"
            aria-label="Navigation"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              class="icon-button navDrawer__close"
              title="Close menu"
              aria-label="Close menu"
              onClick={close}
            >
              <X />
            </button>
            {groups.map((group, i) => (
              <div key={i} class="navDrawer__group">
                {group.map((item) => (
                  <DrawerRow key={item.name} item={item} close={close} />
                ))}
              </div>
            ))}
          </nav>
        </div>
      )}
    </>
  );
}
