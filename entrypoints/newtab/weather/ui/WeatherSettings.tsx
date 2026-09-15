import { BuildingsIcon, GpsFixIcon, WarningCircleIcon } from "@phosphor-icons/react";
import * as stylex from "@stylexjs/stylex";
import { useState } from "react";
import { useStorageValue } from "~shared/hooks/useStorageValue";
import { notifyError } from "~shared/lib/notify-error";
import { usePreferences } from "~shared/lib/preferences";
import { weatherMessages } from "~shared/locales/weather";
import { colorVars, typographyVars, spacingVars } from "~shared/styles/semantic.stylex";
import { Combobox, ComboboxInput, ComboboxPopup, ComboboxList, ComboboxItem, ComboboxEmpty } from "~shared/ui/combobox";
import { Field, FieldLabel, FieldDescription, FieldError, FieldSet } from "~shared/ui/field";
import { InputGroupButton } from "~shared/ui/input-group";
import { Link } from "~shared/ui/link";
import { Select, SelectTrigger, SelectValue, SelectPopup, SelectList, SelectItem } from "~shared/ui/select";
import { Spinner } from "~shared/ui/spinner";
import { Switch } from "~shared/ui/switch";

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
    fontSize: typographyVars.fontSizeXs,
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
      const current = await weatherSettings.getValue();
      await weatherSettings.setValue({ ...current, city });
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
      const current = await weatherSettings.getValue();
      await weatherSettings.setValue({ ...current, city });
      setOpen(false);
      setQuery(null);
    } catch {
      setMessage(copy.saveError);
    }
  }

  return (
    <>
      <Field>
        <div {...stylex.props(styles.row)}>
          <FieldLabel htmlFor="weather-enabled">{copy.title}</FieldLabel>
          <Switch
            id="weather-enabled"
            checked={settings.enabled}
            onCheckedChange={(enabled) => void weatherSettings.setValue({ ...settings, enabled }).catch(notifyError)}
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
              open={open && !locating && (query ?? "").trim().length >= MIN_CITY_QUERY_LENGTH}
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
                    size="icon-xs"
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
                  void weatherSettings.setValue({ ...settings, showCity }).catch(notifyError)
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
                  void weatherSettings.setValue({ ...settings, unit }).catch(notifyError);
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
