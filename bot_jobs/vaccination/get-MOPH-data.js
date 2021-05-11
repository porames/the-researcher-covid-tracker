const geo = require('./th-census-data.json')

const axios = require('axios')
const csv = require('csv-parser')
const fs = require('fs').promises
async function getProvince(id) {
    const res = await axios.post('https://datastudio.google.com/batchedDataV2', {
        "dataRequest": [{
                "requestContext": {
                    "reportContext": {
                        "reportId": "731713b6-a3c4-4766-ab9d-a6502a4e7dd6",
                        "pageId": "31081302",
                        "mode": "VIEW",
                        "componentId": "cd-9j791occjc",
                        "displayType": ""
                    }
                },
                "datasetSpec": {
                    "dataset": [{
                        "datasourceId": "87373936-c980-4eaa-a92d-fdd6dda0b7ab",
                        "revisionNumber": 0,
                        "parameterOverrides": []
                    }],
                    "queryFields": [{
                            "name": "qt_vfw9cwccjc",
                            "datasetNs": "d0",
                            "tableNs": "t0",
                            "dataTransformation": {
                                "sourceFieldName": "_vaccinated_on_",
                                "transformationConfig": {
                                    "transformationType": 5
                                }
                            }
                        },
                        {
                            "name": "qt_znv9cwccjc",
                            "datasetNs": "d0",
                            "tableNs": "t0",
                            "dataTransformation": {
                                "sourceFieldName": "datastudio_record_count_system_field_id_98323387"
                            }
                        }
                    ],
                    "sortData": [{
                        "sortColumn": {
                            "name": "qt_vfw9cwccjc",
                            "datasetNs": "d0",
                            "tableNs": "t0",
                            "dataTransformation": {
                                "sourceFieldName": "_vaccinated_on_",
                                "transformationConfig": {
                                    "transformationType": 5
                                }
                            }
                        },
                        "sortDir": 0
                    }],
                    "includeRowsCount": true,
                    "paginateInfo": {
                        "startRow": 1,
                        "rowsCount": 100
                    },
                    "blendConfig": {
                        "blockDatasource": {
                            "datasourceBlock": {
                                "id": "block_ak4uvqpmjc",
                                "type": 1,
                                "inputBlockIds": [],
                                "outputBlockIds": [],
                                "fields": []
                            },
                            "blocks": [{
                                "id": "block_bk4uvqpmjc",
                                "type": 5,
                                "inputBlockIds": [],
                                "outputBlockIds": [],
                                "fields": [],
                                "queryBlockConfig": {
                                    "joinQueryConfig": {
                                        "joinKeys": [],
                                        "queries": [{
                                            "datasourceId": "87373936-c980-4eaa-a92d-fdd6dda0b7ab",
                                            "concepts": []
                                        }]
                                    }
                                }
                            }],
                            "delegatedAccessEnabled": true,
                            "isUnlocked": true,
                            "isCacheable": false
                        }
                    },
                    "filters": [{
                        "filterDefinition": {
                            "filterExpression": {
                                "include": true,
                                "conceptType": 0,
                                "concept": {
                                    "name": "qt_nl9g8kkdjc",
                                    "ns": "t0"
                                },
                                "queryTimeTransformation": {
                                    "dataTransformation": {
                                        "sourceFieldName": "_hospital_province_code_"
                                    }
                                },
                                "filterConditionType": "IN",
                                "stringValues": [
                                    `TH-${id}`
                                ]
                            }
                        },
                        "dataSubsetNs": {
                            "datasetNs": "d0",
                            "tableNs": "t0",
                            "contextNs": "c0"
                        },
                        "version": 3
                    }],
                    "features": [],
                    "dateRanges": [],
                    "contextNsCount": 1,
                    "dateRangeDimensions": [{
                        "name": "qt_dmh9o9edjc",
                        "datasetNs": "d0",
                        "tableNs": "t0",
                        "dataTransformation": {
                            "sourceFieldName": "_vaccinated_on_",
                            "transformationConfig": {
                                "transformationType": 5
                            }
                        }
                    }],
                    "calculatedField": [],
                    "needGeocoding": false,
                    "geoFieldMask": []
                },
                "useDataColumn": true
            },
            {
                "requestContext": {
                    "reportContext": {
                        "reportId": "731713b6-a3c4-4766-ab9d-a6502a4e7dd6",
                        "pageId": "31081302",
                        "mode": "VIEW",
                        "componentId": "cd-9j791occjc",
                        "displayType": ""
                    }
                },
                "datasetSpec": {
                    "dataset": [{
                        "datasourceId": "87373936-c980-4eaa-a92d-fdd6dda0b7ab",
                        "revisionNumber": 0,
                        "parameterOverrides": []
                    }],
                    "queryFields": [{
                            "name": "qt_wfw9cwccjc",
                            "datasetNs": "d0",
                            "tableNs": "t0",
                            "dataTransformation": {
                                "sourceFieldName": "_vaccine_name_"
                            }
                        },
                        {
                            "name": "qt_znv9cwccjc",
                            "datasetNs": "d0",
                            "tableNs": "t0",
                            "dataTransformation": {
                                "sourceFieldName": "datastudio_record_count_system_field_id_98323387"
                            }
                        }
                    ],
                    "sortData": [{
                        "sortColumn": {
                            "name": "qt_znv9cwccjc",
                            "datasetNs": "d0",
                            "tableNs": "t0",
                            "dataTransformation": {
                                "sourceFieldName": "_vaccine_id_",
                                "aggregation": 2
                            }
                        },
                        "sortDir": 1
                    }],
                    "includeRowsCount": true,
                    "paginateInfo": {
                        "startRow": 1,
                        "rowsCount": 10
                    },
                    "blendConfig": {
                        "blockDatasource": {
                            "datasourceBlock": {
                                "id": "block_ak4uvqpmjc",
                                "type": 1,
                                "inputBlockIds": [],
                                "outputBlockIds": [],
                                "fields": []
                            },
                            "blocks": [{
                                "id": "block_bk4uvqpmjc",
                                "type": 5,
                                "inputBlockIds": [],
                                "outputBlockIds": [],
                                "fields": [],
                                "queryBlockConfig": {
                                    "joinQueryConfig": {
                                        "joinKeys": [],
                                        "queries": [{
                                            "datasourceId": "87373936-c980-4eaa-a92d-fdd6dda0b7ab",
                                            "concepts": []
                                        }]
                                    }
                                }
                            }],
                            "delegatedAccessEnabled": true,
                            "isUnlocked": true,
                            "isCacheable": false
                        }
                    },
                    "filters": [{
                        "filterDefinition": {
                            "filterExpression": {
                                "include": true,
                                "conceptType": 0,
                                "concept": {
                                    "name": "qt_nl9g8kkdjc",
                                    "ns": "t0"
                                },
                                "queryTimeTransformation": {
                                    "dataTransformation": {
                                        "sourceFieldName": "_hospital_province_code_"
                                    }
                                },
                                "filterConditionType": "IN",
                                "stringValues": [
                                    "TH-70"
                                ]
                            }
                        },
                        "dataSubsetNs": {
                            "datasetNs": "d0",
                            "tableNs": "t0",
                            "contextNs": "c0"
                        },
                        "version": 3
                    }],
                    "features": [],
                    "dateRanges": [],
                    "contextNsCount": 1,
                    "dateRangeDimensions": [{
                        "name": "qt_dmh9o9edjc",
                        "datasetNs": "d0",
                        "tableNs": "t0",
                        "dataTransformation": {
                            "sourceFieldName": "_vaccinated_on_",
                            "transformationConfig": {
                                "transformationType": 5
                            }
                        }
                    }],
                    "calculatedField": [],
                    "needGeocoding": false,
                    "geoFieldMask": []
                },
                "useDataColumn": true
            }
        ]
    })
    const data = JSON.parse(res.data.substring(5))
    //console.log(data['default']['dataResponse'][0]['dataSubset'][0]['dataset']['tableDataset']['column'][0]['dateColumn']['values'])
    var dates = data['default']['dataResponse'][0]['dataSubset'][0]['dataset']['tableDataset']['column'][0]['dateColumn']['values']
    var doses = data['default']['dataResponse'][0]['dataSubset'][0]['dataset']['tableDataset']['column'][1]['longColumn']['values']
    doses = doses.map(x => Number(x))
    const administered = doses.reduce((a, b) => a + b, 0)
    var province = {
        'doses': doses,
        'dates': dates,
        'administered': administered
    }
    return province
}

(async () => {
    try {
        var db = []
        for (const i in geo) {
            if (geo[i]['PROV_CODE']) {
                var province = await getProvince(geo[i]['PROV_CODE'])
                province['name'] = geo[i]['province']
                province['id'] = geo[i]['PROV_CODE']
                province['population'] = Number(geo[i]['population'])
                province['coverage'] = (province['administered']/2) / geo[i]['population']
                console.log(i)
                db.push(province)
            }
        }
        await fs.writeFile('../../components/gis/data/provincial-vaccination-data.json', JSON.stringify(db), 'utf-8')
        console.log('done')
    } catch (e) {
        console.log(e)
    }
})();