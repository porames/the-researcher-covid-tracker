import React from 'react'
import mapboxgl from 'maplibre-gl'
import Head from 'next/head'
import hospital_supply from '../gis/data/hospital-vaccination-data.json'
import moment from 'moment'
import 'moment/locale/th'
import _ from 'lodash'

const InfoBox = (props) => (
    <div className='infoBox rounded shadow-sm' style={{ width: 250, fontSize: '90%' }}>
        {
            props.hoveredData &&
            <div>
                <div>
                    <div><b>{props.hoveredData['h_name']}</b></div>
                    <div className='row my-2' >
                        <div className='col-7 pr-0'>
                            <div>จำนวนวัคซีนที่ฉีด</div>
                        </div>
                        <div className='col-5'>
                            {props.hoveredData['total_doses'].toLocaleString()}  โดส
                        </div>
                        <div className='col-5 d-flex'>

                        </div>
                    </div>
                </div>
                <div>
                    <span className='text-muted'>ข้อมูลเมื่อ {moment(hospital_supply['update_at']).fromNow()}</span>
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
            infoBoxPosition: null,
            page: 1
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
                const query = _.find(hospital_supply['data'], { "h_code": h_code })
                features.push(query)
            })
        }
        features = _.orderBy(features, ['total_doses'], ['desc'])
        return features
    }
    componentDidMount() {
        this.map = new mapboxgl.Map({
            container: this.mapContainer,
            style: 'https://v2k.vallarismaps.com/core/api/1.0-beta/styles/60c430935b11251fea89e087?api_key=RWWcffYDhbnw2IV40S3FTqwsQJkeWg6vV3qdkA1QqOGhdSfmAtu0iGEmPxobPru6',
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
                promoteId: { '60c61099f718be41ee8b7e16': 'h_code' },
                url: 'https://v2k.vallarismaps.com/core/tiles/60c61099f718be41ee8b7e16?api_key=RWWcffYDhbnw2IV40S3FTqwsQJkeWg6vV3qdkA1QqOGhdSfmAtu0iGEmPxobPru6'

            })
            var colorMatch = ['match', ['get', 'h_code']]
            var sizeMatch = ['match', ['get', 'h_code']]

            hospital_supply['data'].forEach((row) => {
                sizeMatch.push(row['h_code'], row['total_doses'] !== null ? row['total_doses'] : 0)
            })
            colorMatch.push(0)
            sizeMatch.push(0)

            this.map.addLayer({
                'id': 'hospital-point',
                'type': 'circle',
                'source': 'hospitals',
                'source-layer': '60c61099f718be41ee8b7e16',
                'paint': {
                    'circle-radius': [
                        "interpolate",
                        ["linear"],
                        ["zoom"],
                        2, [
                            'interpolate', ['linear'], sizeMatch,
                            1000, 2,
                            10000, 4,
                            100000, 8,
                            1000000, 16,
                        ],
                        10,
                        [
                            'interpolate', ['linear'], sizeMatch,
                            1000, 5,
                            10000, 10,
                            100000, 20,
                            1000000, 40,
                        ]
                    ],
                    'circle-color': '#427165',
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
                this.setState({ visible_features: visible_features, page: 1 })
            })
            this.map.on('mousemove', 'hospital-point', (e) => {
                this.setState({ infoBoxPosition: e.point })

                if (e.features.length > 0) {
                    if (hoveredId) {
                        this.map.setFeatureState(
                            { source: 'hospitals', sourceLayer: '60c61099f718be41ee8b7e16', id: hoveredId },
                            { hover: false }
                        )
                    }
                    hoveredId = e.features[0].properties['h_code']
                    this.map.setFeatureState(
                        { source: 'hospitals', sourceLayer: '60c61099f718be41ee8b7e16', id: hoveredId },
                        { hover: true }
                    )

                    if (!this.state.hoveredData) {
                        const data = _.find(hospital_supply['data'], { 'h_code': hoveredId })
                        this.setState({ hoveredData: data })
                    }
                    else if (this.state.hoveredData['h_code'] !== hoveredId) {
                        const data = _.find(hospital_supply['data'], { 'h_code': hoveredId })
                        this.setState({ hoveredData: data })
                    }
                }

            })
            this.map.on('mouseleave', 'hospital-point', () => {
                if (this.state.hoveredData) {
                    this.setState({ hoveredData: null })
                }
                this.map.setFeatureState(
                    { source: 'hospitals', sourceLayer: '60c61099f718be41ee8b7e16', id: hoveredId },
                    { hover: false }
                )
                hoveredId = null;
            })
            this.map.on('moveend', () => {
                var visible_features = this.map.queryRenderedFeatures({
                    layers: ['hospital-point']
                })
                visible_features = this.generateTable(visible_features)
                this.setState({ visible_features: visible_features, page: 1 })
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
                        <div className='table-responsive'>
                            <table className='table text-white credit table-grey'>
                                <thead>
                                    <tr>
                                        <th style={{ width: '60%' }}>สถานที่ให้บริการวัคซีน</th>
                                        <th>จำนวนวัคซีนที่ฉีด (โดส)</th>
                                    </tr>
                                </thead>
                                <tbody style={{ maxHeight: 300, overflow: 'auto' }}>
                                    {this.state.visible_features.map((item, index) => {
                                        if (index < 20 * this.state.page) {
                                            return (
                                                <tr key={index}>
                                                    <td>{item.h_name}</td>
                                                    <td>{item.total_doses.toLocaleString()}</td>
                                                </tr>
                                            )
                                        }
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <div className='pb-2 px-2'>
                            {this.state.visible_features.length >= this.state.page*20 &&
                            <button onClick={() => this.setState({ page: this.state.page + 1 })} className='rounded table-toggle'>โหลดเพิ่ม</button>
                            }
                            
                        </div>
                    </div>
                    <div className='col-md-7 p-0'>
                        <div className='mapContainer'>
                            <div ref={el => this.mapContainer = el} style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0 }}></div>
                            <div onClick={() => this.resetMap()} className='reset-button'>
                                <button className='btn-icon bg-white'><img src='/fullscreen_exit-black.svg' alt='reset zoom' /></button>
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
                    ที่มาข้อมูล: ระบบติดตามการขนส่งวัคซีน มหาวิทยาลัยมหิดล (อัพเดทล่าสุดเมื่อ {moment(hospital_supply['update_at']).format('LL')})
                </div>
            </div>
        )
    }
}

export default Map