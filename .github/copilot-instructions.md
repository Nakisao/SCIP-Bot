# Copilot Instructions for SCIP-Bot (updated Oct 9, 2025)

Short, actionable guidance to help AI coding agents make correct edits quickly.
- Project type: Node.js Discord bot. Entry points: `src/index.js` (runtime) and `deploy-commands.js` (registers slash commands).
- Module styles: Mixed CommonJS (`require/module.exports`) in `src/index.js` and `deploy-commands.js`, and ESM (`import/export default`) in most `src/` submodules (events/commands/util). Prefer editing files using their existing module style.
- Commands: Live under `src/commands/<category>/*.js`. Each command file should default-export an object with `data` (command meta) and `execute` (handler) when using ESM. CJS command files (module.exports) are tolerated by `deploy-commands.js`/`src/index.js` but the ESM loader expects `default` exports.
- Events: Under `src/events/*.js` or `src/events/<category>/*.js`. Event modules export objects with `name`, optional `once`, and `execute` (ESM default exports).
- Loaders: `src/util/loaders.js` is the canonical loader — it uses zod predicates in `src/commands/index.js` and `src/events/index.js` to validate structures and dynamically import non-`index.js` files.
- Config: `config.json` contains `clientId`, `guildId`, and `token`. Avoid committing tokens; rotate if leaked.
- Commands deployment: Run `npm run deploy-cmds` or `node deploy-commands.js`. `package.json` defines `bot-init` to deploy then run the bot.
- Start bot: Use `npm run start-bot` or `node src/index.js`.
- Node requirement: `node >= 22.12.0` (see `package.json`).
Important: this repo targets the modern discord.js API (v14+). When editing interaction logic, builders (SlashCommandBuilder), intents, or REST calls, consult the official discord.js guide and API reference — the code assumes v14+ semantics (e.g., IntentsBitField, Builders, and interaction reply patterns).

Quick patterns and gotchas:
- Mixed module systems: Do not change a file's module style unless you update its consumers. The ESM `src` loader expects `default` exports. If you must change module type, prefer an adapter and run smoke tests.
- Loader skip: `loaders.js` intentionally ignores files named `index.js`. Put helpers in `util/` or other named files.
- Command contract: command modules MUST expose `data` (with `data.name`) and `execute(interaction)`. `deploy-commands.js` calls `command.data.toJSON()` when registering slash commands.
- `deploy-commands.js` iterates `src/commands` and expects subdirectories for categories; it skips non-directories to avoid ENOTDIR errors.
- Interaction runtime: `src/events/interactionCreate.js` calls `loadCommands()` and throws if the command is missing. Keep command names stable and avoid dynamic name changes.
- Logging: runtime uses console logs for warnings/errors. Follow the same pattern for consistency.
Examples to reference while editing:
- `src/util/loaders.js` — file discovery + zod validation + dynamic import pattern.
- `src/events/interactionCreate.js` — how commands are looked up and executed.
- `deploy-commands.js` — how slash commands are serialized (`command.data.toJSON()`) and pushed to Discord.
- `src/index.js` — runtime client setup (intents, command registration for CJS commands).
If you change module type (CJS <-> ESM):
- Update imports/exports and any call sites. Prefer small, isolated patches and smoke-test with `npm run start-bot` or `npm run deploy-cmds`.

When unsure, open these files first: `package.json`, `config.json`, `deploy-commands.js`, `src/index.js`, `src/util/loaders.js`, `src/events/interactionCreate.js`.
Feedback: tell me what else should be documented (DB usage, ephemeral reply policy, permission handling). Include examples and I'll merge them.
# Copilot Instructions for SCIP-Bot (updated Oct 9, 2025)

Short, actionable guidance to help AI coding agents make correct edits quickly.

- Project type: Node.js Discord bot. Entry points: `src/index.js` (runtime) and `deploy-commands.js` (registers slash commands).
- Module styles: Mixed CommonJS (`require/module.exports`) in `src/index.js` and `deploy-commands.js`, and ESM (`import/export default`) in most `src/` submodules (events/commands/util). Prefer editing files using their existing module style.
- Commands: Live under `src/commands/<category>/*.js`. Each command file should default-export an object with `data` (command meta) and `execute` (handler) when using ESM. Old CJS variants may use `module.exports = { data, execute }`. Examples: `src/commands/utility/discordBan.js` (disabled example) and `src/commands/isd/*.js`.
- Events: Under `src/events/*.js` or `src/events/<category>/*.js`. They default-export objects with `name`, optional `once`, and `execute`.
- Loaders: `src/util/loaders.js` is the canonical loader — it uses zod predicates in `src/commands/index.js` and `src/events/index.js` to validate structures and loads non-`index.js` files recursively.
- Config: `config.json` contains `clientId`, `guildId`, and `token`. Avoid committing new tokens; rotate if leaked.
- Commands deployment: Run `npm run deploy-cmds` or `node deploy-commands.js`. `package.json` defines `bot-init` to deploy then run the bot.
- Start bot: Use `npm run start-bot` or `node src/index.js`.
- Node requirement: `node >= 22.12.0` (see `package.json`).

Quick patterns and gotchas:
- Mixed module systems: Do not convert a file's module style unless you update its callers. The `src` loader expects ESM `default` exports for commands/events. `deploy-commands.js` and `src/index.js` are CJS; they're compatible with CJS command files but the `src` ESM loader expects ESM.
- Loader skip: Files named `index.js` are intentionally skipped by `loaders.js` — place shared helpers in `util/` or other named files.
- Ensure command objects contain `data.name` (string) and `execute(interaction)`; otherwise `deploy-commands.js` and the runtime will log warnings or throw errors.
- `deploy-commands.js` iterates `src/commands` and expects subdirectories for categories; it explicitly skips non-directories to avoid ENOTDIR errors.
- Interaction handling: `src/events/interactionCreate.js` uses `loadCommands` and throws if the command is missing. Keep command names stable.
- Error messages: The runtime uses console logs for warnings; prefer logging to stdout/stderr consistent with existing usage.

Examples to reference while editing:
- `src/util/loaders.js` — how files are discovered and validated (zod + dynamic import).
- `src/events/interactionCreate.js` — how commands are looked up and executed.
- `deploy-commands.js` — how slash commands are serialized (`command.data.toJSON()`) and pushed to Discord.

If you change module type (CJS <-> ESM):
- Update imports/exports accordingly, and ensure the importer is updated too. Prefer keeping changes local (add an adapter file) if possible.

When unsure, open these files first: `package.json`, `config.json`, `deploy-commands.js`, `src/index.js`, `src/util/loaders.js`, `src/events/interactionCreate.js`.

If edits are risky (changing runtime behavior or module type), propose a small, isolated patch and run `npm run start-bot` locally to smoke-test; for command changes, run `npm run deploy-cmds` to refresh slash commands.

Feedback: tell me what else should be documented (e.g., DB usage, expected ephemeral response policy, permission handling).