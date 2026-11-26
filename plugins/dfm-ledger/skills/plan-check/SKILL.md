---
name: plan-check
description: Read a business's ledger and name every problem in it, with a script, never by reading. Use after a ledger is made or changed ("check my plan", "is my ledger right") and as a step of dfm-ledger:plan-make and dfm-recipes:week-run.
---

# plan-check

A scripted check. The script reads the ledger and names its problems; Claude runs it, shows the report and never judges the ledger by eye. It never writes.

## Run

From the working folder:

```
node <this skill's folder>/dist/run.js --ledger ledger.txt [--settings settings.txt] [--json]
```

| Exit code | Means |
|---|---|
| 0 | passed: no problems |
| 1 | problems found |
| 2 | the check could not run (a file is missing or the command was not understood) |

## What it finds

- **A line it cannot read,** in any part or outside every part.
- **A fact counted but not declared:** a `fact count` or `fact total` whose fact has no `fact` line in the graph.
- **A step with no link:** a planned step no link in the graph starts from. Doing it leads to nothing counted.
- **A count and a total of one fact in the same week.** A fact is counted one way.
- **With `--settings`: anything in settings that would stop a skill.** The ledger is not checked until settings are fixed.

A line with a new spec 1 word this reader does not read yet (such as `channel` or `offer`) is named as **not read yet**, never as a problem.

## Show

Show the report as the script printed it, in full. A problem is fixed in the ledger by the person or by the skill that made the ledger, then the check runs again.

## Asking

- **Ask with the question dialog** where there is one: every question and every yes, with options such as "Yes, go on", "Change something" and "Stop". Where there is no dialog, the question is the last line of the message. A question in the middle of a long message is easily missed.
- **Ask for what is missing; never guess it.** When an answer could mean more than one thing, ask which.
- **Its script needs Node 24 or later.** If `node` is not found, ask the person how Node is installed and run the script with that Node.

## Next

When it passes, the ledger goes back to the step that asked for the check: `dfm-ledger:plan-make` shows it to the person; in `dfm-recipes:week-run`, the recipe's next step.
