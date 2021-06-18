import mapboxgl from "maplibre-gl";
import provincesData from "../gis/data/provincial-vaccination-data.json";
import hospital_supply from "../gis/data/hospital-vaccination-data.json";
import Graph from "../provinceCurve";
import React, { useEffect, useMemo, useState } from "react";
import BaseMap from "./BaseMap";
import { createCallbackWithLayer, MapWindow } from "./util";
import _ from "lodash";
import onLoadHandler from "./supply-load";
import moment from "moment";

const InfoBox = (props) => (
  <div
    className="infoBox rounded shadow-sm"
    style={{ width: 250, fontSize: "90%" }}
  >
    {props.hoveredData && (
      <div>
        <div>
          <div>
            <b>{props.hoveredData["h_name"]}</b>
          </div>
          <div className="row my-2">
            <div className="col-7 pr-0">
              <div>จำนวนวัคซีนที่ฉีด</div>
            </div>
            <div className="col-5">
              {props.hoveredData["total_doses"].toLocaleString()} โดส
            </div>
            <div className="col-5 d-flex"></div>
          </div>
        </div>
        <div>
          <span className="text-muted">
            ข้อมูลเมื่อ {moment(hospital_supply["update_at"]).fromNow()}
          </span>
        </div>
      </div>
    )}
  </div>
);

const CoverageMap = () => {
  const [hoveredData, setHoveredData] = useState<any>();
  const [visibleFeatures, setVisibleFeatures] = useState<any[]>([]);
  const sortedVisibleFeatures = useMemo(() => {
    const features = [];
    if (visibleFeatures.length > 0) {
      visibleFeatures.forEach((feature, index) => {
        const h_code = feature["properties"]["h_code"];
        const query = _.find(hospital_supply["data"], { h_code: h_code });
        features.push(query);
      });
    }
    return _.orderBy(features, ["total_doses"], ["desc"]);
  }, [visibleFeatures]);
  const [infoBoxPosition, setInfoBoxPosition] =
    useState<{ x: number; y: number }>();
  const [linkedWindow, setLinkedWindow] = useState<MapWindow>({
    hoveredStateId: 0,
  } as MapWindow);
  useEffect(() => {
    (window as MapWindow).hoveredStateId = 0;
    setLinkedWindow(window as MapWindow);
  }, []);
  const onClicks = [];
  const onMouseleaves = useMemo(
    () => [
      createCallbackWithLayer("hospital-point", (map, e) => {
        setHoveredData(null);
        map.setFeatureState(
          {
            source: "hospitals",
            sourceLayer: "60c61099f718be41ee8b7e16",
            id: linkedWindow.hoveredStateId,
          },
          { hover: false }
        );
        linkedWindow.hoveredStateId = null;
      }),
    ],
    []
  );
  const onMousemoves = useMemo(
    () => [
      createCallbackWithLayer("hospital-point", (map, e) => {
        setInfoBoxPosition(e.point);
        if (e.features.length <= 0) return;
        if (linkedWindow.hoveredStateId) {
          map.setFeatureState(
            {
              source: "hospitals",
              sourceLayer: "60c61099f718be41ee8b7e16",
              id: linkedWindow.hoveredStateId,
            },
            { hover: false }
          );
        }
        linkedWindow.hoveredStateId = e.features[0].properties["h_code"];
        map.setFeatureState(
          {
            source: "hospitals",
            sourceLayer: "60c61099f718be41ee8b7e16",
            id: linkedWindow.hoveredStateId,
          },
          { hover: true }
        );
        if (!hoveredData) {
          const data = _.find(hospital_supply["data"], {
            h_code: linkedWindow.hoveredStateId,
          });
          setHoveredData(data);
        } else if (hoveredData["h_code"] !== linkedWindow.hoveredStateId) {
          const data = _.find(hospital_supply["data"], {
            h_code: linkedWindow.hoveredStateId,
          });
          setHoveredData(data);
        }
      }),
    ],
    []
  );
  const onRenders = useMemo(
    () => [
      (map: mapboxgl.Map) => {
        setVisibleFeatures(
          map.queryRenderedFeatures(undefined, {
            layers: ["hospital-point"],
          })
        );
      },
    ],
    []
  );
  const onMoveends = useMemo(
    () => [
      (map: mapboxgl.Map) => {
        setVisibleFeatures(
          map.queryRenderedFeatures(undefined, {
            layers: ["hospital-point"],
          })
        );
      },
    ],
    []
  );
  return (
    <BaseMap
      onLoad={onLoadHandler}
      onMove={[]}
      onClick={onClicks}
      onMousemove={onMousemoves}
      onMouseleave={onMouseleaves}
      onRender={onRenders}
      onMoveend={onMoveends}
      credits={
        <div
          className="container text-sec mt-3 credit"
          style={{ maxWidth: 810 }}
        >
          ที่มาข้อมูล: ระบบติดตามการขนส่งวัคซีน มหาวิทยาลัยมหิดล
          (อัพเดทล่าสุดเมื่อ {moment(hospital_supply["update_at"]).format("LL")}
          )
        </div>
      }
      visibleFeatures={sortedVisibleFeatures}
      useTable
    >
      {hoveredData && (
        <div
          className="infoBox-container d-md-block d-none"
          style={{
            top: infoBoxPosition.y + 20,
            left: infoBoxPosition.x,
          }}
        >
          <InfoBox hoveredData={hoveredData} />
        </div>
      )}
      {hoveredData && (
        <div className="infoBox-container d-md-none d-block">
          <InfoBox hoveredData={hoveredData} />
        </div>
      )}
    </BaseMap>
  );
};

export default CoverageMap;
