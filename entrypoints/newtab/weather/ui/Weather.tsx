import { colorVars, sizeVars, spacingVars, typo } from "@bolerish/tokens/semantic.stylex";
import { Link } from "@bolerish/ui/link";
import { Separator } from "@bolerish/ui/separator";
import {
  CloudIcon,
  SunIcon,
  CloudRainIcon,
  SnowflakeIcon,
  CloudLightningIcon,
  WarningCircleIcon,
} from "@phosphor-icons/react";
import * as stylex from "@stylexjs/stylex";
import { useStorageValue } from "~shared/hooks/useStorageValue";
import { weatherMessages } from "~shared/i18n/weather";
import { usePreferences } from "~shared/lib/preferences";

import { useWeather } from "../model/useWeather";
import { defaults, weatherSettings, formatTemperature, CACHE_MS } from "../model/weather";
const styles = stylex.create({
  separator: {
    height: "1em",
    minHeight: 0,
    alignSelf: "center",
    display: { default: "block", ":first-child": "none" },
  },
  weather: {
    display: "inline-flex",
    alignItems: "center",
    gap: spacingVars.space2,
    color: colorVars.fgSecondary,
    fontSize: typo.fontSizeSm,
  },
  error: { color: colorVars.fgFeedbackError },
  warning: { color: colorVars.fgFeedbackWarning },
  icon: { width: sizeVars.iconMd, height: sizeVars.iconMd },
});
export function Weather() {
  const settings = useStorageValue(weatherSettings, () => defaults);
  const { language } = usePreferences();
  const copy = weatherMessages[language];
  const { data, loading } = useWeather(settings, language);
  if (!settings.enabled || !settings.city) return null;
  const key = `${settings.city.latitude},${settings.city.longitude}`;
  const current = data?.key === key ? data : null;
  let Icon = CloudIcon;
  if (current) {
    if (current.code >= 95) Icon = CloudLightningIcon;
    else if ((current.code >= 71 && current.code <= 77) || current.code === 85 || current.code === 86)
      Icon = SnowflakeIcon;
    else if (current.code >= 51) Icon = CloudRainIcon;
    else if (current.code <= 1) Icon = SunIcon;
  }
  const stale = current && Date.now() - current.fetchedAt >= CACHE_MS;
  let status: string = loading ? copy.loading : copy.error;
  if (current) status = `${stale ? copy.stale : copy.updated} ${new Date(current.fetchedAt).toLocaleString(language)}`;
  const failed = !loading && !current;
  if (failed || stale) Icon = WarningCircleIcon;
  const temperature = current ? formatTemperature(current.temperature, settings.unit) : "—";
  return (
    <>
      <Separator orientation="vertical" xstyle={styles.separator} />
      <Link
        href="https://open-meteo.com/"
        target="_blank"
        rel="noreferrer"
        variant="plain"
        render={
          <a
            aria-label={`${copy.title}: ${temperature}, ${settings.city.name}, ${status}`}
            {...stylex.props(styles.weather, failed && styles.error, stale && styles.warning)}
          />
        }
        title={`${settings.city.name} · ${status} · Open-Meteo`}
      >
        <Icon aria-hidden="true" {...stylex.props(styles.icon)} />
        {failed ? copy.error : temperature}
        {settings.showCity !== false ? <span>{settings.city.name.split(",")[0]}</span> : null}
      </Link>
    </>
  );
}
