import mapboxgl from 'maplibre-gl';
import amphoesData from '../gis/data/amphoes-data-14days.json';
import Graph from '../provinceCurve';
import React, { useEffect, useMemo, useState } from 'react';
import BaseMap from './BaseMap';
import { createCallbackWithLayer, MapWindow } from './util';
import _ from 'lodash';
import onLoadHandler from './cases-load';

const CasesMap = () => {
    const [hoveredData, setHoveredData] = useState<any>();
    const [infoBoxPosition, setInfoBoxPosition] =
        useState<{ x: number; y: number }>();
    const [linkedWindow, setLinkedWindow] = useState<MapWindow>({
        hoveredStateId: 0
    } as MapWindow);
    useEffect(() => {
        (window as MapWindow).hoveredStateId = 0;
        setLinkedWindow(window as MapWindow);
    }, []);
    const onClicks = useMemo(
        () => [
            createCallbackWithLayer('cases-heat', (map: mapboxgl.Map, e) => {
                if (e.features[0]) {
                    var centroid_x = e.features[0].properties['centroid']
                        .split(':')[1]
                        .split(',')[0];
                    var centroid_y = e.features[0].properties['centroid']
                        .split(':')[1]
                        .split(',')[1]
                        .split(')')[0];
                    map.flyTo({ center: [centroid_x, centroid_y], zoom: 10 });
                }
            })
        ],
        []
    );
    const onMouseleaves = useMemo(
        () => [
            createCallbackWithLayer('province-fills', () =>
                setHoveredData(null)
            ),
            createCallbackWithLayer('cases-heat', (map, e) => {
                setHoveredData(null);
                if (linkedWindow.hoveredStateId) {
                    map.setFeatureState(
                        {
                            source: 'amphoes',
                            sourceLayer: '60c452f21499452793d179a8',
                            id: linkedWindow.hoveredStateId
                        },
                        { hover: false }
                    );
                }
                linkedWindow.hoveredStateId = null;
            })
        ],
        []
    );
    const onMousemoves = useMemo(
        () => [
            createCallbackWithLayer('cases-heat', (map, e) => {
                setInfoBoxPosition(e.point);
                if (e.features.length > 0) {
                    if (linkedWindow.hoveredStateId) {
                        map.setFeatureState(
                            {
                                source: 'amphoes',
                                sourceLayer: '60c452f21499452793d179a8',
                                id: linkedWindow.hoveredStateId
                            },
                            { hover: false }
                        );
                    }
                    linkedWindow.hoveredStateId = e.features[0].properties.fid_;
                    map.setFeatureState(
                        {
                            source: 'amphoes',
                            sourceLayer: '60c452f21499452793d179a8',
                            id: e.features[0].properties.fid_
                        },
                        { hover: true }
                    );

                    if (!hoveredData) {
                        const data = _.find(amphoesData, {
                            id: Number(e.features[0].properties['fid_'])
                        });
                        setHoveredData(data);
                    } else if (
                        hoveredData['id'] !==
                        Number(e.features[0].properties['fid_'])
                    ) {
                        const data = _.find(amphoesData, {
                            id: Number(e.features[0].properties['fid_'])
                        });
                        setHoveredData(data);
                    }
                }
            })
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
        >
            {hoveredData && (
                <div
                    className="infoBox-container d-md-block d-none"
                    style={{
                        top: infoBoxPosition.y + 15,
                        left: infoBoxPosition.x
                    }}
                >
                    <div className="infoBox rounded shadow-sm">
                        <span>
                            <b>
                                {hoveredData['province'] === 'กรุงเทพมหานคร'
                                    ? 'เขต'
                                    : 'อ.'}
                                {hoveredData['name']}, {hoveredData['province']}
                            </b>
                        </span>
                        <br />
                        <span>
                            ผู้ติดเชื้อในรอบ 14 วัน{' '}
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
                                {hoveredData['province'] === 'กรุงเทพมหานคร'
                                    ? 'เขต'
                                    : 'อ.'}
                                {hoveredData['name']}, {hoveredData['province']}
                            </b>
                        </span>
                        <br />
                        <span>
                            ผู้ติดเชื้อในรอบ 14 วัน{' '}
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
