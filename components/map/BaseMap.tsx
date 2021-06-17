import mapboxgl from "maplibre-gl";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";

interface IMapProps {
  onLoad: (map: mapboxgl.Map) => void;
  onMove: ((map: mapboxgl.Map) => void)[];
  onMousemove: {
    cb: (
      map: mapboxgl.Map,
      e: mapboxgl.MapMouseEvent & mapboxgl.EventData
    ) => void;
    layer: string;
  }[];
  onMouseleave: {
    cb: (
      map: mapboxgl.Map,
      e: mapboxgl.MapMouseEvent & mapboxgl.EventData
    ) => void;
    layer: string;
  }[];
  onClick: {
    cb: (
      map: mapboxgl.Map,
      e: mapboxgl.MapMouseEvent & mapboxgl.EventData
    ) => void;
    layer: string;
  }[];
}

const BaseMap = ({
  onLoad,
  onMove,
  onMousemove,
  onMouseleave,
  onClick,
  children,
}: React.PropsWithChildren<IMapProps>) => {
  const [lng, setLng] = useState<number>(101.1);
  const [lat, setLat] = useState<number>(13.12);
  const [zoom, setZoom] = useState<number>(4.5);
  const [map, setMap] = useState<mapboxgl.Map>(undefined);
  const mapContainer = useRef<HTMLDivElement>(undefined);
  const [loaded, setLoaded] = useState<boolean>(false);
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map) return;
    const currentMap = new mapboxgl.Map({
      container: mapContainer.current,
      style:
        "https://v2k.vallarismaps.com/core/api/1.0-beta/styles/60c50d5df718be41ee8b7785?api_key=RWWcffYDhbnw2IV40S3FTqwsQJkeWg6vV3qdkA1QqOGhdSfmAtu0iGEmPxobPru6",
      center: [lng, lat],
      zoom: zoom,
      maxBounds: [
        [83.271483, 4],
        [117, 22],
      ],
      minZoom: 3,
    });
    currentMap.scrollZoom.disable();
    currentMap.dragRotate.disable();
    currentMap.touchZoomRotate.disableRotation();
    currentMap.addControl(
      new mapboxgl.NavigationControl({ showCompass: false, showZoom: true })
    );
    const moveCallback = () => {
      setLng(currentMap.getCenter().lng);
      setLat(currentMap.getCenter().lat);
      setZoom(currentMap.getZoom());
      onMove.map((cb) => cb(currentMap));
    };
    currentMap.on("move", moveCallback);
    currentMap.once("load", () => {
      onLoad(currentMap);
      setLoaded(true);
    });
    setMap(currentMap);
    return () => currentMap.off("move", moveCallback);
  }, [mapContainer.current, map]);
  useEffect(() => {
    if (!mapContainer.current) return;
    if (!map) return;
    if (!loaded) return;
    const mousemoveCallbacks = onMousemove.map(({ cb, layer }) => {
      const callback = (e) => cb(map, e);
      map.on("mousemove", layer, callback);
      return { cb: callback, layer };
    });
    return () =>
      mousemoveCallbacks.map(({ cb, layer }) =>
        map.off("mousemove", layer, cb)
      );
  }, [mapContainer.current, map, loaded, onMousemove]);
  useEffect(() => {
    if (!mapContainer.current) return;
    if (!map) return;
    if (!loaded) return;
    const mouseleaveCallbacks = onMouseleave.map(({ cb, layer }) => {
      const callback = (e) => cb(map, e);
      map.on("mouseleave", layer, callback);
      return { cb: callback, layer };
    });
    return () =>
      mouseleaveCallbacks.map(({ cb, layer }) =>
        map.off("mouseleave", layer, cb)
      );
  }, [mapContainer.current, map, loaded, onMouseleave]);
  useEffect(() => {
    if (!mapContainer.current) return;
    if (!map) return;
    if (!loaded) return;
    const clickCallbacks = onClick.map(({ cb, layer }) => {
      const callback = (e) => cb(map, e);
      map.on("click", layer, callback);
      return { cb: callback, layer };
    });
    return () =>
      clickCallbacks.map(({ cb, layer }) => map.off("click", layer, cb));
  }, [mapContainer.current, map, loaded, onClick]);
  return (
    <div>
      <Head>
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.0.1/mapbox-gl.css"
          rel="stylesheet"
        />
      </Head>
      <div className="mapContainer">
        <div
          ref={mapContainer}
          style={{ position: "absolute", top: 0, bottom: 0, left: 0, right: 0 }}
        ></div>
        <div
          onClick={() => map.flyTo({ center: [101.1, 13.12], zoom: 4.5 })}
          className="reset-button"
        >
          <button className="btn-icon bg-white">
            <img src="/fullscreen_exit-black.svg" alt="reset zoom" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};

export default BaseMap;
