import mapboxgl from "maplibre-gl";

export const createCallbackWithLayer = (
  layer: string,
  callback: (
    map: mapboxgl.Map,
    e?: mapboxgl.MapMouseEvent & mapboxgl.EventData
  ) => void
) => {
  return {
    cb: callback,
    layer,
  };
};
