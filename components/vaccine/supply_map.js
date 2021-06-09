import React from 'react'
import mapboxgl from 'mapbox-gl'
import Head from 'next/head'
import hospital_supply from '../gis/data/hospital-supply.json'
//import provincesData from '../gis/data/provincial-vaccination-data-dashboard.json'
import _ from 'lodash'

const InfoBox = (props) => (
    <div className='infoBox rounded shadow-sm' style={{ width: 250, fontSize: '90%' }}>
        {
            props.hoveredData &&
            <div>
                <div >
                    <div><b>{props.hoveredData['h_name']}</b></div>
                    <div className='row mt-2' >
                        <div className='col-7 pr-0'>
                            <div>วัคซีนที่ได้รับทั้งหมด</div>
                        </div>
                        <div className='col-5'>                            
                            {props.hoveredData['doses_delivered'].toLocaleString()}  โดส
                        </div>
                        <div className='col-7 pr-0'>
                            <div>วัคซีนคงเหลือ</div>
                        </div>
                        <div className='col-5 d-flex'>                            
                            {parseInt(props.hoveredData['percentage']*100)}%
                        </div>
                    </div>
                </div>
            </div>
        }
    </div>
)

class Map extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            lng: 100.5018,
            lat: 13.7563,
            zoom: 12,
            hoveredData: null,
            visible_features: [],
            infoBoxPosition: null
        };
        this.map
    }
    resetMap() {
        this.map.flyTo({ center: [101.10, 13.12], zoom: 4.5 })
    }
    generateTable(visible_features) {
        var features = []
        if (visible_features.length > 0) {
            visible_features.forEach((feature, index) => {
                const h_code = feature['properties']['h_code']
                const query = _.find(hospital_supply, { "h_code": h_code })
                features.push({
                    ...query,
                    coordinates: JSON.parse(feature['properties']['coordinates'])
                })
            })
        }
        features = _.orderBy(features, ['doses_delivered'], ['desc'])
        return features
    }
    componentDidMount() {
        mapboxgl.accessToken = process.env.NEXT_PUBLIC_mapboxKey
        this.map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'mapbox://styles/mapbox/dark-v10',
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
                promoteId: {'hospital_db': 'h_code'},
                url: 'mapbox://townhall-th.ckpow2myg018v27ozt62t3gtc-6v8ig'

            })
            var colorMatch = ['match', ['get', 'h_code']]
            var sizeMatch = ['match', ['get', 'h_code']]
            hospital_supply.forEach((row) => {
                colorMatch.push(row['h_code'], row['percentage'])
                sizeMatch.push(row['h_code'], row['doses_delivered'])
            })
            colorMatch.push(0)
            sizeMatch.push(0)

            this.map.addLayer({
                'id': 'hospital-point',
                'type': 'circle',
                'source': 'hospitals',
                'source-layer': 'hospital_db',
                'paint': {
                    'circle-radius': [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        2, [
                            'interpolate', ['linear'], sizeMatch,
                            100, 2,
                            1000, 4,
                            10000, 6,
                            100000, 8,
                            1000000, 10
                        ],
                        16,
                        [
                            'interpolate', ['linear'], sizeMatch,
                            100, 5,
                            1000, 10,
                            10000, 15,
                            100000, 20,
                            1000000, 25
                        ]
                    ],
                    'circle-color': [
                        'interpolate', ['linear'], colorMatch,
                        0, '#bdd5cd',
                        0.3, '#9dbbb2',
                        0.5, '#7ea297',
                        1, '#427165'
                    ],
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
                        '#fafafa'
                    ]
                }
            })
            var hoveredId = null
            this.map.on('render', () => {
                var visible_features = this.map.queryRenderedFeatures({
                    layers: ['hospital-point']
                })
                visible_features = this.generateTable(visible_features)
                this.setState({ visible_features: visible_features })
            })
            this.map.on('mousemove', 'hospital-point', (e) => {
                this.setState({ infoBoxPosition: e.point })
                
                if (e.features.length > 0) {
                    if (hoveredId) {
                        this.map.setFeatureState(
                            { source: 'hospitals', sourceLayer: 'hospital_db', id: hoveredId },
                            { hover: false }
                        )
                    }
                    hoveredId = e.features[0].properties['h_code']
                    this.map.setFeatureState(
                        { source: 'hospitals', sourceLayer: 'hospital_db', id: hoveredId },
                        { hover: true }
                    )

                    if (!this.state.hoveredData) {
                        const data = _.find(hospital_supply, { 'h_code': hoveredId })
                        this.setState({ hoveredData: data })
                    }
                    else if (this.state.hoveredData['h_code'] !== hoveredId) {
                        const data = _.find(hospital_supply, { 'h_code': hoveredId })
                        this.setState({ hoveredData: data })
                    }
                }

            })
            this.map.on('mouseleave', 'hospital-point', () => {
                if (this.state.hoveredData) {
                    this.setState({ hoveredData: null })
                }
                this.map.setFeatureState(
                    { source: 'hospitals', sourceLayer: 'hospital_db', id: hoveredId },
                    { hover: false }
                )
                hoveredId = null;
            })
            this.map.on('moveend', () => {
                var visible_features = this.map.queryRenderedFeatures({
                    layers: ['hospital-point']
                })
                visible_features = this.generateTable(visible_features)
                this.setState({ visible_features: visible_features })
            })
        })
    }
    render() {
        return (
            <div className='container-fluid w-100'>
                <Head>
                    <link href='https://api.mapbox.com/mapbox-gl-js/v2.0.1/mapbox-gl.css' rel='stylesheet' />
                </Head>

                <div className='row mt-4 flex-column-reverse flex-md-row'>
                    <div className='col-md-5 p-0 mt-md-0 mt-4' style={{ overflowY: 'auto', maxHeight: '90vh' }}>
                        <table className='table text-white credit table-grey'>
                            <thead>
                                <tr>
                                    <th style={{ width: '40%' }}>ที่ฉีดวัคซีน</th>
                                    <th>วัคซีนทั้งหมด</th>
                                    <th>คงเหลือ</th>
                                </tr>
                            </thead>
                            <tbody style={{ height: 300, overflow: 'auto' }}>
                                {this.state.visible_features.map((item, index) => {
                                    if (index < 20) {
                                        return (
                                            <tr>
                                                <td>{item.h_name}</td>
                                                <td>{item.doses_delivered.toLocaleString()}</td>
                                                <td>{parseInt(item.percentage * 100)}%</td>
                                            </tr>
                                        )
                                    }
                                })}
                            </tbody>
                        </table>

                    </div>
                    <div className='col-md-7 p-0'>
                        <div className='mapContainer'>
                            <div ref={el => this.mapContainer = el} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}></div>
                            <div onClick={() => this.resetMap()} className='reset-button'>
                                <button className='btn-icon'><img src='/fullscreen_exit-black.svg' alt='reset zoom' /></button>
                            </div>
                        </div>
                        {this.state.hoveredData &&
                            <div className='infoBox-container d-md-block d-none' style={{ top: this.state.infoBoxPosition.y + 20, left: this.state.infoBoxPosition.x }}>
                                <InfoBox hoveredData={this.state.hoveredData} />
                            </div>
                        }
                        {this.state.hoveredData &&
                            <div className='infoBox-container d-md-none d-block' >
                                <InfoBox hoveredData={this.state.hoveredData} />
                            </div>
                        }
                    </div>
                </div>

                <div className='container text-sec mt-3 credit' style={{ maxWidth: 810 }}>
                    ที่มาข้อมูล: ระบบติดตามการขนส่งวัคซีน กระทรวงสาธารณสุข
                </div>
            </div>
        )
    }
}

export default Map