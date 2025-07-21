# Tasks

> The autonomous agent should tackle these in order.  Tick them off in the PR description as you complete each.

1. **Bootstrap project**
   * `npm init -y`
   * Add `.nvmrc` → `20`
   * Install deps: `express`, `lowdb`, `chokidar`, `htmx.org`, `simplemde`, `nodemon` (dev)

2. **`src/watcher/ingest.js`**
   * Initialise chokidar with paths from `watcher.paths.json`
   * On `add/change/unlink` call stub functions (to be filled later)

3. **Filing rules loader & classifier stub**
   * Load `meta/filing-rules.yaml` if present (YAML.parse)
   * Expose `classifyFile(frontMatter, bodyPreview)` that currently returns default bucket

4. **Express server & API routes**
   * `src/server.js` mounts JSON APIs (`/api/files`, `/api/file/:id`, `/api/intake`, `/api/paths`)
   * Serve static files from `src/web/`

5. **Frontend scaffolding**
   * `web/index.html` with sidebar + preview placeholders
   * `web/style.css` – copy variables from `ui-wireframe.md`
   * Include `htmx.min.js`

6. **Markdown render & SimpleMDE integration**
   * `GET /api/file/:id` returns HTML; heading splitting → cards as per spec
   * “✏️ Edit” swaps in `<textarea>` + initialise SimpleMDE
   * `PUT /api/file/:id` persists changes

7. **Watcher paths API**
   * `GET/POST/DELETE /api/paths` manipulates `watcher.paths.json` and restarts watcher child process

8. **Intake endpoints**
   * `/api/intake` list + accept/archive operations
   * Update `needsAttention` flag

9. **Sample tests**
   * Jest or tap: verify watcher detects a new file and DB entry appears

10. **Docs & cleanup**
    * Update `README.md` with full usage
    * Commit sample `watcher.paths.sample.json` 