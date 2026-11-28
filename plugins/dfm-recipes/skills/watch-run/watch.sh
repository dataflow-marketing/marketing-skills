#!/usr/bin/env bash
# watch.sh: the scheduled half of watch-run. Reads every site in a market folder again, code only: profile-make
# --since the last read, then market-read --read into a new ledger file. Writes nothing over an earlier read and
# never changes a ledger: the person does the judgement later, with watch-run in a session.
#
#   watch.sh <market folder>            for cron:  NODE=<path to node> watch.sh <market folder>
#
# The market folder holds settings.txt (a `site <name>: public <address>` line for each site), reads/<read>/<site>/
# and market/<read>/market-<site>.txt. Each run is named for its day (2026-12-07) and leaves watch-<day>.txt:
# what changed at each site, for the person to read. Exit code: 0 read, 2 refused or failed.
set -euo pipefail

market="${1:?Name the market folder: watch.sh <market folder>}"
node="${NODE:-node}"
skills="$(cd "$(dirname "$0")/../../.." && pwd)"
profile_make="$skills/dfm-content/skills/profile-make/dist/run.js"
market_read="$skills/dfm-content/skills/market-read/dist/run.js"

cd "$market"
# the day in the market's own time zone (settings: `time zone: Australia/Melbourne`), not the computer's
zone="$(sed -n 's/^time zone: *//p' settings.txt | head -1)"
day="$(TZ="${zone:-UTC}" date +%F)"
mkdir -p "reads/$day" "market/$day"
note="watch-$day.txt"
[ -e "$note" ] && { echo "$note is already there: one run a day" >&2; exit 2; }

# the last read of a site, by the day its market ledger says it was read (`<Monday> read on <day>`), never by a
# file's time: copying a folder or checking out a branch changes those. Prints the read's name (its folder under
# market/ and reads/), or nothing for a site never read.
last_read_of() {
  local best="" best_day=""
  for ledger in market/*/"market-$1.txt"; do
    [ -f "$ledger" ] || continue
    local read_name; read_name="$(basename "$(dirname "$ledger")")"
    [ "$read_name" = "$day" ] && continue
    local last_day; last_day="$(grep -oE '^[0-9-]{10} read on [0-9-]{10}$' "$ledger" | awk '{print $4}' | sort | tail -1)"
    if [ -n "$last_day" ] && [[ "$last_day" > "$best_day" ]]; then
      best="$read_name"; best_day="$last_day"
    fi
  done
  echo "$best"
}

{
  echo "watch $day: every site read again, code only; nothing judged yet"
  echo
} > "$note"

grep -E '^site [^:]+: public ' settings.txt | while read -r _ name _ address; do
  name="${name%:}"
  last="$(last_read_of "$name")"
  folder="reads/$day/$name"
  ledger_out="market/$day/market-$name.txt"

  since=()
  ledger_in=""
  if [ -n "$last" ]; then
    since=(--since "reads/$last/$name")
    ledger_in="market/$last/market-$name.txt"
  fi
  if ! "$node" "$profile_make" --address "$address" --from-sitemap --folder "$folder" "${since[@]}" > /dev/null 2>"$folder.err"; then
    echo "$name: could not be read ($(head -1 "$folder.err" 2>/dev/null)); left out of this read" >> "$note"
    continue
  fi
  rm -f "$folder.err"

  ledger=(--business "$name" --site "$address")
  [ -n "$ledger_in" ] && ledger=(--ledger "$ledger_in")
  "$node" "$market_read" --read "$folder" --day "$day" --out "$ledger_out" --dates "market/$day/dates-$name.txt" "${ledger[@]}" > /dev/null

  if [ -f "$folder/changed.txt" ]; then
    new=$(sed -n '/^## New/,/^## /p' "$folder/changed.txt" | grep -c '^### ' || true)
    changed=$(sed -n '/^## Changed/,/^## /p' "$folder/changed.txt" | grep -c '^### ' || true)
    gone=$(sed -n '/^## Gone/,$p' "$folder/changed.txt" | grep -c '^\(### \|- \)' || true)
    if [ "$new$changed$gone" = "000" ]; then
      echo "$name: the same as last time" >> "$note"
    else
      echo "$name: $new new, $changed changed, $gone gone (see $folder/changed.txt)" >> "$note"
    fi
  else
    echo "$name: a first read" >> "$note"
  fi
done

echo >> "$note"
echo "Next, in a session: watch-run, to write what changed and the report, a yes before every write." >> "$note"
cat "$note"
