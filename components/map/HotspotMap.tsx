import mapboxgl from "maplibre-gl";
import provincesData from "../gis/data/provinces-data-14days.json";
import Graph from "../provinceCurve";
import React, { useMemo, useState } from "react";
import BaseMap from "./BaseMap";
import { createCallbackWithLayer } from "./util";
import _ from "lodash";

const HotspotInfoBox = (props) => (
  <div className="infoBox rounded shadow-sm">
    <div>
      <span>
        <b>จังหวัด{props.hoveredData.name}</b>
      </span>
      <br />
      <span>
        ผู้ติดเชื้อในรอบ 14 วัน{" "}
        <b className="text-danger">
          {props.hoveredData.caseCount.toLocaleString()} ราย
        </b>
      </span>
    </div>
    {props.hoveredData.caseCount > 5 && (
      <div className="mt-3">
        <Graph
          data={props.hoveredData.cases}
          caseCount={props.hoveredData.caseCount}
        />
        <div>
          <small className="text-muted">เส้นแนวโน้มในช่วง 14 วัน</small>
        </div>
      </div>
    )}
    {props.hoveredData.caseCount <= 5 && (
      <span className="text-muted">ข้อมูลไม่เพียงพอ</span>
    )}
  </div>
);

const onLoad = (map: mapboxgl.Map) => {
  // Add a geojson point source.
  // Heatmap layers also work with a vector tile source.
  map.addSource("provinces", {
    type: "vector",
    url: "https://v2k.vallarismaps.com/core/tiles/60c4fbfcceacf1b5ea19ae9a?api_key=RWWcffYDhbnw2IV40S3FTqwsQJkeWg6vV3qdkA1QqOGhdSfmAtu0iGEmPxobPru6",
  });
  map.addSource("provinces-label", {
    type: "vector",
    url: "https://v2k.vallarismaps.com/core/tiles/60c4515b1499452793d179a7?api_key=RWWcffYDhbnw2IV40S3FTqwsQJkeWg6vV3qdkA1QqOGhdSfmAtu0iGEmPxobPru6",
  });
  map.addSource("cases", {
    type: "vector",
    url: "https://v2k.vallarismaps.com/core/tiles/60c452f21499452793d179a8?api_key=RWWcffYDhbnw2IV40S3FTqwsQJkeWg6vV3qdkA1QqOGhdSfmAtu0iGEmPxobPru6",
  });
  map.addSource("amphoe", {
    type: "vector",
    url: "https://v2k.vallarismaps.com/core/tiles/60c42abbf718be41ee8b64f7?api_key=RWWcffYDhbnw2IV40S3FTqwsQJkeWg6vV3qdkA1QqOGhdSfmAtu0iGEmPxobPru6",
  });

  var provinceMatch: (string | string[] | number)[] = [
    "match",
    ["get", "PROV_CODE"],
  ];
  provincesData.forEach((row) => {
    provinceMatch.push(row["id"].toString(), row["cases-per-100k"]);
  });
  provinceMatch.push(0);

  map.addLayer({
    id: "province-fills",
    type: "fill",
    source: "provinces",
    "source-layer": "60c4fbfcceacf1b5ea19ae9a",
    layout: {},
    paint: {
      "fill-opacity": 0.6,
      "fill-color": [
        "interpolate",
        ["linear"],
        provinceMatch,
        0,
        "#fafafa",
        10,
        "#FFFA6C",
        30,
        "#FFB14D",
        50,
        "#FF682D",
        100,
        "#a2322c",
        250,
        "#460c39",
        1000,
        "#29010e",
      ],
    },
  });
  map.addLayer({
    id: "provinces-outline",
    type: "line",
    source: "provinces",
    "source-layer": "60c4fbfcceacf1b5ea19ae9a",
    paint: {
      "line-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        "#212121",
        "rgba(255,255,255,0.2)",
      ],
      "line-width": 1,
    },
  });
  map.addLayer({
    id: "amphoe-outline",
    type: "line",
    source: "amphoe",
    "source-layer": "60c42abbf718be41ee8b64f7",
    paint: {
      "line-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        "#212121",
        "rgba(255,255,255,0.2)",
      ],
      "line-width": 0.5,
      "line-opacity": 0.5,
    },
  });
  map.addLayer({
    id: "provinces-label",
    type: "symbol",
    source: "provinces-label",
    "source-layer": "60c4515b1499452793d179a7",
    minzoom: 5.4,
    maxzoom: 8,
    layout: {
      "text-field": ["get", "PROV_NAMT"],
      "text-font": ["Kanit"],
      "text-variable-anchor": ["top", "bottom", "left", "right"],
      "text-justify": "center",
      "text-size": 12,
    },
    paint: {
      "text-color": "#ffffff",
      "text-halo-width": 0.8,
      "text-halo-blur": 1,
      "text-halo-color": "#424242",
      "text-opacity": ["interpolate", ["linear"], ["zoom"], 7.8, 1],
    },
  });
  map.addLayer({
    id: "amphoe-label",
    type: "symbol",
    source: "cases",
    "source-layer": "60c452f21499452793d179a8",
    minzoom: 8,
    layout: {
      "text-field": ["get", "A_NAME_T"],
      "text-font": ["Kanit"],
      "text-variable-anchor": ["top", "bottom", "left", "right"],
      "text-radial-offset": 1,
      "text-justify": "center",
      "text-size": 14,
    },
    paint: {
      "text-color": "#ffffff",
      "text-halo-width": 0.8,
      "text-halo-blur": 1,
      "text-halo-color": "#424242",
    },
  });
};

