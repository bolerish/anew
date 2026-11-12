import { sizeVars } from "@bolerish/tokens/semantic.stylex";
import { colorVars, typo, spacingVars } from "@bolerish/tokens/semantic.stylex";
import {
  Combobox,
  ComboboxInput,
  ComboboxPopup,
  ComboboxList,
  ComboboxItem,
  ComboboxEmpty,
} from "@bolerish/ui/combobox";
import { Field, FieldLabel, FieldDescription, FieldError, FieldSet } from "@bolerish/ui/field";
import { InputGroupButton } from "@bolerish/ui/input-group";
import { Link } from "@bolerish/ui/link";
import { Select, SelectTrigger, SelectValue, SelectPopup, SelectList, SelectItem } from "@bolerish/ui/select";
import { Spinner } from "@bolerish/ui/spinner";
import { Switch } from "@bolerish/ui/switch";
import { BuildingsIcon, GpsFixIcon, WarningCircleIcon } from "@phosphor-icons/react";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { useStorageValue } from "~shared/hooks/useStorageValue";
import { weatherMessages } from "~shared/i18n/weather";
import { notifyError } from "~shared/lib/notify-error";
import { usePreferences } from "~shared/lib/preferences";
import { updateStoredValue } from "~shared/lib/write-lock";

import { fetchCurrentCity } from "../api/location";
import { MIN_CITY_QUERY_LENGTH } from "../api/weather";
import { useCitySearch } from "../model/useCitySearch";
import { defaults, weatherSettings, type City } from "../model/weather";
const styles = stylex.create({
  locationGroup: { gap: spacingVars.space3 },
  credits: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "flex-end",
    gap: spacingVars.space2,
    marginTop: "auto",
    paddingTop: spacingVars.space4,
    color: colorVars.fgSecondary,
    fontSize: typo.fontSizeXs,
  },
  error: { color: colorVars.fgFeedbackError },
  status: { display: "flex", alignItems: "center", justifyContent: "center", gap: spacingVars.space2 },
  row: { display: "flex", alignItems: "center", justifyContent: "space-between" },
  full: { width: "100%" },
});

