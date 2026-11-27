# How a skill works (spec 1, draft)

A skill does no work by itself. It is instructions (`SKILL.md`) plus, where the work must be exact, scripts. Claude reads the instructions and does the work with the tools it already has: it reads and writes files, runs the skill's scripts, asks for a yes and does the words work itself.

## Three kinds of skill

| Kind | SKILL.md | Scripts | Who does the work |
|---|---|---|---|
| code with a guardrail (keys, platforms, store, checks) | short: run, show, ask, run again, read back | scripted | the script; Claude conducts |
| code without one (reshaping files, working things out) | the method and the formats | guided | Claude writes the script as needed |
| words (post, profile, ideas, share, message) | the method in full | only the check, scripted | Claude writes; the check proves it |
| recipe | the skills in order and the yes between each | none | the skills it names |

## Scripted and guided

The line between them is whether a guardrail is needed.

- **Scripted:** where a guardrail is required, the skill ships a fixed function that Claude runs and cannot change. The guardrail is in the code. It is also faster: the function is ready made and runs straight away. Nothing is written or worked out each run.
- **Guided:** everywhere else, Claude writes the script it needs as the work requires, following `SKILL.md` and this spec.

| Scripted: needs a guardrail | Guided: no guardrail needed |
|---|---|
| anything that uses a key | reading and reshaping files: a ledger, a words file, a transcript |
| any write to a platform or a store | working out a summary, a what if |
| every check | a one off question of the numbers |
| the run log | anything a scripted check proves afterwards |

**A skill can mix them.** A guided step's result passes a scripted check before it goes anywhere.

**A guided script is thrown away** after the job. It runs in a working folder, never in the plugin. It never touches a key, a platform or a store.

**A guided script is promoted** when the job is done often (a ready made function saves writing it each time) or turns out to need a guardrail: it is reviewed, made modular, tested on the coffee shop example and shipped as a scripted function.

## Carried skills

Most skills run in Claude Code. One kind is carried: its instructions travel inside what it makes and work wherever the result is pasted. [Ask an AI](ask-ai.md) is the first: the copy carries the instructions with the context. A business owner using ChatGPT, Gemini or the Claude app gets the method with nothing to install.

A carried skill's instructions keep the same rules as any words skill: work from the context only, invent nothing, end with lines a person sends back.

## Scripts

**TypeScript with the standard set for a Cloudflare Worker.** The same dependencies a Worker project uses. Any work module can then move to a Worker unchanged:

| Package | Used for |
|---|---|
| `hono` | routing: each route a small handler that calls a work module |
| `valibot` with `@hono/valibot-validator` | checking what comes in |
| `jose` | signing and checking tokens (Ghost Admin tokens) |
| `drizzle-orm` | D1, when a store needs a database |
| `typescript`, `wrangler`, `@cloudflare/workers-types` | building, bundling and Worker types |
| `vitest` with `@cloudflare/vitest-pool-workers` | tests, run the way a Worker runs |

A package outside this set needs a [decision](../DECISIONS.md) of its own.

