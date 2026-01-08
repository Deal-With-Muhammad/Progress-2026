import {
  Navbar as HeroUINavbar,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarBrand,
  NavbarItem,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Kbd } from "@heroui/kbd";
import { Link } from "@heroui/link";
import { Input } from "@heroui/input";
import { link as linkStyles } from "@heroui/theme";
import NextLink from "next/link";
import clsx from "clsx";
import { getFlagEmoji } from "@/lib/utils";
import { FaMapMarkerAlt } from "react-icons/fa";

import { siteConfig } from "@/config/site";
import { ThemeSwitch } from "@/components/theme-switch";
import {
  TwitterIcon,
  GithubIcon,
  DiscordIcon,
  HeartFilledIcon,
  SearchIcon,
  Logo,
} from "@/components/icons";
import type { LocationData } from "@/types";

interface NavbarProps {
  onLocationClick: () => void;
  currentLocation: LocationData;
}

export default function Navbar({
  onLocationClick,
  currentLocation,
}: NavbarProps) {
  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      <NavbarContent
        className="hidden sm:flex basis-1/5 sm:basis-full"
        justify="end"
      >
        <NavbarItem className="hidden sm:flex gap-2">
          <Link isExternal aria-label="Github" href={siteConfig.links.github}>
            <GithubIcon className="text-default-500" />
          </Link>
          <ThemeSwitch />
        </NavbarItem>
        <Button onClick={onLocationClick} className="flex items-center gap-2">
          <FaMapMarkerAlt className=" h-6 text-default-500" />
          <span className="font-medium text-default-500 ">Location</span>
        </Button>
      </NavbarContent>

      <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
        <Link isExternal aria-label="Github" href={siteConfig.links.github}>
          <GithubIcon className="text-default-500" />
        </Link>
        <ThemeSwitch />
        <Button onClick={onLocationClick} className="flex items-center gap-2">
          <FaMapMarkerAlt className=" h-6 text-default-500" />
          <span className="font-medium text-default-500 ">Location</span>
        </Button>
      </NavbarContent>
    </HeroUINavbar>
  );
}
