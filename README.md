# caret-coordinates-hook

![npm](https://img.shields.io/npm/v/caret-coordinates-hook?style=flat-square)
![license](https://img.shields.io/github/license/fedemadoery/caret-coordinates-hook?style=flat-square)
![types](https://img.shields.io/npm/types/caret-coordinates-hook?style=flat-square)

A tiny **React Hook** that gives you the pixel coordinates (`top`, `left`, `height`) of the text cursor (caret) inside a `<textarea>` or `<input type="text">`.

Use it to anchor pop‑ups, emoji pickers, autocompletes, or any UI element next to the user’s caret.

---

## ✨ Features

* **Zero‑dependency** runtime (needs React ≥ 16.8 only)
* Works with both `<textarea>` **and** `<input>` elements 
* **Viewport** *or* **element‑relative** coordinates via `relative` flag
* Handles content changes, scrolling, and styling automatically
* Optional `debug` overlay to inspect calculations visually
* Fully typed in **TypeScript**

---

## 🚀 Installation

```bash
npm install caret-coordinates-hook
# or
yarn add caret-coordinates-hook
# or
pnpm add caret-coordinates-hook
```

---

## 🔧 Quick Start

```tsx
import { useRef } from "react";
import { useCaretCoordinates } from "caret-coordinates-hook";

export default function Demo() {
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { top, left, height } = useCaretCoordinates(inputRef, {
    relative: true, // default: false → viewport coordinates
  });

  return (
    <div style={{ position: "relative" }}>
      <textarea ref={inputRef} rows={4} style={{ width: "100%" }} />

      {/* red bar that follows the caret */}
      <div
        style={{
          position: "absolute",
          top,
          left,
          width: 2,
          height,
          background: "red",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
```

<details>
<summary>⚙️ Debug mode</summary>

```ts
const coords = useCaretCoordinates(inputRef, { debug: true });
```

`debug: true` paints a yellow marker inside the hidden mirror so you can verify accuracy while developing.

</details>

---

## 📝 API

```ts
const coords = useCaretCoordinates(
  ref: React.RefObject<HTMLTextAreaElement | HTMLInputElement>,
  opts?: {
    debug?: boolean;
    relative?: boolean;
  }
);
// returns: { top: number; left: number; height: number }
```

### Parameters

| Name            | Type                                              | Default              | Description                                                                                                                                                                                   |                                                      |
| --------------- |---------------------------------------------------|----------------------| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| **`ref`**       | `RefObject<HTMLInputElement\|HTMLTextAreaElement>` |  —                                                                                                                                                                                             | React ref pointing at the element you want to track. |
| `opts.debug`    | `boolean`                                         | `false`              | Highlights caret marker inside the mirror for easier debugging.                                                                                                                               |                                                      |
| `opts.relative` | `boolean`                                         | `false`              | When `false` (default) `top` & `left` are **viewport** coordinates using `getBoundingClientRect()`. <br>When `true`, the coordinates are **relative to the input element**’s top‑left corner. |                                                      |

### Return value

| Key      | Type     | Description                                                 |
| -------- | -------- | ----------------------------------------------------------- |
| `top`    | `number` | Y‑offset of caret (**viewport** or **relative**) in pixels. |
| `left`   | `number` | X‑offset of caret (**viewport** or **relative**) in pixels. |
| `height` | `number` | Approximate line height of the caret line.                  |

---

## 🏗️ How it works

The hook creates a **hidden mirror `div`** that copies the computed styles of your input, reproduces its text up to the caret, appends a marker `<span>`, and measures it. Measurements are scheduled with `requestAnimationFrame` after each `input` event to avoid layout thrashing.

If `relative` is `true`, the hook simply subtracts the input’s `getBoundingClientRect()` origin, yielding element‑relative coordinates.

---

## ⚠️ Caveats

* Only listens to the **`input`** event. If you move the caret via JavaScript (`selectionStart`, etc.) call the returned `compute` manually (coming soon) or trigger an `input` event.
* A mirror element is appended to `document.body` on the first run and reused for subsequent calls. It’s removed automatically on component unmount.
* Tested on modern evergreen browsers. Very old browsers may require polyfills for `requestAnimationFrame` or CSS logical properties.

---

## 🛠 Development

```bash
git clone https://github.com/fedemadoery/caret-coordinates-hook.git
cd caret-coordinates-hook
pnpm install
pnpm build   
```

---

## 🤝 Contributing

Issues, feature requests, and PRs are welcome! Please use conventional commits and run the test suite before pushing.

---

## 📜 License

[MIT](LICENSE)

---

## 📣 Acknowledgements

Ported from @component’s fantastic [`textarea-caret-position`](https://github.com/component/textarea-caret-position) to modern React + TypeScript with additional niceties.
