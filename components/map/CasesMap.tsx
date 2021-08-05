import mapboxgl from "maplibre-gl";
import React, { useEffect, useMemo, useState } from "react";
import BaseMap from "./BaseMap";
import { createCallbackWithLayer, MapWindow } from "./util";
import _ from "lodash";
import onLoadHandler from "./cases-load";

type CasesMapProps = {
  district_data: {
    "id": number,
    "province": string,
    "name": string,
    "caseCount": number
  }[]
}


const CasesMap = (props: CasesMapProps) => {
  const [hoveredData, setHoveredData] = useState<any>();
  const [infoBoxPosition, setInfoBoxPosition] =
    useState<{ x: number; y: number }>();
  const [linkedWindow, setLinkedWindow] = useState<MapWindow>({
    hoveredStateId: 0,
  } as MapWindow);
  useEffect(() => {
    (window as MapWindow).hoveredStateId = 0;
    setLinkedWindow(window as MapWindow);
  }, []);
  const amphoesData = props.district_data
  const onClicks = useMemo(
    () => [
      createCallbackWithLayer("cases-heat", (map: mapboxgl.Map, e) => {
        if (e.features[0]) {
          var centroid_x = e.features[0].properties["cen_lat"]
          var centroid_y = e.features[0].properties["cen_long"]
          map.flyTo({ center: [centroid_x, centroid_y], zoom: 10 });
        }
      }),
    ],
    []
  );
  const onMouseleaves = useMemo(
    () => [
      createCallbackWithLayer("province-fills", () => setHoveredData(null)),
      createCallbackWithLayer("cases-heat", (map, e) => {
        setHoveredData(null);
        if (linkedWindow.hoveredStateId) {
          map.setFeatureState(
            {
              source: "amphoes",
              sourceLayer: "61020bbaceacf1b5ea305dff",
              id: linkedWindow.hoveredStateId,
            },
            { hover: false }
          );
        }
        linkedWindow.hoveredStateId = null;
      }),
    ],
    []
  );
  const onMousemoves = useMemo(
    () => [
      createCallbackWithLayer("cases-heat", (map, e) => {
        setInfoBoxPosition(e.point);
        if (e.features.length > 0) {
          if (linkedWindow.hoveredStateId) {
            map.setFeatureState(
              {
                source: "amphoes",
                sourceLayer: "61020bbaceacf1b5ea305dff",
                id: linkedWindow.hoveredStateId,
              },
              { hover: false }
            );
          }
          linkedWindow.hoveredStateId = e.features[0].properties.fid;
          map.setFeatureState(
            {
              source: "amphoes",
              sourceLayer: "61020bbaceacf1b5ea305dff",
              id: e.features[0].properties.fid,
            },
            { hover: true }
          );

          if (!hoveredData) {
            const data = _.find(amphoesData, {
              id: Number(e.features[0].properties["fid"]),
            });
            setHoveredData(data);
          } else if (
            hoveredData["id"] !== Number(e.features[0].properties["fid"])
          ) {
            const data = _.find(amphoesData, {
              id: Number(e.features[0].properties["fid"]),
            });
            setHoveredData(data);
          }
        }
      }),
    ],
    []
  );
  return (
    <BaseMap
      onLoad={(map) => onLoadHandler(map, amphoesData)}
      onMove={[]}
      onClick={onClicks}
      onMousemove={onMousemoves}
      onMouseleave={onMouseleaves}
    >
      {hoveredData && (
        <div
          className="infoBox-container d-md-block d-none"
          style={{ top: infoBoxPosition.y + 15, left: infoBoxPosition.x }}
        >
          <div className="infoBox rounded shadow-sm">
            <span>
              <b>
                {hoveredData['province'] === 'กรุงเทพมหานคร' ? 'เขต' : 'อ.'}{hoveredData["name"]}, {hoveredData["province"]}
              </b>
            </span>
            <br />
            <span>
              ผู้ติดเชื้อในรอบ 14 วัน{" "}
              <b className="text-danger">
                {hoveredData.caseCount.toLocaleString()} ราย
              </b>
            </span>
          </div>
        </div>
      )}
      {hoveredData && (
        <div className="infoBox-container d-md-none d-block">
          <div className="infoBox rounded shadow-sm">
            <span>
              <b>
                {hoveredData['province'] === 'กรุงเทพมหานคร' ? 'เขต' : 'อ.'}{hoveredData["name"]}, {hoveredData["province"]}
              </b>
            </span>
            <br />
            <span>
              ผู้ติดเชื้อในรอบ 14 วัน{" "}
              <b className="text-danger">
                {hoveredData.caseCount.toLocaleString()} ราย
              </b>
            </span>
          </div>
        </div>
      )}
    </BaseMap>
  );
};

export default CasesMap;