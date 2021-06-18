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
};

export default loader;
