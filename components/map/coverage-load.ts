import mapboxgl from "maplibre-gl";

const loader = (map: mapboxgl.Map, provincesData) => {
    console.log("Map Loaded");
    console.log(provincesData)
    map.addSource("provinces", {
        type: "vector",
        url: "https://v2k.vallarismaps.com/core/tiles/60c4fbfcceacf1b5ea19ae9a?api_key=RWWcffYDhbnw2IV40S3FTqwsQJkeWg6vV3qdkA1QqOGhdSfmAtu0iGEmPxobPru6",
    });
    map.addSource("provinces-label", {
        type: "vector",
        url: "https://v2k.vallarismaps.com/core/tiles/60c4515b1499452793d179a7?api_key=RWWcffYDhbnw2IV40S3FTqwsQJkeWg6vV3qdkA1QqOGhdSfmAtu0iGEmPxobPru6",
    });
    map.addSource("amphoe", {
        type: "vector",
        url: "https://v2k.vallarismaps.com/core/tiles/60c42abbf718be41ee8b64f7?api_key=RWWcffYDhbnw2IV40S3FTqwsQJkeWg6vV3qdkA1QqOGhdSfmAtu0iGEmPxobPru6",
    });
    var coverages = [];
    var provinceMatch: (string | number | string[])[] = [
        "match",
        ["get", "PROV_CODE"],
    ];
    provincesData["data"].forEach((row, index) => {
        //const coverage = row["total-1st-dose"] / row["population"]
        provinceMatch.push(row["id"], row['1st_dose_coverage']);
        if (row['1st_dose_coverage'] >= 0) coverages.push(row['1st_dose_coverage']);
    });
    const maxCoverage = Math.max(...coverages);
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
                2 / 100,
                "#fafafa",
                2.1 / 100,
                "#e6f7f1",
                maxCoverage * 0.3,
                "#b0cec3",
                maxCoverage * 0.5,
                "#7ba797",
                maxCoverage * 0.7,
                "#47816e",
                maxCoverage,
                "#005c46",
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
        id: "provinces-label",
        type: "symbol",
        source: "provinces-label",
        "source-layer": "60c4515b1499452793d179a7",
        minzoom: 6,
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
            "line-opacity": 0.6,
        },
    });
};

export default loader;
