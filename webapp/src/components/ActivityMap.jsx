import { useEffect, useRef, useState } from 'react';

/**
 * Bubble map of where the product is being used.
 *
 * Leaflet is loaded with a dynamic import so it never enters the student
 * bundle - this screen is admin-only, and Leaflet plus its CSS is ~150KB that
 * a learner opening the Blockly editor should not pay for.
 */

/** Area, not radius, tracks the user count - otherwise big cities look enormous. */
function radiusFor(users, max) {
  if (!max) return 6;
  const scaled = Math.sqrt(users / max);
  return 6 + scaled * 22;
}

export function ActivityMap({ places, onSelect }) {
  const holder = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const [failed, setFailed] = useState(false);

  // Create the map once. Re-running this on every data change would tear down
  // and rebuild the tile layer, which flashes and refetches tiles.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const L = (await import('leaflet')).default;
        await import('leaflet/dist/leaflet.css');
        if (cancelled || !holder.current || mapRef.current) return;

        const map = L.map(holder.current, {
          zoomControl: true,
          attributionControl: true,
          scrollWheelZoom: true,
          doubleClickZoom: true,
          dragging: true,
          minZoom: 2,
          maxZoom: 16,
        }).setView([22.35, 79.5], 4); // roughly centred on India

        // Esri's light canvas: a pale, low-contrast basemap built for exactly
        // this - data drawn on top. Plain OpenStreetMap tiles carry far more
        // colour and detail, which competes with the bubbles instead of
        // supporting them.
        L.tileLayer(
          'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
          {
            minZoom: 2,
            maxZoom: 16,
            zIndex: 1,
            attribution: 'Esri, HERE, Garmin, &copy; OpenStreetMap contributors',
          }
        ).addTo(map);

        // Boundaries and place names, as a separate transparent overlay. Esri
        // splits its canvas basemaps this way: the base is deliberately
        // unlabelled, so without this there is no way to tell Maharashtra from
        // Karnataka. zIndex keeps it above the base; the bubbles live in
        // Leaflet's overlay pane and stay above both.
        L.tileLayer(
          'https://services.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}',
          {
            minZoom: 2,
            maxZoom: 16,
            zIndex: 2,
            // Already credited by the base layer - repeating it would print the
            // same line twice in the attribution bar.
            attribution: '',
          }
        ).addTo(map);

        mapRef.current = map;
        layerRef.current = L.layerGroup().addTo(map);
        setFailed(false);
      } catch {
        // Offline, or tiles blocked by a corporate network. The ranked table
        // beside the map still carries every number, so this is degraded, not
        // broken.
        if (!cancelled) setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        layerRef.current = null;
      }
    };
  }, []);

  // Redraw bubbles when the data changes.
  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!mapRef.current || !layerRef.current) return;
      const L = (await import('leaflet')).default;
      if (cancelled) return;

      layerRef.current.clearLayers();
      const rows = (places || []).filter((p) => Number.isFinite(p.lat) && Number.isFinite(p.lon));
      if (!rows.length) return;

      const max = Math.max(...rows.map((p) => p.users || 0), 1);

      for (const p of rows) {
        const marker = L.circleMarker([p.lat, p.lon], {
          radius: radiusFor(p.users || 0, max),
          color: '#0e7490',
          weight: 2,
          fillColor: '#06b6d4',
          fillOpacity: 0.55,
        });

        const where = [p.city, p.region, p.country].filter(Boolean).join(', ');
        marker.bindTooltip(
          `<strong>${where}</strong><br>${p.users} user${p.users === 1 ? '' : 's'} · ${p.events} event${p.events === 1 ? '' : 's'}`,
          { direction: 'top' }
        );
        if (onSelect) marker.on('click', () => onSelect(p));
        marker.addTo(layerRef.current);
      }

      // Frame the data rather than leaving the default view, so a deployment
      // outside India is not off-screen.
      try {
        const bounds = L.latLngBounds(rows.map((p) => [p.lat, p.lon]));
        mapRef.current.fitBounds(bounds.pad(0.25), { maxZoom: 8 });
      } catch {
        // A single point can produce degenerate bounds; the default view is fine.
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [places, onSelect]);

  if (failed) {
    return (
      <div className="h-[420px] lg:h-[560px] rounded-2xl bg-slate-950 border border-white/10 flex items-center justify-center text-center p-6">
        <p className="text-sm text-slate-400 max-w-sm">
          Map tiles could not be loaded — this network may block OpenStreetMap.
          The city rankings below are unaffected.
        </p>
      </div>
    );
  }

  return (
    <div
      ref={holder}
      className="h-[420px] lg:h-[560px] rounded-2xl overflow-hidden border border-white/15 bg-slate-200"
    />
  );
}
