/* oxlint-disable no-await-in-loop -- Sequential writes verify that later updates preserve earlier settings. */
import { test } from "vitest";

import * as clock from "../../../date/lib/format";
import * as time from "./time";

import assert from "node:assert/strict";
test("clock settings preserve visibility, localize AM/PM and format midnight", async () => {
  await time.timeStorage.setValue({ showTime: false, timeFormat: "12h", showTimeSeconds: false });
  for (const timeFormat of ["12h", "24h"] as const) {
    for (const showTimeSeconds of [false, true]) {
      // oxlint-disable-next-line no-await-in-loop -- Verify sequential changes to the same saved settings.
      await time.updateTimeSettings({ timeFormat, showTimeSeconds });
      assert.equal((await time.timeStorage.getValue()).timeFormat, timeFormat);
      assert.equal((await time.timeStorage.getValue()).showTimeSeconds, showTimeSeconds);
      assert.equal((await time.timeStorage.getValue()).showTime, false);
    }
  }
  await time.updateTimeSetting("showTime", true);
  assert.equal((await time.timeStorage.getValue()).showTime, true);
  assert.equal((await time.timeStorage.getValue()).timeFormat, "24h");
  assert.equal((await time.timeStorage.getValue()).showTimeSeconds, true);

  const midnight = new Date(2026, 8, 14, 0, 5, 9);
  assert.equal(
    clock.formatCurrentTime(midnight, { showTime: true, timeFormat: "24h", showTimeSeconds: true }, "en-US"),
    "00:05:09",
  );
  assert.equal(
    clock.formatCurrentTime(midnight, { showTime: true, timeFormat: "12h", showTimeSeconds: false }, "en-US"),
    "12:05 AM",
  );
  assert.match(
    clock.formatCurrentTime(
      new Date(2026, 8, 14, 13, 5),
      { showTime: true, timeFormat: "12h", showTimeSeconds: false },
      "ko-KR",
    )!,
    /(오후|PM).*1:05/,
  );
  assert.equal(
    clock.formatCurrentTime(midnight, { showTime: false, timeFormat: "24h", showTimeSeconds: false }, "en-US"),
    null,
  );
});
