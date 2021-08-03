import mapboxgl from "maplibre-gl";

import Graph from "../provinceCurve";
import React, { useEffect, useMemo, useState } from "react";
import BaseMap from "./BaseMap";
import { createCallbackWithLayer, MapWindow } from "./util";
import _ from "lodash";
import onLoadHandler from "./hotspot-load";

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
					index={props.index}
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

type HotSpotMapProps = {
	province_data: {
		"name": string,
		"cases": {
			[key: string]: number
		}[],
		"id": number,
		"caseCount": number,
		"cases-per-100k": number,
		"deaths": {
			[key: string]: number
		},
		"deathsCount": number
		"deaths-per-100k": number
	}[]
}

const HotspotMap = (props: HotSpotMapProps) => {
	const [hoveredData, setHoveredData] = useState<any>();
	const [infoBoxPosition, setInfoBoxPosition] =
		useState<{ x: number; y: number }>();
	const [linkedWindow, setLinkedWindow] = useState<MapWindow>({
		hoveredStateId: 0,
	} as MapWindow);
	const provincesData = props.province_data
	useEffect(() => {
		(window as MapWindow).hoveredStateId = 0;
		setLinkedWindow(window as MapWindow);
	}, []);
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
				if (linkedWindow.hoveredStateId) {
					map.setFeatureState(
						{
							source: "provinces",
							sourceLayer: "60c4fbfcceacf1b5ea19ae9a",
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
			createCallbackWithLayer("province-fills", (map, e) => {
				setInfoBoxPosition(e.point);
				if (e.features.length <= 0) return;
				if (linkedWindow.hoveredStateId) {
					map.setFeatureState(
						{
							source: "provinces",
							sourceLayer: "60c4fbfcceacf1b5ea19ae9a",
							id: linkedWindow.hoveredStateId,
						},
						{ hover: false }
					);
				}
				linkedWindow.hoveredStateId = e.features[0].id;
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
		[]
	);
	return (
		<BaseMap
			onLoad={(map) => onLoadHandler(map, provincesData)}
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
					<HotspotInfoBox index={1} hoveredData={hoveredData} />
				</div>
			)}
			{hoveredData && (
				<div className="infoBox-container d-md-none d-block">
					<HotspotInfoBox index={2} hoveredData={hoveredData} />
				</div>
			)}
		</BaseMap>
	);
};

export default HotspotMap;
