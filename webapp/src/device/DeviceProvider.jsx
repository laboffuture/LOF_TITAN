import { useState, useMemo, useCallback } from 'react';
import { DeviceContext } from './deviceContext';
import { useDevice } from '../bluetooth/useDevice';

/**
 * Owns the single useDevice() instance for the whole app.
 *
 * Mounted above <Routes>, so route changes leave the connection untouched.
 *
 * Also owns upload progress, because the progress overlay is global chrome while
 * uploads are kicked off from several different routes.
 */
export function DeviceProvider({ children }) {
  const device = useDevice();
  const [uploadProgress, setUploadProgress] = useState(null);

  const runUpload = useCallback(
    async (code, filename = 'main.py') => {
      if (!code) return;
      setUploadProgress(0);
      try {
        await device.uploadProgram(filename, code, setUploadProgress);
      } catch (error) {
        console.error(error);
        alert('Upload to TITAN failed: ' + error.message);
      }
      setTimeout(() => setUploadProgress(null), 1000);
    },
    [device]
  );

  const value = useMemo(
    () => ({ ...device, uploadProgress, runUpload }),
    [device, uploadProgress, runUpload]
  );

  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>;
}
