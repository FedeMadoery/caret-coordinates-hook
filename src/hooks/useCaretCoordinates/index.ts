import propTypes from 'prop-types';
import { RefObject, useCallback, useLayoutEffect, useRef, useState } from 'react';

type CaretCoordinates = { top: number; left: number; height: number };
type Options = { debug?: boolean; relative?: boolean };

// --------------------------------------------
// The relevant computed styles
// --------------------------------------------
const PROPERTIES = [
  'direction',
  'boxSizing',
  'width',
  'height',
  'overflowX',
  'overflowY',
  'borderTopWidth',
  'borderRightWidth',
  'borderBottomWidth',
  'borderLeftWidth',
  'borderStyle',
  'paddingTop',
  'paddingRight',
  'paddingBottom',
  'paddingLeft',
  'fontStyle',
  'fontVariant',
  'fontWeight',
  'fontStretch',
  'fontSize',
  'fontSizeAdjust',
  'lineHeight',
  'fontFamily',
  'textAlign',
  'textTransform',
  'textIndent',
  'textDecoration',
  'letterSpacing',
  'wordSpacing',
  'tabSize',
  'MozTabSize',
] as const;

// Events that can move the caret or change content
const TRACK_EVENTS = ['input'] as const;

const MIRROR_ITEM_ID = 'textarea-caret-position-mirror' as const;

/**
 * React Hook that returns the pixel coordinates of the caret
 * inside a <textarea> or <input type="text">.
 *
 * @param ref – a ref pointing at the target element
 * @param opts – { debug?: boolean, relative?: boolean }
 *
 * @returns { top, left, height }
 */
export function useCaretCoordinates(
  ref: RefObject<HTMLTextAreaElement | HTMLInputElement | null>,
  opts: Options = {},
): CaretCoordinates {
  const { debug = false, relative = false } = opts;
  const [coords, setCoords] = useState<CaretCoordinates>({
    top: 0,
    left: 0,
    height: 0,
  });

  const mirrorRef = useRef<HTMLDivElement | null>(null);
  const raf = useRef<number | null>(null);

  // Helper that (re)computes the coordinates from the DOM
  const compute = useCallback(() => {
    const el = ref.current;
    if (!el) return;

    const position = el.selectionStart ?? 0;
    const value = el.value;
    const computed = window.getComputedStyle(el);
    const isInput = el.nodeName === 'INPUT';
    const isFirefox = 'mozInnerScreenX' in window && window.mozInnerScreenX != null;

    // Build mirror lazily
    if (!mirrorRef.current) {
      mirrorRef.current = document.createElement('div');
      mirrorRef.current.id = MIRROR_ITEM_ID;
      document.body.appendChild(mirrorRef.current);
    }
    const mirror = mirrorRef.current;
    const style = mirror.style;

    PROPERTIES.forEach((prop) => {
      // @ts-expect-error "prop" is not a type of keyof CSSStyleDeclaration, so an implicit type of result is going to be any
      style[prop] = computed[prop];
    });

    if (isInput) style.lineHeight = computed.height;
    style.whiteSpace = 'pre-wrap';
    if (!isInput) style.wordWrap = 'break-word';
    style.position = 'absolute';
    style.visibility = debug ? 'visible' : 'hidden';
    style.top = '0';
    style.left = '-9999px';
    style.overflow = isFirefox ? 'scroll' : 'hidden';

    // Fill mirror and caret marker
    mirror.textContent = value.substring(0, position);
    if (isInput) {
      mirror.textContent = mirror.textContent.replace(/\s/g, '\u00a0');
    }
    const span = document.createElement('span');
    span.textContent = value.substring(position) || '.';
    mirror.appendChild(span);

    // ── Local offsets inside the textarea ─────────────────────────────────────
    const caretInsideY =
      span.offsetTop - el.scrollTop + parseInt(computed.borderTopWidth, 10);
    const caretInsideX =
      span.offsetLeft - el.scrollLeft + parseInt(computed.borderLeftWidth, 10);

    // ── Translate to viewport ─────────────────────────────────────────────────
    const rect = el.getBoundingClientRect();
    const top = rect.top + caretInsideY;
    const left = rect.left + caretInsideX;
    const height = parseInt(computed.lineHeight, 10);

    if (debug) span.style.backgroundColor = '#ff0';

    if (relative) {
      setCoords({ top: caretInsideY, left: caretInsideX, height });
    } else {
      setCoords({ top, left, height });
    }

    mirror.innerHTML = '';
  }, [debug, ref]);

  // Attach / detach listeners once
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const schedule = () => {
      cancelAnimationFrame(raf.current!);
      raf.current = requestAnimationFrame(compute); // async ⇒ browser finishes default action first
    };

    TRACK_EVENTS.forEach((evt) => el.addEventListener(evt, schedule));

    // Initial run
    compute();

    return () => {
      TRACK_EVENTS.forEach((evt) => el.removeEventListener(evt, schedule));
    };
  }, [ref, debug, compute]);

  return coords;
}

// -- PropTypes --------------------------------------------------------------
useCaretCoordinates.propTypes = {
  // Forwarded ref coming from useRef() or createRef()
  ref: propTypes.shape({
    current: propTypes.instanceOf(Element), // <textarea> | <input> | null
  }).isRequired,

  // Optional options object
  opts: propTypes.shape({
    debug: propTypes.bool,
  }),
};

useCaretCoordinates.defaultProps = {
  opts: { debug: false },
};
