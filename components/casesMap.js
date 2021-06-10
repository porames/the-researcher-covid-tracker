import React, { useState } from 'react'
import mapboxgl from 'mapbox-gl'
import Head from 'next/head'
import amphoesData from './gis/data/amphoes-data-14days.json'
import _ from 'lodash'


class CasesMap extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lng: 101.10,
            lat: 13.12,
            zoom: 4.5,
            hoveredData: null
        };
        this.map
    }
    resetMap() {
        this.map.flyTo({ center: [101.10, 13.12], zoom: 4 })
    }
    componentDidMount() {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_mapboxKey
        this.map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/townhall-th/ckjp7wsca4inq19pbfpm6leov',
            center: [this.state.lng, this.state.lat],
            zoom: this.state.zoom,
            maxBounds: [[83.271483, 4], [117, 22]],
            minZoom: 3,
        });
        this.map.scrollZoom.disable()
        this.map.dragRotate.disable()
        this.map.touchZoomRotate.disableRotation()
        this.map.addControl(new mapboxgl.NavigationControl({ showCompass: false, showZoom: true }))
        this.map.on('move', () => {
            this.setState({
                lng: this.map.getCenter().lng.toFixed(4),
                lat: this.map.getCenter().lat.toFixed(4),
                zoom: this.map.getZoom().toFixed(2)
            });
        });
        this.map.on('load', () => {
            // Add a geojson point source.
            // Heatmap layers also work with a vector tile source.
            this.map.addSource('provinces', {
                type: 'vector',
                url: 'mapbox://townhall-th.c5vzwe91'
            })
            this.map.addSource('provinces-label', {
                type: 'vector',
                url: 'mapbox://townhall-th.72khtg8y'
            })
            this.map.addSource('amphoes', {
                promoteId: {"th-map-amphoes-points-with-ce-8a2auc": "fid"},
                type: 'vector',
                url: 'mapbox://townhall-th.1fyjidjy'
            })
            var matchExpression = ['match', ['get', 'fid']]
            amphoesData.forEach((row) => {
                matchExpression.push(row['id'], row['caseCount'])
            })
            matchExpression.push(0)

            this.map.addLayer({
                'id': 'province-fills',
                'type': 'fill',
                'source': 'provinces',
                'source-layer': 'thmapprovinceswithcentroidsid',
                'layout': {},
                'paint': {
                    'fill-opacity': 0.5,
                    'fill-color': '#fafafa'
                }
            })
            this.map.addLayer({
                'id': 'provinces-outline',
                'type': 'line',
                'source': 'provinces',
                'source-layer': 'thmapprovinceswithcentroidsid',
                'paint': {
                    'line-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        '#212121',
                        'rgba(255,255,255,0.2)'
                    ],
                    'line-width': 1
                }
            });
            this.map.addLayer({
                'id': 'cases-heat',
                'type': 'circle',
                'source': 'amphoes',
                'source-layer': 'th-map-amphoes-points-with-ce-8a2auc',
                'paint': {
                    'circle-radius': [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        2, [
                            'interpolate', ['linear'], matchExpression,
                            1, 1,
                            10, 2,
                            100, 4,
                            1000, 8
                        ],
                        10,
                        [
                            'interpolate', ['linear'], matchExpression,
                            1, 1,
                            10, 4,
                            100, 16,
                            1000, 64
                        ]
                    ],
                    'circle-color': 'rgba(255,0,0,.2)',
                    "circle-stroke-width":
                        ['case',
                            ['boolean', ['feature-state', 'hover'], false],
                            1.5,
                            0.5
                        ],
                    'circle-stroke-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        '#000000',
                        'rgb(255,0,0)'
                    ]

                }
            })
            this.map.addLayer({
                'id': 'province-label',
                'type': 'symbol',
                'source': 'provinces-label',
                'source-layer': 'provinces_centroids-ac2kba',
                'minzoom': 5,
                'layout': {
                    'text-field': ['get', 'PROV_NAMT'],
                    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                    'text-justify': 'center',
                    'text-size': 12
                },
                'paint': {
                    "text-color": "#ffffff",
                    "text-halo-width": 0.8,
                    'text-halo-blur': 1,
                    'text-halo-color': '#424242',
                    'text-opacity': ['interpolate', ['linear'], ['zoom'], 7.8, 1, 8, 0],
                }
            })
            this.map.addLayer({
                'id': 'amphoe-label',
                'type': 'symbol',
                'source': 'amphoes',
                'source-layer': 'th-map-amphoes-points-with-ce-8a2auc',
                'minzoom': 8,
                'layout': {
                    'text-field': ['get', 'A_NAME_T'],
                    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                    'text-radial-offset': 1,
                    'text-justify': 'auto',
                    'text-size': 14,

                },
                'paint': {
                    "text-color": "#ffffff",
                    "text-halo-width": 0.8,
                    'text-halo-blur': 1,
                    'text-halo-color': '#424242'
                }
            })

            var hoveredStateId = null
            this.map.on('click', 'cases-heat', (e) => {
                //const centroid = JSON.parse(e.features[0].properties['centroid'])
                if(e.features[0]){
                    const centroid = JSON.parse(e.features[0].properties.centroid)
                    this.map.flyTo({ center: {
                        lat: centroid[1],
                        lng: centroid[0]
                    }, zoom: 10 })
                }
                
            })
            this.map.on('mouseleave', 'province-fills', (e) => {
                if (this.state.hoveredData) {
                    this.setState({ hoveredData: null })
                }
            })
            this.map.on('mousemove', 'cases-heat', (e) => {
                this.setState({ infoBoxPosition: e.point })
                if (e.features.length > 0) {
                    if (hoveredStateId) {
                        this.map.setFeatureState(
                            { source: 'amphoes', sourceLayer: 'th-map-amphoes-points-with-ce-8a2auc', id: hoveredStateId },
                            { hover: false }
                        )
                    }
                    hoveredStateId = e.features[0].properties.fid
                    this.map.setFeatureState(
                        { source: 'amphoes', sourceLayer: 'th-map-amphoes-points-with-ce-8a2auc', id: hoveredStateId },
                        { hover: true }
                    )

                    if (!this.state.hoveredData) {
                        const data = _.find(amphoesData, { id: Number(e.features[0].properties['fid']) })
                        this.setState({ hoveredData: data })
                    }
                    else if (this.state.hoveredData['id'] !== Number(e.features[0].properties['fid'])) {
                        const data = _.find(amphoesData, { id: Number(e.features[0].properties['fid']) })
                        this.setState({ hoveredData: data })
                    }
                }
            });
            this.map.on('mouseleave', 'cases-heat', (e) => {
                if (this.state.hoveredData) {
                    this.setState({ hoveredData: null })
                }
                this.map.setFeatureState(
                    { source: 'amphoes', sourceLayer: 'th-map-amphoes-points-with-ce-8a2auc', id: hoveredStateId },
                    { hover: false }
                )
                hoveredStateId = null;
            })
        });
    }
    skipMap() {
        scroller.scrollTo('skipMap', {
            smooth: true,
            duration: 400,
            offset: -100
        })
    }
    render() {
        return (
            <div>
                <Head>
                    <link href='https://api.mapbox.com/mapbox-gl-js/v2.0.1/mapbox-gl.css' rel='stylesheet' />
                </Head>
                <div className='mapContainer'>
                    <div ref={el => this.mapContainer = el} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}></div>
                    <div onClick={() => this.resetMap()} className='reset-button'>
                        <button className='btn-icon'><img src='/fullscreen_exit-black.svg' alt='reset zoom' /></button>
                    </div>
                    {this.state.hoveredData &&
                        <div className='infoBox-container d-md-block d-none' style={{ top: this.state.infoBoxPosition.y + 15, left: this.state.infoBoxPosition.x }}>
                            <div className='infoBox rounded shadow-sm'>
                                <span>
                                    <b>อ.{this.state.hoveredData['name']}, {this.state.hoveredData['province']}</b></span><br />
                                <span>ผู้ติดเชื้อในรอบ 14 วัน <b className='text-danger'>{this.state.hoveredData.caseCount.toLocaleString()} ราย</b></span>
                            </div>
                        </div>
                    }
                    {this.state.hoveredData &&
                        <div className='infoBox-container d-md-none d-block'>
                            <div className='infoBox rounded shadow-sm'>
                                <span>
                                    <b>อ.{this.state.hoveredData['name']}, {this.state.hoveredData['province']}</b></span><br />
                                <span>ผู้ติดเชื้อในรอบ 14 วัน <b className='text-danger'>{this.state.hoveredData.caseCount.toLocaleString()} ราย</b></span>
                            </div>
                        </div>
                    }
                </div>
            </div>
        )
    }
}

export default CasesMap