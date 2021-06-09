import React from 'react'
import mapboxgl from 'mapbox-gl'
import Head from 'next/head'
import { VaxCoverageLegend } from './mapLegends'
//import provincesData from '../gis/data/provincial-vaccination-data-dashboard.json'
import _ from 'lodash'


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
            style: 'mapbox://styles/mapbox/light-v10',
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
            console.log('Map Loaded')
            // Add a geojson point source.
            // Heatmap layers also work with a vector tile source.
            this.map.addSource('hospitals', {
                type: 'vector',
                url: 'mapbox://townhall-th.ckpow2myg018v27ozt62t3gtc-6v8ig'
            })
            this.map.addLayer({
                'id': 'hospital-location',
                'type': 'symbol',
                'source': 'hospitals',
                'source-layer': 'hospital_db',
                'minzoom': 5,
                'layout': {
                    'text-field': ['get', 'name'],
                    'text-variable-anchor': ['top', 'bottom', 'left', 'right'],
                    'text-justify': 'center',
                    'text-size': 12
                },
                'paint': {
                    "text-color": "#ffffff",
                    "text-halo-width": 0.8,
                    'text-halo-blur': 1,
                    'text-halo-color': '#424242',
                    'text-opacity': ['interpolate', ['linear'], ['zoom'], 7.8, 1],
                }
            })
        });
    }
    render() {
        return (
            <div>
                <Head>
                    <link href='https://api.mapbox.com/mapbox-gl-js/v2.0.1/mapbox-gl.css' rel='stylesheet' />
                </Head>
                <div className='container' style={{ maxWidth: 700 }}>
                    <h2 className='text-center mt-5'>แผนที่ความครอบคลุมวัคซีน</h2>
                </div>
                <div className='mapContainer'>
                    <div ref={el => this.mapContainer = el} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}></div>
                    <div onClick={() => this.resetMap()} className='reset-button'>
                        <button className='btn-icon'><img src='/fullscreen_exit-black.svg' alt='reset zoom' /></button>
                    </div>
                    

                </div>
                <div className='container text-sec mt-3 credit' style={{ maxWidth: 810 }}>
                    ที่มาข้อมูล: รายงานการฉีดวัคซีนประจำวันโดยกรมควบคุมโรค กระทรวงสาธารณสุข ข้อมูลรวบรวมและประมวลผลโดย <a href='https://github.com/djay/covidthailand'>djay/covidthailand</a>, สถิติประชากรศาสตร์ สำนักงานสถิติแห่งชาติ
                </div>
            </div>
        )
    }
}

export default Map