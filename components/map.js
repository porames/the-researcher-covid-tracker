import React from 'react'
import mapboxgl from 'mapbox-gl'
import Head from 'next/head'

import provincesData from './gis/data/provinces-data-30days.json'
import amphoesData from './gis/data/amphoes-data-14days.json'
import _ from 'lodash'
import Graph from './provinceCurve'

import { Link, Element, Events, animateScroll as scroll, scrollSpy, scroller } from 'react-scroll'

class Map extends React.Component {
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
        this.map.flyTo({ center: [101.10, 13.12], zoom: 4.5 })
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
            this.map.addSource('cases', {
                type: 'vector',
                url: 'mapbox://townhall-th.7ozyo5pa'
            })
            var matchExpression = ['match', ['get', 'fid']]
            amphoesData.forEach((row) => {
                matchExpression.push(row['id'], row['caseCount'])
            })
            matchExpression.push(0)

            var provinceMatch = ['match', ['get', 'PROV_CODE']]
            provincesData.forEach((row) => {
                provinceMatch.push(String(row['id']), row['caseCount'])
            })
            provinceMatch.push(0)

            this.map.addLayer({
                'id': 'province-fills',
                'type': 'fill',
                'source': 'provinces',
                'source-layer': 'thmapprovinceswithcentroidsid',
                'layout': {},
                'paint': {
                    'fill-opacity': 0.6,
                    'fill-color': [
                        'interpolate',
                        ['linear'],
                        provinceMatch,
                        0,
                        '#fafafa',
                        10,
                        '#FFFA6C',
                        30,
                        '#FFB14D',
                        50,
                        '#FF682D',
                        100,
                        '#a2322c',
                        250,
                        '#460c39',
                        1000,
                        '#29010e'
                    ],
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
                id: 'cases-heat',
                'type': 'heatmap',
                'source': 'cases',
                'source-layer': 'amphoes-1z6vx7',
                paint: {
                    'heatmap-weight': ['interpolate', ['linear'], matchExpression, 0, 0, 30, 1],
                    'heatmap-intensity': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0,
                        1,
                        9,
                        3
                    ],
                    'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 2, 0.7, 13, 1],
                    'heatmap-radius': [
                        'interpolate',
                        ['linear'],
                        ['zoom'],
                        0,
                        2,
                        9,
                        25
                    ],

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
                'source': 'cases',
                'source-layer': 'amphoes-1z6vx7',
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
            this.map.on('click', 'province-fills', (e) => {
                const centroid = JSON.parse(e.features[0].properties['centroid'])
                this.map.flyTo({ center: centroid, zoom: 7 })
            })
            this.map.on('mousemove', 'province-fills', (e) => {
                if (e.features.length > 0) {
                    if (hoveredStateId) {

                        this.map.setFeatureState(
                            { source: 'provinces', sourceLayer: 'thmapprovinceswithcentroidsid', id: hoveredStateId },
                            { hover: false }
                        );
                    }
                    hoveredStateId = e.features[0].id;
                    this.map.setFeatureState(
                        { source: 'provinces', sourceLayer: 'thmapprovinceswithcentroidsid', id: hoveredStateId },
                        { hover: true }
                    )
                    if (!this.state.hoveredData) {
                        const data = _.find(provincesData, { id: Number(e.features[0].properties['PROV_CODE']) })
                        this.setState({ hoveredData: data })
                    }
                    else if (this.state.hoveredData['id'] !== Number(e.features[0].properties['PROV_CODE'])) {
                        const data = _.find(provincesData, { id: Number(e.features[0].properties['PROV_CODE']) })
                        this.setState({ hoveredData: data })
                    }

                }
            });
            this.map.on('mouseleave', 'province-fills', (e) => {
                if (hoveredStateId) {
                    this.map.setFeatureState(
                        { source: 'provinces', sourceLayer: 'thmapprovinceswithcentroidsid', id: hoveredStateId },
                        { hover: false }
                    );
                }
                if (this.state.hoveredData) {
                    //this.setState({ hoveredData: null })
                }
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
                <div ref={el => this.mapContainer = el} className='mapContainer'>
                    <div onClick={() => this.resetMap()} className='reset-button'>
                        <button className='btn-icon'><img src='/fullscreen_exit-black.svg' alt='reset zoom' /></button>
                    </div>

                    <div className='d-flex flex-column jusitfy-content-center' style={{ position: 'absolute', top: 16, left: 16, zIndex: 2 }}>
                        <div className='infoBox rounded shadow-sm'>
                            {
                                this.state.hoveredData &&
                                <div>
                                    <div>
                                        <span><b>จังหวัด{this.state.hoveredData.name}</b></span><br />
                                        <span>ผู้ติดเชื้อในรอบ 14 วัน <b>{this.state.hoveredData.caseCount} ราย</b></span>
                                    </div>
                                    {this.state.hoveredData.caseCount > 5 &&
                                        <div className='mt-3'>
                                            <Graph data={this.state.hoveredData.cases} caseCount={this.state.hoveredData.caseCount} />
                                            <div>
                                                <small className='text-muted'>เส้นแนวโน้มในช่วง 14 วัน</small>
                                            </div>
                                        </div>
                                    }
                                    {this.state.hoveredData.caseCount <= 5 &&
                                        <span className='text-muted'>ข้อมูลไม่เพียงพอ</span>

                                    }

                                </div>
                            }
                            {!this.state.hoveredData &&
                                <span className='text-muted'>เลือกจังหวัดเพื่อดูข้อมูลเพิ่มเติม</span>
                            }
                        </div>
                        <button onClick={() => this.skipMap()} className='mt-2 btn btn-link'><img className='mr-2' src='/expand_more-white.svg' />ดูสถานการณ์รายจังหวัด</button>
                    </div>
                </div>
            </div>
        )
    }
}

export default Map