import { useParams, Navigate, useNavigate } from 'react-router-dom';
import { ProjectStoreDetailModal } from '../components/ProjectStoreDetailModal';
import { projects } from '../projects';
import { useDeviceContext } from '../device/deviceContext';
import { useCloseRoute } from '../hooks/useCloseRoute';
import { useEntitlement } from '../auth/authContext';
import { getKit, isAvailable } from '../auth/kits';

export function KitDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const device = useDeviceContext();
  const close = useCloseRoute('/');
  const owned = useEntitlement(id);

  const project = projects.find((p) => p.id === id);

  // Unknown or not-yet-built kit: send them back to the store rather than
  // silently showing a different kit (the old fallback behaviour).
  if (!project || !isAvailable(id)) {
    return <Navigate to="/" replace />;
  }

  return (
    <ProjectStoreDetailModal
      isOpen
      project={project}
      owned={owned}
      kitName={getKit(id)?.name || project.name}
      onClose={close}
      onUploadCode={(codeToUpload) => device.runUpload(codeToUpload || project.code)}
      onOpenBlockCode={() => navigate('/code')}
      onOpenSerialMonitor={() => navigate('/monitor')}
      device={device}
    />
  );
}
