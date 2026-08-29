import { createContext, useContext } from 'react';

/**
 * Holds the live BLE / Web Serial connection.
 *
 * This lives in a context mounted ABOVE the router outlet so that navigating
 * between routes never remounts the hook that owns the connection. Dropping a
 * connection mid-upload because someone clicked a link would be unacceptable.
 */
export const DeviceContext = createContext(null);

export function useDeviceContext() {
  const ctx = useContext(DeviceContext);
  if (!ctx) {
    throw new Error('useDeviceContext must be used inside <DeviceProvider>');
  }
  return ctx;
}
