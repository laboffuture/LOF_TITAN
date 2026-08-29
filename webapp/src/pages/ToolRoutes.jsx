import { BlocklyIDE } from '../components/BlocklyIDE';
import { AIAssistantIDE } from '../components/AIAssistantIDE';
import { SerialMonitorModal } from '../components/SerialMonitorModal';
import { FirmwareFlasherModal } from '../components/FirmwareFlasherModal';
import { useDeviceContext } from '../device/deviceContext';
import { useCloseRoute } from '../hooks/useCloseRoute';

/**
 * The four tools, each now owning a URL.
 *
 * They keep their existing modal presentation - only the open/close mechanism
 * moved from a boolean flag to the router.
 */

export function CodeRoute() {
  const device = useDeviceContext();
  const close = useCloseRoute('/');
  return (
    <BlocklyIDE
      isOpen
      onClose={close}
      device={device}
      onUploadCode={(generatedCode) => device.runUpload(generatedCode)}
    />
  );
}

export function AIRoute() {
  const device = useDeviceContext();
  const close = useCloseRoute('/');
  return (
    <AIAssistantIDE
      isOpen
      onClose={close}
      device={device}
      onUploadCode={(generatedCode) => device.runUpload(generatedCode)}
    />
  );
}

export function MonitorRoute() {
  const device = useDeviceContext();
  const close = useCloseRoute('/');
  return <SerialMonitorModal isOpen onClose={close} device={device} />;
}

export function FlashRoute() {
  const device = useDeviceContext();
  const close = useCloseRoute('/');
  return (
    <FirmwareFlasherModal isOpen onClose={close} onDisconnectCurrent={device.disconnect} />
  );
}
