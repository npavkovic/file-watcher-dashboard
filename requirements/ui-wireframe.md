# UI Wireframe & Style Guide

Version 0.1 · 2025-07-16

---

## 1 · Layout

```
 ┌──────────────────────────────┐
 │  Sidebar (260 px)            │
 │ ───────────────────────────  │
 │  ▸ Folder A                  │
 │    file-1.md                 │
 │    file-2.md                 │
 │  ▸ Folder B                  │
 └──────────────────────────────┘
 ┌───────────────────────────────────────────────┐
 │  Preview Pane (flex-1)                        │
 │  ───────────────────────────────────────────  │
 │  <h1>Title</h1>                               │
 │  <div class="card">…todo item…</div>         │
 │  –––––––––––––––––––––––––––––––––––––––      │
 │  ✏️ Edit   ▸ Split     ▸ History              │
 └───────────────────────────────────────────────┘
```

## 2 · Key CSS Classes

| Class        | Purpose                    |
|--------------|----------------------------|
| `.layout`    | flex; height: 100vh        |
| `.sidebar`   | width: 260px; overflow-y: auto; background: #f6f6f6; border-right: 1px solid #ddd |
| `.preview`   | flex: 1; overflow-y: auto; padding: 24px |
| `.card`      | background: #fff; box-shadow: 0 1px 4px rgba(0,0,0,.05); padding: 16px; margin-bottom: 16px; border-left: 4px solid #007aff |
| `.modal`     | fixed inset-0 bg-black/40 flex justify-center items-center |

> Designers can override colours by editing variables at top of `style.css`.

## 3 · HTMX Data-Flow

| Action            | Trigger | `hx-*` attributes |
|-------------------|---------|-------------------|
| Load sidebar      | onload  | `hx-get="/api/files?folder=/" hx-target="#file-list"` |
| Click file        | click   | `hx-get="/api/file/{{id}}" hx-target="#preview" hx-swap="innerHTML"` |
| Edit              | click   | swap in `<textarea>` fragment |
| Save edit         | submit  | `hx-put="/api/file/{{id}}"` |
| Add new           | click   | `hx-get="/api/new-file-form" hx-target="body" hx-swap="beforeend"` |

## 4 · Accessibility

* All actionable icons have `aria-label`.
* Ensure contrast ratio ≥ 4.5.
* Sidebar supports arrow-key navigation via standard `<a>` list items.

## 5. Design
Design suggestions:

- Simple and clean design
- IBM Plex Sans (google) font throughout
- Black & white & gray to start
- CSS should paramterize all design tokens with CSS variables, i.e., colors, border-radius, etc.
- Create semantic classes for components and use CSS variables to spec their colors; this will allow for easy theming.
- Very limited use of subtle shadows
- Icons used sparingly if they are part of the implementation plan
- Document the design system you have created during the process of putting this together.

---

End of guide. 