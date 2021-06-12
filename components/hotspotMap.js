
import mapboxgl from 'maplibre-gl'
import provincesData from './gis/data/provinces-data-14days.json'
import Graph from './provinceCurve'
import Head from 'next/head'
import React from 'react'
const HotspotInfoBox = (props) => (
    <div className='infoBox rounded shadow-sm'>   
    
        <div>
            <span><b>จังหวัด{props.hoveredData.name}</b></span><br />
            <span>ผู้ติดเชื้อในรอบ 14 วัน <b className='text-danger'>{props.hoveredData.caseCount.toLocaleString()} ราย</b></span>
        </div>
        {props.hoveredData.caseCount > 5 &&
            <div className='mt-3'>
                <Graph data={props.hoveredData.cases} caseCount={props.hoveredData.caseCount} />
                <div>
                    <small className='text-muted'>เส้นแนวโน้มในช่วง 14 วัน</small>
                </div>
            </div>
        }
        {props.hoveredData.caseCount <= 5 &&
            <span className='text-muted'>ข้อมูลไม่เพียงพอ</span>
        }
    </div>
)

export default class HotspotMap extends React.Component {
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
        mapboxgl.accessToken = "mapbox"
        this.map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'https://v2k.vallarismaps.com/core/api/1.0-beta/styles/60c50d5df718be41ee8b7785?api_key=RWWcffYDhbnw2IV40S3FTqwsQJkeWg6vV3qdkA1QqOGhdSfmAtu0iGEmPxobPru6',
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
                url: 'https://v2k.vallarismaps.com/core/tiles/60c4fbfcceacf1b5ea19ae9a?api_key=RWWcffYDhbnw2IV40S3FTqwsQJkeWg6vV3qdkA1QqOGhdSfmAtu0iGEmPxobPru6'
            })
            this.map.addSource('provinces-label', {
                type: 'vector',
                url: 'https://v2k.vallarismaps.com/core/tiles/60c4515b1499452793d179a7?api_key=RWWcffYDhbnw2IV40S3FTqwsQJkeWg6vV3qdkA1QqOGhdSfmAtu0iGEmPxobPru6'
            })
            this.map.addSource('cases', {
                type: 'vector',
                url: 'https://v2k.vallarismaps.com/core/tiles/60c452f21499452793d179a8?api_key=RWWcffYDhbnw2IV40S3FTqwsQJkeWg6vV3qdkA1QqOGhdSfmAtu0iGEmPxobPru6'
            })
            this.map.addSource('amphoe', {
                type: 'vector',
                url: 'https://v2k.vallarismaps.com/core/tiles/60c42abbf718be41ee8b64f7?api_key=RWWcffYDhbnw2IV40S3FTqwsQJkeWg6vV3qdkA1QqOGhdSfmAtu0iGEmPxobPru6'
            })

            var provinceMatch = ['match', ['get', 'PROV_CODE']]
            provincesData.forEach((row) => {
                provinceMatch.push(String(row['id']), row['cases-per-100k'])
            })
            provinceMatch.push(0)

            this.map.addLayer({
                'id': 'province-fills',
                'type': 'fill',
                'source': 'provinces',
                'source-layer': '60c4fbfcceacf1b5ea19ae9a',
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
                'source-layer': '60c4fbfcceacf1b5ea19ae9a',
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
                'id': 'amphoe-outline',
                'type': 'line',
                'source': 'amphoe',
                'source-layer': '60c42abbf718be41ee8b64f7',
                'paint': {
                    'line-color': [
                        'case',
                        ['boolean', ['feature-state', 'hover'], false],
                        '#212121',
                        'rgba(255,255,255,0.2)'
                    ],
                    'line-width': 0.5,
                    'line-opacity':0.5
                }
            });

            this.map.addLayer({
                'id': 'provinces-label',
                'type': 'symbol',
                'source': 'provinces-label',
                'source-layer': '60c4515b1499452793d179a7',
                'layout': {
                    'text-field': ['get', 'PROV_NAMT'],
                    'text-font': ['Kanit'],
                    'text-variable-anchor': [
                        'top',
                        'bottom',
                        'left',
                        'right'
                    ],
                    'text-justify': 'center',
                    'text-size': 12
                },
                'paint': {
                    'text-color': '#ffffff',
                    'text-halo-width': 0.8,
                    'text-halo-blur': 1,
                    'text-halo-color': '#424242',
                    'text-opacity': ['interpolate', ['linear'],
                        ['zoom'], 7.8, 1
                    ]
                }
            })
            this.map.addLayer({
                'id': 'amphoe-label',
                'type': 'symbol',
                'source': 'cases',
                'source-layer': '60c452f21499452793d179a8',
                'minzoom': 8,
                'layout': {
                    'text-field': ['get', 'A_NAME_T'],
                    "text-font": ["Kanit"],
                    "text-variable-anchor": [
                        "top",
                        "bottom",
                        "left",
                        "right"
                    ],
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
                var centroid_x = e.features[0].properties['centroid'].split(":")[1].split(",")[0]
                var centroid_y = e.features[0].properties['centroid'].split(":")[1].split(",")[1].split(")")[0]
                this.map.flyTo({ center: [centroid_x,centroid_y], zoom: 7 })
            })
            this.map.on('mouseleave', 'province-fills', (e) => {
                if (this.state.hoveredData) {
                    this.setState({ hoveredData: null })
                }
            })
            this.map.on('mousemove', 'province-fills', (e) => {
                this.setState({ infoBoxPosition: e.point })
                if (e.features.length > 0) {
                    if (hoveredStateId) {
                        this.map.setFeatureState(
                            { source: 'provinces', sourceLayer: '60c4fbfcceacf1b5ea19ae9a', id: hoveredStateId },
                            { hover: false }
                        );
                    }
                    hoveredStateId = e.features[0].id;
                    this.map.setFeatureState(
                        { source: 'provinces', sourceLayer: '60c4fbfcceacf1b5ea19ae9a', id: hoveredStateId },
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
                        { source: 'provinces', sourceLayer: '60c4fbfcceacf1b5ea19ae9a', id: hoveredStateId },
                        { hover: false }
                    );
                }
                if (this.state.hoveredData) {
                    //this.setState({ hoveredData: null })
                }
                hoveredStateId = null;
            })
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
                            <HotspotInfoBox hoveredData={this.state.hoveredData} />
                        </div>
                    }
                    {this.state.hoveredData &&
                        <div className='infoBox-container d-md-none d-block' >
                            <HotspotInfoBox hoveredData={this.state.hoveredData} />
                        </div>
                    }
                </div>
            </div>
        )
    }
}