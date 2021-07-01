import mapboxgl from "maplibre-gl";
import hospital_supply from "../gis/data/hospital-vaccination-data.json";

const loader = (map: mapboxgl.Map) => {
  console.log("Map Loaded");
  map.addSource("hospitals", {
    type: "vector",
    promoteId: { "60c61099f718be41ee8b7e16": "h_code" },
    url: "https://v2k.vallarismaps.com/core/tiles/60c61099f718be41ee8b7e16?api_key=RWWcffYDhbnw2IV40S3FTqwsQJkeWg6vV3qdkA1QqOGhdSfmAtu0iGEmPxobPru6",
  });
  var colorMatch: (string | number | string[])[] = ["match", ["get", "h_code"]];
  var sizeMatch: (string | number | string[])[] = ["match", ["get", "h_code"]];
  hospital_supply["data"].forEach((row) => {
    sizeMatch.push(
      row["h_code"],
      row["total_doses"] !== null ? row["total_doses"] : 0
    );
  });
  colorMatch.push(0);
  sizeMatch.push(0);
  map.addLayer({
    id: "hospital-point",
    type: "circle",
    source: "hospitals",
    "source-layer": "60c61099f718be41ee8b7e16",
    minzoom: 7,
    paint: {
      "circle-radius": [
        "interpolate",
        ["linear"],
        ["zoom"],
        2,
        [
          "interpolate",
          ["linear"],
          sizeMatch,
          1000,
          2,
          10000,
          4,
          100000,
          8,
          1000000,
          16,
        ],
        10,
        [
          "interpolate",
          ["linear"],
          sizeMatch,
          1000,
          5,
          10000,
          10,
          100000,
          20,
          1000000,
          40,
        ],
      ],
      "circle-color": "rgba(rgb(66, 113, 101,0.35)",
      "circle-stroke-width": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        1.7,
        1.2,
      ],
      "circle-stroke-color": [
        "case",
        ["boolean", ["feature-state", "hover"], false],
        "#000000",
        "rgb(66, 113, 101)",
      ],
    },
  });
  map.addLayer({
    id: "hospital-heat",
    type: "heatmap",
    source: "hospitals",
    "source-layer": "60c61099f718be41ee8b7e16",
    maxzoom: 7,
    paint: {
      'heatmap-weight': [
        'interpolate',
        ['linear'],
        sizeMatch,
        1000,
        0.2,
        10000,
        0.4,
        50000,
        0.6,
        100000,
        0.8,
        1000000,
        1,
      ],
      'heatmap-radius': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0,
        4,
        7,
        15
      ],
      'heatmap-intensity': [
        'interpolate',
        ['linear'],
        ['zoom'],
        0,
        1,
        9,
        3
      ],
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,
        'rgba(33,102,172,0)',
        0.3,
        'rgba(176, 206, 195,0.7)',
        0.6,
        '#7ba797',
        0.8,
        '#47816e',
        1,
        '#005c46'
      ]
    }
  });
};

export default loader;
