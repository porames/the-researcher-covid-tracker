import mapboxgl from "maplibre-gl";
import Head from "next/head";
import React, { useEffect, useRef, useState } from "react";
import Pulse from "./Pulse";

interface IMapProps {
  onLoad: (map: mapboxgl.Map) => void;
  onMove: ((map: mapboxgl.Map) => void)[];
  onRender?: ((map: mapboxgl.Map) => void)[];
  onMoveend?: ((map: mapboxgl.Map) => void)[];
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
  credits?: React.ReactNode;
  useTable?: boolean;
  visibleFeatures?: any;
}

const LoadingScreen = (props) => (
  <div
    style={{
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: (props.loaded ? -1 : 3),
      transition: "background-color 1s",
      backgroundColor: (props.loaded ? "transparent" : "#383838")
    }}
  >
  </div>
)

const TableLayout = (props) => {
  const { visibleFeatures, page, mapContainer, map, children, setPage, loaded } = props
  return (
    <div className="container-fluid w-100">

      <div className="row mt-4 flex-column-reverse flex-md-row">
        <div
          className="col-md-5 p-0 mt-md-0 mt-4"
          style={{ overflowY: "auto", maxHeight: "90vh" }}
        >
          <div className="table-responsive">
            <table className="table text-white credit table-grey">
              <thead>
                <tr>
                  <th style={{ width: "60%" }}>สถานที่ให้บริการวัคซีน</th>
                  <th>จำนวนวัคซีนที่ฉีด (โดส)</th>
                </tr>
              </thead>
              <tbody style={{ maxHeight: 300, overflow: "auto" }}>
                {visibleFeatures.map((item, index) => {
                  if (index < 20 * page) {
                    return (
                      <tr key={index}>
                        <td>{item.h_name}</td>
                        <td>{item.total_doses.toLocaleString()}</td>
                      </tr>
                    );
                  }
                })}
              </tbody>
            </table>
          </div>
          <div className="pb-2 px-2">
            {visibleFeatures.length >= page * 20 && (
              <button
                style={{ fontSize: "90%" }}
                onClick={() => setPage(page + 1)}
                className="rounded table-toggle text-sm"
              >
                โหลดเพิ่ม
              </button>
            )}
          </div>
        </div>
        <div className="col-md-7 p-0">
          <div className="mapContainer">
            <LoadingScreen loaded={loaded} />
            <div
              ref={mapContainer}
              style={{
                position: "absolute",
                top: 0,
                bottom: 0,
                left: 0,
                right: 0,
              }}
            ></div>
            <div
              onClick={() =>
                map.flyTo({ center: [101.1, 13.12], zoom: 4.5 })
              }
              className="reset-button"
            >
              <button className="btn-icon bg-white">
                <img src="/fullscreen_exit-black.svg" alt="reset zoom" />
              </button>
            </div>
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}

const MapLayout = (props) => {
  const { mapContainer, children, map, loaded } = props
  return (
    <div className="mapContainer">
      <LoadingScreen loaded={loaded} />
      <div
        ref={mapContainer}
        style={{
          position: "absolute",
          top: 0,
          bottom: 0,
          left: 0,
          right: 0,
        }}
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
  )
}

const BaseMap = ({
  onLoad,
  onMove = [],
  onMoveend = [],
  onRender = [],
  onMousemove = [],
  onMouseleave = [],
  onClick = [],
  children,
  credits,
  useTable = false,
  visibleFeatures = [],
}: React.PropsWithChildren<IMapProps>) => {
  const [lng, setLng] = useState<number>(useTable ? 100.5018 : 101.1);
  const [lat, setLat] = useState<number>(useTable ? 13.7563 : 13.12);
  const [zoom, setZoom] = useState<number>(useTable ? 11 : 4.5);
  const [map, setMap] = useState<mapboxgl.Map>(undefined);
  const mapContainer = useRef<HTMLDivElement>(undefined);
  const [loaded, setLoaded] = useState<boolean>(false);
  useEffect(() => {
    if (!mapContainer.current) return;
    if (map) return;
    const currentMap = new mapboxgl.Map({
      container: mapContainer.current,
      style: useTable
        ? "https://v2k.vallarismaps.com/core/api/1.0-beta/styles/60c9f2a0c92e6b76b6c22875?api_key=RWWcffYDhbnw2IV40S3FTqwsQJkeWg6vV3qdkA1QqOGhdSfmAtu0iGEmPxobPru6"
        : "https://v2k.vallarismaps.com/core/api/1.0-beta/styles/60c50d5df718be41ee8b7785?api_key=RWWcffYDhbnw2IV40S3FTqwsQJkeWg6vV3qdkA1QqOGhdSfmAtu0iGEmPxobPru6",
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
      setLng(Number(currentMap.getCenter().lng.toFixed(2)));
      setLat(Number(currentMap.getCenter().lat.toFixed(2)));
      setZoom(Number(currentMap.getZoom().toFixed(2)));
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
  }, [mapContainer.current, map, loaded]);
  useEffect(() => {
    if (!mapContainer.current) return;
    if (!map) return;
    if (!loaded) return;
    const mouseleaveCallbacks = onMouseleave.map(({ cb, layer }) => {
      const callback = (e) => cb(map, e);
      map.on("mouseleave", layer, callback);
      return { cb: callback, layer };
    });
  }, [mapContainer.current, map, loaded]);
  useEffect(() => {
    if (!mapContainer.current) return;
    if (!map) return;
    if (!loaded) return;
    const clickCallbacks = onClick.map(({ cb, layer }) => {
      const callback = (e) => cb(map, e);
      map.on("click", layer, callback);
      return { cb: callback, layer };
    });
  }, [mapContainer.current, map, loaded]);
  useEffect(() => {
    if (!mapContainer.current) return;
    if (!map) return;
    if (!loaded) return;
    const moveendCallbacks = onMoveend.map((cb) => {
      const callback = () => cb(map);
      map.on("moveend", callback);
      return callback;
    });
  }, [mapContainer.current, map, loaded]);
  useEffect(() => {
    if (!mapContainer.current) return;
    if (!map) return;
    if (!loaded) return;
    const renderCallbacks = onRender.map((cb) => {
      const callback = () => cb(map);
      map.on("render", callback);
      return callback;
    });
  }, [mapContainer.current, map, loaded]);
  const [page, setPage] = useState<number>(1);
  useEffect(() => {
    setPage(1);
  }, [visibleFeatures]);
  return (
    <div>
      <Head>
        <link
          href="https://api.mapbox.com/mapbox-gl-js/v2.0.1/mapbox-gl.css"
          rel="stylesheet"
        />
      </Head>
      <div>
        {useTable ?
          <TableLayout
            visibleFeatures={visibleFeatures}
            map={map}
            mapContainer={mapContainer}
            page={page}
            children={children}
            setPage={setPage}
            loaded={loaded}
          />
          :
          <MapLayout
            map={map}
            mapContainer={mapContainer}
            children={children}
            loaded={loaded}
          />
        }
      </div>
      {credits}
    </div>
  );
};

export default BaseMap;