export function WeatherSettings() {
  const settings = useStorageValue(weatherSettings, () => defaults);
  const { language } = usePreferences();
  const copy = weatherMessages[language];
  const [query, setQuery] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);
  const [message, setMessage] = useState("");
  const [open, setOpen] = useState(false);
  const { cities, status } = useCitySearch(query ?? "", language, settings.enabled && !locating);
  const searching = status === "loading";
  const searchMessage = status === "error" ? copy.searchError : copy.empty;

  async function handleLocate() {
    setOpen(false);
    setLocating(true);
    setMessage("");
    try {
      const city = await fetchCurrentCity(language);
      await updateStoredValue(weatherSettings, (current) => ({ ...current, city }));
      setQuery(null);
    } catch (error) {
      const code = error && typeof error === "object" && "code" in error ? error.code : 0;
      if (error instanceof Error && error.name === "GeolocationPermissionError") {
        setMessage(copy.locationReload);
      } else if (code === 1) {
        setMessage(copy.locationDenied);
      } else if (code === 3) setMessage(copy.locationTimeout);
      else setMessage(copy.locationError);
    } finally {
      setLocating(false);
    }
  }

  async function handleCityChange(city: City | null) {
    if (!city) return;
    try {
      await updateStoredValue(weatherSettings, (current) => ({ ...current, city }));
      setOpen(false);
      setQuery(null);
    } catch {
      setMessage(copy.saveError);
    }
  }

  const hasSearchQuery = (query ?? "").trim().length >= MIN_CITY_QUERY_LENGTH;
  const isSearchOpen = open && !locating && hasSearchQuery;

  return (
    <>
      <Field>
        <div {...stylex.props(styles.row)}>
          <FieldLabel htmlFor="weather-enabled">{copy.title}</FieldLabel>
          <Switch
            id="weather-enabled"
            checked={settings.enabled}
            onCheckedChange={(enabled) =>
              void updateStoredValue(weatherSettings, (current) => ({ ...current, enabled })).catch(notifyError)
            }
          />
        </div>
        <FieldDescription>{copy.hint}</FieldDescription>
      </Field>
      {settings.enabled ? (
        <FieldSet xstyle={styles.locationGroup}>
          <Field>
            <FieldLabel htmlFor="weather-city">{copy.city}</FieldLabel>

            <Combobox<City>
              disabled={locating}
              open={isSearchOpen}
              onOpenChange={setOpen}
              items={cities}
              filter={null}
              value={null}
              inputValue={query ?? settings.city?.name ?? ""}
              onInputValueChange={(value, details) => {
                if (details.reason !== "input-change" && details.reason !== "input-clear") return;
                setQuery(value);
                setMessage("");
              }}
              itemToStringLabel={(city) => city.name}
              onValueChange={handleCityChange}
            >
              <ComboboxInput
                id="weather-city"
                disabled={locating}
                aria-busy={searching || locating}
                aria-describedby={message ? "weather-city-error" : undefined}
                placeholder={copy.search}
                xstyle={styles.full}
                startAddon={searching ? <Spinner label={copy.loading} /> : <BuildingsIcon aria-hidden="true" />}
                endAddon={
                  <InputGroupButton
                    type="button"
                    size="icon"
                    style={{ height: sizeVars.controlXs, width: sizeVars.controlXs }}
                    aria-label={copy.gps}
                    title={copy.gps}
                    disabled={locating}
                    onClick={handleLocate}
                  >
                    {locating ? <Spinner label={copy.loading} /> : <GpsFixIcon aria-hidden="true" />}
                  </InputGroupButton>
                }
              />
              <ComboboxPopup>
                <ComboboxEmpty>
                  <output {...stylex.props(styles.status, status === "error" && styles.error)}>
                    {searching ? <Spinner label={copy.loading} aria-hidden="true" /> : null}
                    {status === "error" ? <WarningCircleIcon aria-hidden="true" /> : null}
                    {searching ? copy.loading : searchMessage || copy.empty}
                  </output>
                </ComboboxEmpty>
                <ComboboxList>
                  {(city: City) => (
                    <ComboboxItem key={`${city.latitude},${city.longitude}`} value={city}>
                      {city.name}
                    </ComboboxItem>
                  )}
                </ComboboxList>
              </ComboboxPopup>
            </Combobox>
            {message ? (
              <FieldError id="weather-city-error" match={true} role="alert">
                {message}
              </FieldError>
            ) : null}
          </Field>
          <Field>
            <div {...stylex.props(styles.row)}>
              <FieldLabel htmlFor="weather-show-city">{copy.showCity}</FieldLabel>
              <Switch
                id="weather-show-city"
                checked={settings.showCity !== false}
                onCheckedChange={(showCity) =>
                  void updateStoredValue(weatherSettings, (current) => ({ ...current, showCity })).catch(notifyError)
                }
              />
            </div>
          </Field>
        </FieldSet>
      ) : null}
      {settings.enabled ? (
        <>
          <Field>
            <FieldLabel id="weather-unit-label">{copy.unit}</FieldLabel>
            <Select
              value={settings.unit ?? "celsius"}
              onValueChange={(unit) => {
                if (unit === "celsius" || unit === "fahrenheit")
                  void updateStoredValue(weatherSettings, (current) => ({ ...current, unit })).catch(notifyError);
              }}
            >
              <SelectTrigger xstyle={styles.full} aria-labelledby="weather-unit-label">
                <SelectValue>{settings.unit === "fahrenheit" ? copy.fahrenheit : copy.celsius}</SelectValue>
              </SelectTrigger>
              <SelectPopup>
                <SelectList>
                  <SelectItem value="celsius">{copy.celsius}</SelectItem>
                  <SelectItem value="fahrenheit">{copy.fahrenheit}</SelectItem>
                </SelectList>
              </SelectPopup>
            </Select>
          </Field>
        </>
      ) : null}
      <footer {...stylex.props(styles.credits)}>
        <Link variant="current" href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Open-Meteo
        </Link>
        <Link variant="current" href="https://www.bigdatacloud.com/" target="_blank" rel="noreferrer">
          BigDataCloud
        </Link>
        <Link variant="current" href="https://www.geonames.org/" target="_blank" rel="noreferrer">
          GeoNames
        </Link>
      </footer>
    </>
  );
}
