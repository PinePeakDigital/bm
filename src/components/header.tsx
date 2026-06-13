import { useIsFetching } from "@tanstack/react-query";
import { logout } from "../auth";
import { beeminderAuthUrl } from "../lib/beeminderAuthUrl";
import queryClient from "../queryClient";
import "./header.css";
import { JSX } from "preact/jsx-runtime";
import {
  CirclePlus,
  Gem,
  LifeBuoy,
  LogOut,
  Newspaper,
  RefreshCw,
  Settings,
  TreePalm,
  X,
} from "lucide-preact";

type Item = {
  name: string;
  icon: string | JSX.Element;
  getClasses?: (isFetching: number) => string;
};

type ItemLink = Item & {
  url: string;
};

type ItemButton = Item & {
  onClick: () => void;
};

const items: (ItemLink | ItemButton)[] = [
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
      const datePattern = /^\d{4}-\d{2}-\d{2}$/;
      if (!datePattern.test(start) || !datePattern.test(finish)) {
        window.alert("Invalid date format. Please use YYYY-MM-DD.");
        return;
      }
      const url = beeminderAuthUrl(
        `https://beeminder.com/breaks?start=${start}&finish=${finish}`
      );
      window.open(url, "_blank", "noopener,noreferrer");
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
    name: "Blog",
    icon: <Newspaper />,
    url: "https://blog.beeminder.com/",
  },
  {
    name: "Docs",
    icon: <LifeBuoy />,
    url: "https://help.beeminder.com/",
  },
  {
    name: "Premium",
    icon: <Gem />,
    onClick: () => {
      window.location.href = beeminderAuthUrl("https://www.beeminder.com/premium");
    },
  },
  {
    name: "Logout",
    icon: <LogOut />,
    onClick: logout,
  },
  {
    name: "Refresh",
    icon: <RefreshCw />,
    onClick: () => void queryClient.refetchQueries(),
    getClasses: (isFetching) => (isFetching ? "spin" : ""),
  },
];

export default function Header({
  search,
  setSearch,
}: {
  search: string;
  setSearch: (s: string) => void;
}) {
  const isFetching = useIsFetching();

  return (
    <div class="main-header">
      <div class="global-controls">
        <span class="filter">
          <input
            type="text"
            placeholder="filter"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
          />
          <button class="icon-button" onClick={() => setSearch("")}>
            <X />
          </button>
        </span>

        <span class="buttons">
          {items.map((item) => {
            const props = {
              key: item.name,
              class: `icon-button ${item.getClasses?.(isFetching) || ""}`,
              title: item.name,
            };
            return "url" in item ? (
              <a href={item.url} {...props}>
                {item.icon}
              </a>
            ) : (
              <button onClick={item.onClick} {...props}>
                {item.icon}
              </button>
            );
          })}
        </span>
      </div>
    </div>
  );
}