**pnpm runs everything:** `pnpm install`, `pnpm test` (Vitest) and `pnpm build` (the bundled `dist/` files), in one package or across the [workspace](#the-layout) with `pnpm -r`.

**Bundled: a user installs nothing.** Each skill's script is built into one file in its plugin's `dist/` folder. That file is committed. Someone who installs the plugin needs only Node. A test fails if a `dist/` file differs from what its source builds.

**Keys never pass through Claude.** A script reads its key from the keys file named in settings. Claude sees what the script did, never the key.

### Ready for the edge

Scripts run in Node today. They are written so the same work can run in a Cloudflare Worker later, served with Hono, if and when the skills are offered as MCP tools or an API.

**Work modules keep a Worker's limits:**

1. **Web standard APIs only:** `fetch`, `Request`, `Response`, `URL`, Web Crypto and `TextEncoder`. No `fs`, `path`, `process` or `child_process`.
2. **No state between calls.** Each call takes everything it needs and gives back a result.
3. **No local disk.** Anything kept goes through the [store](store.md).
4. **Short work.** A call does one job quickly; long jobs are split into steps.
5. **Keys come in as values,** from one keys module: the keys file locally, an environment binding in a Worker.
6. **ES modules,** small enough to bundle.

**Only the edge modules are Node:** reading files, the terminal and the keys file. They are thin and swapped for their Worker versions when a skill moves.

**Hono is the routing layer,** used in a highly functional way: each route is a small handler that calls a work module and returns its result. It is used in the starter Worker example now and in an MCP Worker later.

### Modular

Every script is built from small modules. Each piece can be read, tested and reused on its own.

1. **One job per file.** A file does one thing and its name says what: `token.ts` makes a Ghost token, `request.ts` sends a request, `read-words.ts` reads a words file.
2. **The main file reads like an outline.** A skill's `run.ts` is its steps in order, each a call to a module. Reading it tells you what the skill does without reading the modules.
3. **Work and the outside world are kept apart.** Modules that work something out take values and give values back; they never read a file or the network. Only a few edge modules touch files, the network or the terminal.
4. **Nothing happens on import.** A module only defines; the main file runs.
5. **Plain, readable code.** Named steps, no clever one line expressions, a comment only where the why is not obvious.
6. **Every module has a test** with the coffee shop example, run with `pnpm test` (Vitest). The test sits beside the module, named after it with `.test` added: `preview.ts` and `preview.test.ts`. A module without a test shows at a glance.

### Every script behaves the same way

| Part | The same in every script |
|---|---|
| modes for a writing script | `--preview` (shows what would change, writes nothing), `--go` (writes), `--read-back` (checks what was written) |
| a reading script | runs and prints; it has no modes because it never writes |
| output | plain text for a person; `--json` for another script |
| exit code | 0 done, 1 problems found, 2 refused or failed |
| the run log | every write is logged where the skills run: never committed, kept for reference and never holding a key; where and how is the developer's choice |

## The layout

The repo is a pnpm workspace monorepo: one repo, one lockfile, one set of versions, many plugins.

```
marketing-skills/
  pnpm-workspace.yaml        packages/*, plugins/*, examples/*
  package.json               the shared tools, one set for every plugin
  packages/core/             shared by every plugin: settings, keys, run log, output
  plugins/dfm-ghost/
    package.json             depends on core with "workspace:*"
    .claude-plugin/plugin.json
    src/ghost/               this plugin's engine: token, request, read back
    skills/post-draft/
      SKILL.md
      src/run.ts             the outline
      src/run.test.ts        its test, beside it
      src/preview.ts         one job: what would change
      src/preview.test.ts    its test, beside it
      dist/run.js            built from src, committed; what Claude runs
  examples/store-worker/     the starter Hono Worker on D1 that meets the store contract
```

**The shared core lives once,** in `packages/core`. Each plugin depends on it. The bundler builds it into the plugin's `dist/` files. Nothing is copied by hand; nothing can drift.

**The monorepo is how the skills are built, not how they are delivered.** Each plugin is still installed and versioned on its own. A user gets its `SKILL.md` files and `dist/` files: no workspace, no packages to install.

**One command for all:** `pnpm -r test` and `pnpm -r build` run every package.

## Written as they are needed

Scripts are written progressively, never all at the start.

1. **Only working skills are listed.** The marketplace names a plugin only once it has a working skill. An unbuilt skill has no folder and no empty stub.
2. **A skill works when** its scripted functions (if it needs any) pass their tests on the coffee shop example and it has done one real job. A skill with no guardrail can work guided from the start.
3. **The core grows by need.** A module joins `core/` when the first skill that needs it is written.
4. **Versions say it is early.** Every plugin starts at `0.x`; `1.0` comes when spec 1 is frozen.
5. **The README shows the state** of each skill (planned, next, built or works), whether it has a script and its kind, changed in the same commit as the skill.
