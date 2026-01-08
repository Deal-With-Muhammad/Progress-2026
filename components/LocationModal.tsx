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
import { getAllTimezones } from "countries-and-timezones";
import { countries } from "countries-list";
import { LocationData } from "@/types"; // Ensure this matches your types file
import * as Flags from "country-flag-icons/react/3x2";

// 1. Define an interface for our local timezone objects
interface TimezoneOption {
  countryName: any;
  timezone: string;
  city: string;
  region: string;
  offset: string;
  countryCode: string;
  displayName: string;
}

const ALL_TIMEZONES: TimezoneOption[] = Object.values(getAllTimezones())
  // 1. FILTER: Only include real geographic locations (e.g., Africa/Abidjan)
  .filter((tz) => !tz.name.startsWith("Etc/") && tz.name.includes("/"))
  .map((tz) => {
    const parts = tz.name.split("/");
    // Get city (last part) and region (first part)
    const city = parts[parts.length - 1].replace(/_/g, " ");
    const region = parts[0];

    // Access countries array safely
    const countryCode =
      tz.countries && tz.countries.length > 0 ? tz.countries[0] : "UN";

    // Look up country name
    const countryInfo = countries[countryCode as keyof typeof countries];
    const countryName = countryInfo ? countryInfo.name : region;

    return {
      timezone: tz.name,
      city,
      region,
      countryName,
      offset: tz.utcOffsetStr,
      countryCode: countryCode,
      displayName: `${city}, ${countryName} (${tz.utcOffsetStr})`,
    };
  })
  // Sort by city name
  .sort((a, b) => a.city.localeCompare(b.city));

// 2. Typed Flag Helper (added string type)
function getFlagEmoji(countryCode: string) {
  if (!countryCode || countryCode === "UN") return "🌐";
  const codePoints = countryCode
    .toUpperCase()
    .split("")
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

// 3. Define Props Interface
interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectLocation: (location: LocationData) => void;
  currentTimezone: string;
}

export default function LocationModal({
  isOpen,
  onClose,
  onSelectLocation,
  currentTimezone,
}: LocationModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredTimezones = ALL_TIMEZONES.filter(
    (tz) =>
      tz.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tz.countryName.toLowerCase().includes(searchQuery.toLowerCase()) || // Now searchable!
      tz.timezone.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectLocation = (tz: TimezoneOption) => {
    // We cast the string as a key of the countries object
    const countryInfo = countries[tz.countryCode as keyof typeof countries];

    const locationData: LocationData = {
      name: `${tz.city}, ${countryInfo ? countryInfo.name : tz.region}`,
      timezone: tz.timezone,
      countryCode: tz.countryCode,
      city: tz.city,
      country: countryInfo ? countryInfo.name : tz.region,
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
                />
                <p className="text-sm text-default-500 mt-2">
                  {filteredTimezones.length} timezones available
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredTimezones.map((tz) => {
                  // 4. DYNAMIC FLAG COMPONENT
                  const FlagComponent =
                    Flags[tz.countryCode as keyof typeof Flags];

                  return (
                    <Button
                      key={tz.timezone}
                      size="lg"
                      onPress={() => handleSelectLocation(tz)}
                      className={`h-auto py-3 px-4 justify-start transition-all ${
                        currentTimezone === tz.timezone
                          ? "bg-primary/20 border-2 border-primary shadow-md"
                          : "bg-default-100 hover:bg-default-200"
                      }`}
                      variant={
                        currentTimezone === tz.timezone ? "bordered" : "flat"
                      }
                    >
                      <div className="flex items-center gap-3 w-full">
                        <div className="w-8 h-6 flex-shrink-0 overflow-hidden rounded-sm shadow-sm">
                          {FlagComponent ? (
                            <FlagComponent
                              title={tz.countryName}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="bg-default-200 w-full h-full flex items-center justify-center text-[10px]">
                              {tz.countryCode}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1 text-left">
                          <div className="font-semibold truncate text-sm">
                            {tz.city}
                          </div>
                          <div className="text-xs opacity-70 truncate">
                            {tz.countryName}
                          </div>
                          <div className="text-xs opacity-60">
                            UTC {tz.offset}
                          </div>
                        </div>
                      </div>
                    </Button>
                  );
                })}
              </div>
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
