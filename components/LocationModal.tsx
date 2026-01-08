import { useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { SearchIcon } from "./icons";

// All IANA timezones with their UTC offsets
const ALL_TIMEZONES = Intl.supportedValuesOf("timeZone")
  .map((tz) => {
    const now = new Date();
    const tzDate = new Date(now.toLocaleString("en-US", { timeZone: tz }));
    const offset = (tzDate.getTime() - now.getTime()) / (1000 * 60 * 60);

    // Parse timezone to get city and region
    const parts = tz.split("/");
    const city = parts[parts.length - 1].replace(/_/g, " ");
    const region = parts[0];

    return {
      timezone: tz,
      city,
      region,
      offset,
      displayName: `${city} (UTC${offset >= 0 ? "+" : ""}${offset})`,
    };
  })
  .sort((a, b) => {
    // Sort by region first, then by city
    if (a.region !== b.region) return a.region.localeCompare(b.region);
    return a.city.localeCompare(b.city);
  });

function getFlagEmoji(timezone) {
  // Map of timezones to country codes
  const tzToCountry = {
    "America/New_York": "US",
    "America/Los_Angeles": "US",
    "America/Chicago": "US",
    "America/Denver": "US",
    "America/Toronto": "CA",
    "America/Vancouver": "CA",
    "America/Mexico_City": "MX",
    "America/Sao_Paulo": "BR",
    "America/Argentina/Buenos_Aires": "AR",
    "America/Santiago": "CL",
    "America/Lima": "PE",
    "America/Bogota": "CO",
    "Europe/London": "GB",
    "Europe/Paris": "FR",
    "Europe/Berlin": "DE",
    "Europe/Madrid": "ES",
    "Europe/Rome": "IT",
    "Europe/Amsterdam": "NL",
    "Europe/Brussels": "BE",
    "Europe/Vienna": "AT",
    "Europe/Stockholm": "SE",
    "Europe/Oslo": "NO",
    "Europe/Copenhagen": "DK",
    "Europe/Helsinki": "FI",
    "Europe/Warsaw": "PL",
    "Europe/Prague": "CZ",
    "Europe/Budapest": "HU",
    "Europe/Athens": "GR",
    "Europe/Lisbon": "PT",
    "Europe/Dublin": "IE",
    "Europe/Moscow": "RU",
    "Europe/Istanbul": "TR",
    "Asia/Tokyo": "JP",
    "Asia/Seoul": "KR",
    "Asia/Shanghai": "CN",
    "Asia/Hong_Kong": "HK",
    "Asia/Singapore": "SG",
    "Asia/Bangkok": "TH",
    "Asia/Kuala_Lumpur": "MY",
    "Asia/Jakarta": "ID",
    "Asia/Manila": "PH",
    "Asia/Ho_Chi_Minh": "VN",
    "Asia/Kolkata": "IN",
    "Asia/Dubai": "AE",
    "Asia/Jerusalem": "IL",
    "Asia/Riyadh": "SA",
    "Asia/Karachi": "PK",
    "Asia/Dhaka": "BD",
    "Australia/Sydney": "AU",
    "Australia/Melbourne": "AU",
    "Australia/Brisbane": "AU",
    "Australia/Perth": "AU",
    "Pacific/Auckland": "NZ",
    "Africa/Cairo": "EG",
    "Africa/Johannesburg": "ZA",
    "Africa/Lagos": "NG",
    "Africa/Nairobi": "KE",
    "Africa/Casablanca": "MA",
  };

  const countryCode = tzToCountry[timezone] || "UN";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function LocationModal({
  isOpen,
  onClose,
  onSelectLocation,
  currentTimezone,
}) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTimezones = ALL_TIMEZONES.filter(
    (tz) =>
      tz.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tz.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tz.timezone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLocation = (tz) => {
    const locationData = {
      name: `${tz.city}, ${tz.region}`,
      timezone: tz.timezone,
      countryCode: "UN",
      city: tz.city,
      country: tz.region,
    };
    onSelectLocation(locationData);
    onClose();
    setSearchQuery("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="4xl"
      scrollBehavior="inside"
      classNames={{
        base: "max-h-[90vh]",
        body: "py-6",
        footer: "border-t",
      }}
    >
      <ModalContent>
        {(onCloseModal) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-2xl font-bold">Select Location</h2>
            </ModalHeader>

            <ModalBody>
              <div className="mb-4">
                <Input
                  type="text"
                  placeholder="Search city, region, or timezone..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  startContent={<SearchIcon className="text-default-400" />}
                  isClearable
                  onClear={() => setSearchQuery("")}
                  classNames={{
                    input: "text-base",
                    inputWrapper: "h-12",
                  }}
                />
                <p className="text-sm text-default-500 mt-2">
                  {filteredTimezones.length} timezones available
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredTimezones.map((tz) => (
                  <Button
                    key={tz.timezone}
                    onPress={() => handleSelectLocation(tz)}
                    className={`h-auto py-3 px-4 justify-start ${
                      currentTimezone === tz.timezone
                        ? "bg-primary text-primary-foreground"
                        : "bg-default-100"
                    }`}
                    variant={currentTimezone === tz.timezone ? "solid" : "flat"}
                  >
                    <div className="flex items-start gap-2 w-full">
                      <span className="text-2xl flex-shrink-0">
                        {getFlagEmoji(tz.timezone)}
                      </span>
                      <div className="min-w-0 flex-1 text-left">
                        <div className="font-semibold truncate text-sm">
                          {tz.city}
                        </div>
                        <div className="text-xs opacity-70 truncate">
                          {tz.region}
                        </div>
                        <div className="text-xs opacity-60 mt-0.5">
                          UTC{tz.offset >= 0 ? "+" : ""}
                          {tz.offset}
                        </div>
                      </div>
                    </div>
                  </Button>
                ))}
              </div>

              {filteredTimezones.length === 0 && (
                <div className="text-center py-8 text-default-400">
                  No timezones found matching "{searchQuery}"
                </div>
              )}
            </ModalBody>

            <ModalFooter>
              <Button
                color="danger"
                variant="light"
                onPress={() => {
                  onCloseModal();
                  setSearchQuery("");
                }}
              >
                Close
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
