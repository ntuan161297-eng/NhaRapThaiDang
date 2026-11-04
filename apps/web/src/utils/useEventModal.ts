import { useEffect, useRef } from 'react';

/** Keep keyboard focus and page scrolling inside a modal, then restore both. */
export function useEventModal(onClose: () => void, busy: boolean) {
  const ref = useRef<HTMLElement>(null);
  const close = useRef(onClose);
  const pending = useRef(busy);
  close.current = onClose;
  pending.current = busy;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const focusable = () => Array.from(ref.current?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), a[href], [tabindex="0"]') || []).filter(element => element.getClientRects().length > 0);
    (focusable()[0] || ref.current)?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !pending.current) { event.preventDefault(); close.current(); }
      if (event.key !== 'Tab') return;
      const elements = focusable();
      if (!elements.length) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === elements[0] || !ref.current?.contains(document.activeElement))) { event.preventDefault(); elements.at(-1)?.focus(); }
      else if (!event.shiftKey && (document.activeElement === elements.at(-1) || !ref.current?.contains(document.activeElement))) { event.preventDefault(); elements[0].focus(); }
    };
    document.addEventListener('keydown', key);
    return () => { document.body.style.overflow = overflow; document.removeEventListener('keydown', key); previous?.focus(); };
  }, []);
  return ref;
}