const HotspotMap = () => {
  const [hoveredData, setHoveredData] = useState<any>();
  const [infoBoxPosition, setInfoBoxPosition] =
    useState<{ x: number; y: number }>();
  const [hoveredStateId, setHoveredStateId] = useState<number>(0);
  const onClicks = useMemo(
    () => [
      createCallbackWithLayer("province-fills", (map: mapboxgl.Map, e) => {
        var centroid_x = e.features[0].properties["centroid"]
          .split(":")[1]
          .split(",")[0];
        var centroid_y = e.features[0].properties["centroid"]
          .split(":")[1]
          .split(",")[1]
          .split(")")[0];
        map.flyTo({ center: [centroid_x, centroid_y], zoom: 7 });
      }),
    ],
    []
  );
  const onMouseleaves = useMemo(
    () => [
      createCallbackWithLayer("province-fills", () => setHoveredData(null)),
      createCallbackWithLayer("province-fills", (map, e) => {
        if (hoveredStateId) {
          map.setFeatureState(
            {
              source: "provinces",
              sourceLayer: "60c4fbfcceacf1b5ea19ae9a",
              id: hoveredStateId,
            },
            { hover: false }
          );
        }
        setHoveredStateId(null);
      }),
    ],
    [hoveredStateId]
  );
  const onMousemoves = useMemo(
    () => [
      createCallbackWithLayer("province-fills", (map, e) => {
        setInfoBoxPosition(e.point);
        if (e.features.length <= 0) return;
        if (hoveredStateId) {
          map.setFeatureState(
            {
              source: "provinces",
              sourceLayer: "60c4fbfcceacf1b5ea19ae9a",
              id: hoveredStateId,
            },
            { hover: false }
          );
        }
        setHoveredStateId(e.features[0].id);
        map.setFeatureState(
          {
            source: "provinces",
            sourceLayer: "60c4fbfcceacf1b5ea19ae9a",
            id: e.features[0].id,
          },
          { hover: true }
        );
        if (!hoveredData) {
          const data = _.find(provincesData, {
            id: Number(e.features[0].properties["PROV_CODE"]),
          });
          setHoveredData(data);
        } else if (
          hoveredData["id"] !== Number(e.features[0].properties["PROV_CODE"])
        ) {
          const data = _.find(provincesData, {
            id: Number(e.features[0].properties["PROV_CODE"]),
          });
          setHoveredData(data);
        }
      }),
    ],
    [hoveredStateId]
  );
  return (
    <BaseMap
      onLoad={onLoad}
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
          <HotspotInfoBox hoveredData={hoveredData} />
        </div>
      )}
      {hoveredData && (
        <div className="infoBox-container d-md-none d-block">
          <HotspotInfoBox hoveredData={hoveredData} />
        </div>
      )}
    </BaseMap>
  );
};

export default HotspotMap;
