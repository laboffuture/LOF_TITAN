import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/*
 * Lets a full-screen page put its own controls into the app's single top bar,
 * so there is never a second toolbar under it. App.jsx renders the slot
 * elements; a page renders <NavSlot name="start|end|close"> and its children appear
 * there while the page is open.
 *   start - middle of the bar (page title, section switcher)
 *   end   - after the shared tools (page actions such as Upload & Run)
 *   close - the very last item (the page's Close button)
 */
export const NAV_SLOT_IDS = {
  start: 'lof-nav-slot-start',
  end: 'lof-nav-slot-end',
  close: 'lof-nav-slot-close',
};

export function NavSlot({ name, children }) {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    setTarget(document.getElementById(NAV_SLOT_IDS[name]));
  }, [name]);

  if (!target) return null;
  return createPortal(children, target);
}
