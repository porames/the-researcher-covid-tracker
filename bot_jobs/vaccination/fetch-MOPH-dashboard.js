const geo = require('../th-census-age-group.json')
const estimated_pop = require('../th-census-with-hidden-pop.json')
const hospital_db = require('./hospital_db.json')
const axios = require('axios')
const csv = require('csv-parser')
const fs = require('fs').promises
const _ = require('lodash')

async function getMetadata() {
    const res = await axios.post('https://datastudio.google.com/batchedDataV2?appVersion=20210506_00020034', {
        "dataRequest": [
            {
                "requestContext": {
                    "reportContext": {
                        "reportId": "731713b6-a3c4-4766-ab9d-a6502a4e7dd6",
                        "pageId": "28035045",
                        "mode": "VIEW",
                        "componentId": "cd-2ag9zl1cjc",
                        "displayType": "simple-table"
                    }
                },
                "datasetSpec": {
                    "dataset": [
                        {
                            "datasourceId": "50c2982f-fe23-4f68-bdb1-4261120c30c2",
                            "revisionNumber": 0,
                            "parameterOverrides": []
                        }
                    ],
                    "queryFields": [
                        {
                            "name": "qt_gwnsus1cjc",
                            "datasetNs": "d0",
                            "tableNs": "t0",
                            "dataTransformation": {
                                "sourceFieldName": "_title_"
                            }
                        },
                        {
                            "name": "qt_3fym1s1cjc",
                            "datasetNs": "d0",
                            "tableNs": "t0",
                            "dataTransformation": {
                                "sourceFieldName": "_last_updated_",
                                "transformationConfig": {
                                    "transformationType": 5
                                }
                            }
                        }
                    ],
                    "sortData": [
                        {
                            "sortColumn": {
                                "name": "qt_3fym1s1cjc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_last_updated_",
                                    "transformationConfig": {
                                        "transformationType": 5
                                    }
                                }
                            },
                            "sortDir": 0
                        }
                    ],
                    "includeRowsCount": true,
                    "paginateInfo": {
                        "startRow": 1,
                        "rowsCount": 100
                    },
                    "filters": [],
                    "features": [],
                    "dateRanges": [],
                    "contextNsCount": 1,
                    "calculatedField": [],
                    "needGeocoding": false,
                    "geoFieldMask": [],
                    "geoVertices": 100000
                },
                "useDataColumn": true
            }
        ]
    }
    )
    const data = JSON.parse(res.data.substring(5))
    const columns = data['dataResponse'][0]['dataSubset'][0]['dataset']['tableDataset']['column']
    const vaxIndex = columns[0]['stringColumn']['values'].indexOf('Vaccination')
    const hospitalIndex = columns[0]['stringColumn']['values'].indexOf('Hospital')
    const meta = {
        provincial_vaccination_update_at: columns[1]['dateColumn']['values'][vaxIndex],
        hospital_supply_update_at: columns[1]['dateColumn']['values'][hospitalIndex]
    }
    return meta
}

async function getHospital(update_at) {
    const res = await axios.post('https://datastudio.google.com/batchedDataV2?appVersion=20210506_00020034',
        //{ "dataRequest": [{ "requestContext": { "reportContext": { "reportId": "731713b6-a3c4-4766-ab9d-a6502a4e7dd6", "pageId": "31081301", "mode": "VIEW", "componentId": "cd-vipnb1bcjc", "displayType": "simple-table" } }, "datasetSpec": { "dataset": [{ "datasourceId": "05bbf5e6-7c84-45c4-9028-e8fe8de09357", "revisionNumber": 0, "parameterOverrides": [] }], "queryFields": [{ "name": "qt_wipnb1bcjc", "datasetNs": "d0", "tableNs": "t0", "dataTransformation": { "sourceFieldName": "_hospital_code_" } }, { "name": "qt_xipnb1bcjc", "datasetNs": "d0", "tableNs": "t0", "dataTransformation": { "sourceFieldName": "_hospital_name_" } }, { "name": "qt_7lf7mdidjc", "datasetNs": "d0", "tableNs": "t0", "dataTransformation": { "sourceFieldName": "_hospital_zone_" } }, { "name": "qt_k6rcrdidjc", "datasetNs": "d0", "tableNs": "t0", "dataTransformation": { "sourceFieldName": "_hospital_province_" } }, { "name": "qt_yipnb1bcjc", "datasetNs": "d0", "tableNs": "t0", "dataTransformation": { "sourceFieldName": "_quantity_", "aggregation": 6 } }, { "name": "qt_nca2m2bcjc", "datasetNs": "d0", "tableNs": "t0", "dataTransformation": { "sourceType": 1, "sourceFieldName": "adhoc_qt_nca2m2bcjc", "textFormula": "SUM(t0._quantity_) - SUM(t0._quantity_vaccinated_)", "frontendTextFormula": "SUM(t0._quantity_)-SUM(t0._quantity_vaccinated_)", "formulaOutputDataType": 1, "aggregation": 7 } }], "sortData": [{ "sortColumn": { "name": "qt_nca2m2bcjc", "datasetNs": "d0", "tableNs": "t0", "dataTransformation": { "sourceType": 1, "sourceFieldName": "adhoc_qt_nca2m2bcjc", "textFormula": "SUM(t0._quantity_) - SUM(t0._quantity_vaccinated_)", "frontendTextFormula": "SUM(t0._quantity_)-SUM(t0._quantity_vaccinated_)", "formulaOutputDataType": 1, "aggregation": 7 } }, "sortDir": 1 }], "includeRowsCount": true, "paginateInfo": { "startRow": 1, "rowsCount": 500 }, "blendConfig": { "blockDatasource": { "datasourceBlock": { "id": "block_l17h6ouhkc", "type": 1, "inputBlockIds": [], "outputBlockIds": [], "fields": [] }, "blocks": [{ "id": "block_m17h6ouhkc", "type": 5, "inputBlockIds": [], "outputBlockIds": [], "fields": [], "queryBlockConfig": { "joinQueryConfig": { "joinKeys": [], "queries": [{ "datasourceId": "05bbf5e6-7c84-45c4-9028-e8fe8de09357", "concepts": [] }] } } }], "delegatedAccessEnabled": true, "isUnlocked": true, "isCacheable": false } }, "filters": [{ "filterDefinition": { "filterExpression": { "include": false, "conceptType": 0, "concept": { "ns": "t0", "name": "qt_kh0bqwzbjc" }, "filterConditionType": "NU", "stringValues": ["20210501150000"], "numberValues": [], "queryTimeTransformation": { "dataTransformation": { "sourceFieldName": "_arrive_at_hospital_" } } } }, "dataSubsetNs": { "datasetNs": "d0", "tableNs": "t0", "contextNs": "c0" }, "version": 3 }, { "filterDefinition": { "or": { "filterDefinitions": [{ "filterExpression": { "include": true, "conceptType": 0, "concept": { "ns": "t0", "name": "qt_d5ctq5hdjc" }, "filterConditionType": "GT", "stringValues": [], "numberValues": [0], "queryTimeTransformation": { "dataTransformation": { "sourceFieldName": "quantity_available" } } } }, { "filterExpression": { "include": true, "conceptType": 0, "concept": { "ns": "t0", "name": "qt_z3xgq9hdjc" }, "filterConditionType": "NU", "stringValues": [], "numberValues": [], "queryTimeTransformation": { "dataTransformation": { "sourceFieldName": "quantity_available" } } } }] } }, "dataSubsetNs": { "datasetNs": "d0", "tableNs": "t0", "contextNs": "c0" }, "version": 3 }, { "filterDefinition": { "filterExpression": { "include": false, "conceptType": 0, "concept": { "ns": "t0", "name": "qt_lolah1gcjc" }, "filterConditionType": "NU", "stringValues": [""], "numberValues": [], "queryTimeTransformation": { "dataTransformation": { "sourceFieldName": "_hospital_name_" } } } }, "dataSubsetNs": { "datasetNs": "d0", "tableNs": "t0", "contextNs": "c0" }, "version": 3 }], "features": [], "dateRanges": [], "contextNsCount": 1, "calculatedField": [{ "calculatedFieldId": "adhoc_qt_nca2m2bcjc", "ns": "t0", "textFormula": "SUM(t0._quantity_) - SUM(t0._quantity_vaccinated_)", "dataType": 0 }], "needGeocoding": false, "geoFieldMask": [], "geoVertices": 100000 }, "useDataColumn": true }] }
        {
            "dataRequest": [
                {
                    "requestContext": {
                        "reportContext": {
                            "reportId": "731713b6-a3c4-4766-ab9d-a6502a4e7dd6",
                            "pageId": "31081301",
                            "mode": "VIEW",
                            "componentId": "cd-vipnb1bcjc",
                            "displayType": "simple-table"
                        }
                    },
                    "datasetSpec": {
                        "dataset": [
                            {
                                "datasourceId": "05bbf5e6-7c84-45c4-9028-e8fe8de09357",
                                "revisionNumber": 0,
                                "parameterOverrides": []
                            }
                        ],
                        "queryFields": [
                            {
                                "name": "qt_wipnb1bcjc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_hospital_code_"
                                }
                            },
                            {
                                "name": "qt_xipnb1bcjc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_hospital_name_"
                                }
                            },
                            {
                                "name": "qt_7lf7mdidjc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_hospital_zone_"
                                }
                            },
                            {
                                "name": "qt_k6rcrdidjc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_hospital_province_"
                                }
                            },
                            {
                                "name": "qt_yipnb1bcjc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_quantity_",
                                    "aggregation": 6
                                }
                            },
                            {
                                "name": "qt_nca2m2bcjc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceType": 1,
                                    "sourceFieldName": "qt_nca2m2bcjc",
                                    "textFormula": "SUM(t0._quantity_) - SUM(t0._quantity_vaccinated_)",
                                    "frontendTextFormula": "SUM(t0._quantity_)-SUM(t0._quantity_vaccinated_)",
                                    "formulaOutputDataType": 1,
                                    "aggregation": 7
                                }
                            }
                        ],
                        "sortData": [
                            {
                                "sortColumn": {
                                    "name": "qt_yipnb1bcjc",
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "dataTransformation": {
                                        "sourceFieldName": "_quantity_",
                                        "aggregation": 6
                                    }
                                },
                                "sortDir": 1
                            }
                        ],
                        "includeRowsCount": true,
                        "paginateInfo": {
                            "startRow": 1,
                            "rowsCount": 500
                        },
                        "filters": [
                            {
                                "filterDefinition": {
                                    "filterExpression": {
                                        "include": false,
                                        "conceptType": 0,
                                        "concept": {
                                            "ns": "t0",
                                            "name": "qt_kh0bqwzbjc"
                                        },
                                        "filterConditionType": "NU",
                                        "stringValues": [
                                            "20210501150000"
                                        ],
                                        "numberValues": [],
                                        "queryTimeTransformation": {
                                            "dataTransformation": {
                                                "sourceFieldName": "_arrive_at_hospital_"
                                            }
                                        }
                                    }
                                },
                                "dataSubsetNs": {
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "contextNs": "c0"
                                },
                                "version": 3
                            },
                            {
                                "filterDefinition": {
                                    "or": {
                                        "filterDefinitions": [
                                            {
                                                "filterExpression": {
                                                    "include": true,
                                                    "conceptType": 0,
                                                    "concept": {
                                                        "ns": "t0",
                                                        "name": "qt_d5ctq5hdjc"
                                                    },
                                                    "filterConditionType": "GT",
                                                    "stringValues": [],
                                                    "numberValues": [
                                                        0
                                                    ],
                                                    "queryTimeTransformation": {
                                                        "dataTransformation": {
                                                            "sourceFieldName": "quantity_available"
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                "filterExpression": {
                                                    "include": true,
                                                    "conceptType": 0,
                                                    "concept": {
                                                        "ns": "t0",
                                                        "name": "qt_z3xgq9hdjc"
                                                    },
                                                    "filterConditionType": "NU",
                                                    "stringValues": [],
                                                    "numberValues": [],
                                                    "queryTimeTransformation": {
                                                        "dataTransformation": {
                                                            "sourceFieldName": "quantity_available"
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                },
                                "dataSubsetNs": {
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "contextNs": "c0"
                                },
                                "version": 3
                            },
                            {
                                "filterDefinition": {
                                    "filterExpression": {
                                        "include": false,
                                        "conceptType": 0,
                                        "concept": {
                                            "ns": "t0",
                                            "name": "qt_lolah1gcjc"
                                        },
                                        "filterConditionType": "NU",
                                        "stringValues": [
                                            ""
                                        ],
                                        "numberValues": [],
                                        "queryTimeTransformation": {
                                            "dataTransformation": {
                                                "sourceFieldName": "_hospital_name_"
                                            }
                                        }
                                    }
                                },
                                "dataSubsetNs": {
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "contextNs": "c0"
                                },
                                "version": 3
                            }
                        ],
                        "features": [],
                        "dateRanges": [],
                        "contextNsCount": 1,
                        "calculatedField": [],
                        "needGeocoding": false,
                        "geoFieldMask": [],
                        "geoVertices": 100000
                    },
                    "useDataColumn": true
                }
            ]
        }
    )
    const data = JSON.parse(res.data.substring(5))
    console.log(data)
    const constructTable = data['dataResponse'][0]['dataSubset'][0]['dataset']
    const hCodes = constructTable['tableDataset']['column'][0]['stringColumn']['values']
    const hNames = constructTable['tableDataset']['column'][1]['stringColumn']['values']
    const supplies = constructTable['tableDataset']['column'][4]['doubleColumn']['values']
    const nullIndex = constructTable['tableDataset']['column'][5]['nullIndex']
    const doses_remaining = constructTable['tableDataset']['column'][5]['doubleColumn']['values']
    for (const i in nullIndex) {
        doses_remaining[nullIndex[i]] = null
    }
    var hospital_supply = {
        'update_at': update_at,
        'data': []
    }
    console.log('building hospital supply data in JSON')
    for (const i in hCodes) {
        const hospital = {
            "h_code": String(hCodes[i]),
            "h_name": String(hNames[i]),
            "doses_delivered": Number(supplies[i]),
            "doses_remaining": Number(doses_remaining[i]),
            "percentage": Number(doses_remaining[i]) / Number(supplies[i])
        }
        hospital_supply['data'].push(hospital)
    }

    await fs.writeFile('../../components/gis/data/hospital-supply.json', JSON.stringify(hospital_supply), 'utf-8')
    return true
}

async function getByGroup(provinceName) {
    const res = await axios.post('https://datastudio.google.com/batchedDataV2?appVersion=20210506_00020034',
        {
            "dataRequest": [
                {
                    "requestContext": {
                        "reportContext": {
                            "reportId": "731713b6-a3c4-4766-ab9d-a6502a4e7dd6",
                            "pageId": "33037739",
                            "mode": "VIEW",
                            "componentId": "cd-gne2cc9kkc",
                            "displayType": "simple-barchart"
                        }
                    },
                    "datasetSpec": {
                        "dataset": [
                            {
                                "datasourceId": "be20cc44-8f07-40e9-a197-6803fe40ce87",
                                "revisionNumber": 0,
                                "parameterOverrides": []
                            }
                        ],
                        "queryFields": [
                            {
                                "name": "qt_cems1c9kkc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_person_type_"
                                }
                            },
                            {
                                "name": "qt_dmls1c9kkc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "datastudio_record_count_system_field_id_98323387"
                                }
                            }
                        ],
                        "sortData": [
                            {
                                "sortColumn": {
                                    "name": "qt_cems1c9kkc",
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "dataTransformation": {
                                        "sourceFieldName": "_person_type_"
                                    }
                                },
                                "sortDir": 1
                            }
                        ],
                        "includeRowsCount": true,
                        "paginateInfo": {
                            "startRow": 1,
                            "rowsCount": 10
                        },
                        "blendConfig": {
                            "blockDatasource": {
                                "datasourceBlock": {
                                    "id": "block_axzew0fnkc",
                                    "type": 1,
                                    "inputBlockIds": [],
                                    "outputBlockIds": [],
                                    "fields": []
                                },
                                "blocks": [
                                    {
                                        "id": "block_bxzew0fnkc",
                                        "type": 5,
                                        "inputBlockIds": [],
                                        "outputBlockIds": [],
                                        "fields": [],
                                        "queryBlockConfig": {
                                            "joinQueryConfig": {
                                                "joinKeys": [],
                                                "queries": [
                                                    {
                                                        "datasourceId": "be20cc44-8f07-40e9-a197-6803fe40ce87",
                                                        "concepts": []
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                ],
                                "delegatedAccessEnabled": true,
                                "isUnlocked": true,
                                "isCacheable": false
                            }
                        },
                        "filters": [
                            {
                                "filterDefinition": {
                                    "and": {
                                        "filterDefinitions": [
                                            {
                                                "filterExpression": {
                                                    "include": false,
                                                    "conceptType": 0,
                                                    "concept": {
                                                        "ns": "t0",
                                                        "name": "qt_wy865fdcjc"
                                                    },
                                                    "filterConditionType": "NU",
                                                    "stringValues": [
                                                        ""
                                                    ],
                                                    "numberValues": [],
                                                    "queryTimeTransformation": {
                                                        "dataTransformation": {
                                                            "sourceFieldName": "_person_type_"
                                                        }
                                                    }
                                                }
                                            },
                                            {
                                                "filterExpression": {
                                                    "include": false,
                                                    "conceptType": 0,
                                                    "concept": {
                                                        "ns": "t0",
                                                        "name": "qt_4lkomgdcjc"
                                                    },
                                                    "filterConditionType": "EQ",
                                                    "stringValues": [
                                                        ""
                                                    ],
                                                    "numberValues": [],
                                                    "queryTimeTransformation": {
                                                        "dataTransformation": {
                                                            "sourceFieldName": "_person_type_"
                                                        }
                                                    }
                                                }
                                            }
                                        ]
                                    }
                                },
                                "dataSubsetNs": {
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "contextNs": "c0"
                                },
                                "version": 3
                            },
                            {
                                "filterDefinition": {
                                    "filterExpression": {
                                        "include": true,
                                        "conceptType": 0,
                                        "concept": {
                                            "ns": "t0",
                                            "name": "qt_kraj088kkc"
                                        },
                                        "filterConditionType": "IN",
                                        "stringValues": [
                                            "Sinovac Life Sciences",
                                            "AstraZeneca"
                                        ],
                                        "numberValues": [],
                                        "queryTimeTransformation": {
                                            "dataTransformation": {
                                                "sourceFieldName": "_manuf_name_"
                                            }
                                        }
                                    }
                                },
                                "dataSubsetNs": {
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "contextNs": "c0"
                                },
                                "version": 3
                            },
                            {
                                "filterDefinition": {
                                    "filterExpression": {
                                        "include": true,
                                        "conceptType": 0,
                                        "concept": {
                                            "name": "qt_tf5sjc9kkc",
                                            "ns": "t0"
                                        },
                                        "queryTimeTransformation": {
                                            "dataTransformation": {
                                                "sourceFieldName": "_hospital_province_"
                                            },
                                            "displayTransformation": {
                                                "displayName": "Province"
                                            }
                                        },
                                        "filterConditionType": "IN",
                                        "stringValues": [
                                            provinceName
                                        ]
                                    }
                                },
                                "dataSubsetNs": {
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "contextNs": "c0"
                                },
                                "version": 3
                            }
                        ],
                        "features": [],
                        "dateRanges": [],
                        "contextNsCount": 1,
                        "dateRangeDimensions": [
                            {
                                "name": "qt_sems1c9kkc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_vaccinated_on_"
                                }
                            }
                        ],
                        "calculatedField": [],
                        "needGeocoding": false,
                        "geoFieldMask": [],
                        "geoVertices": 100000
                    },
                    "useDataColumn": true
                }
            ]
        }
    )
    const data = JSON.parse(res.data.substring(5))
    return Number(data.dataResponse[0].dataSubset[0].dataset.tableDataset.column[1].longColumn.values[3])
}

async function getProvince(provinceName) {
    const res = await axios.post('https://datastudio.google.com/batchedDataV2?appVersion=20210506_00020034',
        {
            "dataRequest": [
                {
                    "requestContext": {
                        "reportContext": {
                            "reportId": "731713b6-a3c4-4766-ab9d-a6502a4e7dd6",
                            "pageId": "33037739",
                            "mode": "VIEW",
                            "componentId": "cd-jnnv3b9kkc",
                            "displayType": "dimension-filter"
                        }
                    },
                    "datasetSpec": {
                        "dataset": [
                            {
                                "datasourceId": "be20cc44-8f07-40e9-a197-6803fe40ce87",
                                "revisionNumber": 0,
                                "parameterOverrides": []
                            }
                        ],
                        "queryFields": [
                            {
                                "name": "qt_5q0sjc9kkc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_manuf_name_"
                                }
                            },
                            {
                                "name": "qt_e7ysjc9kkc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "datastudio_record_count_system_field_id_98323387"
                                }
                            }
                        ],
                        "sortData": [
                            {
                                "sortColumn": {
                                    "name": "qt_e7ysjc9kkc",
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "dataTransformation": {
                                        "sourceFieldName": "datastudio_record_count_system_field_id_98323387"
                                    }
                                },
                                "sortDir": 1
                            }
                        ],
                        "includeRowsCount": true,
                        "paginateInfo": {
                            "startRow": 1,
                            "rowsCount": 5001
                        },
                        "blendConfig": {
                            "blockDatasource": {
                                "datasourceBlock": {
                                    "id": "block_abfkipfnkc",
                                    "type": 1,
                                    "inputBlockIds": [],
                                    "outputBlockIds": [],
                                    "fields": []
                                },
                                "blocks": [
                                    {
                                        "id": "block_bbfkipfnkc",
                                        "type": 5,
                                        "inputBlockIds": [],
                                        "outputBlockIds": [],
                                        "fields": [],
                                        "queryBlockConfig": {
                                            "joinQueryConfig": {
                                                "joinKeys": [],
                                                "queries": [
                                                    {
                                                        "datasourceId": "be20cc44-8f07-40e9-a197-6803fe40ce87",
                                                        "concepts": []
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                ],
                                "delegatedAccessEnabled": true,
                                "isUnlocked": true,
                                "isCacheable": false
                            }
                        },
                        "filters": [
                            {
                                "filterDefinition": {
                                    "filterExpression": {
                                        "include": true,
                                        "conceptType": 0,
                                        "concept": {
                                            "ns": "t0",
                                            "name": "qt_kraj088kkc"
                                        },
                                        "filterConditionType": "IN",
                                        "stringValues": [
                                            "Sinovac Life Sciences",
                                            "AstraZeneca"
                                        ],
                                        "numberValues": [],
                                        "queryTimeTransformation": {
                                            "dataTransformation": {
                                                "sourceFieldName": "_manuf_name_"
                                            }
                                        }
                                    }
                                },
                                "dataSubsetNs": {
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "contextNs": "c0"
                                },
                                "version": 3
                            },
                            {
                                "filterDefinition": {
                                    "filterExpression": {
                                        "include": true,
                                        "conceptType": 0,
                                        "concept": {
                                            "name": "qt_tf5sjc9kkc",
                                            "ns": "t0"
                                        },
                                        "queryTimeTransformation": {
                                            "dataTransformation": {
                                                "sourceFieldName": "_hospital_province_"
                                            },
                                            "displayTransformation": {
                                                "displayName": "Province"
                                            }
                                        },
                                        "filterConditionType": "IN",
                                        "stringValues": [
                                            provinceName
                                        ]
                                    }
                                },
                                "dataSubsetNs": {
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "contextNs": "c0"
                                },
                                "version": 3
                            }
                        ],
                        "features": [],
                        "dateRanges": [],
                        "contextNsCount": 1,
                        "dateRangeDimensions": [
                            {
                                "name": "qt_dj1sjc9kkc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_vaccinated_on_"
                                }
                            }
                        ],
                        "calculatedField": [],
                        "needGeocoding": false,
                        "geoFieldMask": [],
                        "geoVertices": 100000
                    },
                    "useDataColumn": true
                },
                {
                    "requestContext": {
                        "reportContext": {
                            "reportId": "731713b6-a3c4-4766-ab9d-a6502a4e7dd6",
                            "pageId": "33037739",
                            "mode": "VIEW",
                            "componentId": "cd-c2rf6b9kkc",
                            "displayType": "dimension-filter"
                        }
                    },
                    "datasetSpec": {
                        "dataset": [
                            {
                                "datasourceId": "be20cc44-8f07-40e9-a197-6803fe40ce87",
                                "revisionNumber": 0,
                                "parameterOverrides": []
                            }
                        ],
                        "queryFields": [
                            {
                                "name": "qt_h32sjc9kkc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_hospital_zone_",
                                    "aggregation": 0
                                }
                            },
                            {
                                "name": "qt_a32sjc9kkc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "datastudio_record_count_system_field_id_98323387"
                                }
                            }
                        ],
                        "sortData": [
                            {
                                "sortColumn": {
                                    "name": "qt_a32sjc9kkc",
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "dataTransformation": {
                                        "sourceFieldName": "datastudio_record_count_system_field_id_98323387"
                                    }
                                },
                                "sortDir": 1
                            }
                        ],
                        "includeRowsCount": true,
                        "paginateInfo": {
                            "startRow": 1,
                            "rowsCount": 5001
                        },
                        "blendConfig": {
                            "blockDatasource": {
                                "datasourceBlock": {
                                    "id": "block_4mhkipfnkc",
                                    "type": 1,
                                    "inputBlockIds": [],
                                    "outputBlockIds": [],
                                    "fields": []
                                },
                                "blocks": [
                                    {
                                        "id": "block_5mhkipfnkc",
                                        "type": 5,
                                        "inputBlockIds": [],
                                        "outputBlockIds": [],
                                        "fields": [],
                                        "queryBlockConfig": {
                                            "joinQueryConfig": {
                                                "joinKeys": [],
                                                "queries": [
                                                    {
                                                        "datasourceId": "be20cc44-8f07-40e9-a197-6803fe40ce87",
                                                        "concepts": []
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                ],
                                "delegatedAccessEnabled": true,
                                "isUnlocked": true,
                                "isCacheable": false
                            }
                        },
                        "filters": [
                            {
                                "filterDefinition": {
                                    "filterExpression": {
                                        "include": true,
                                        "conceptType": 0,
                                        "concept": {
                                            "ns": "t0",
                                            "name": "qt_kraj088kkc"
                                        },
                                        "filterConditionType": "IN",
                                        "stringValues": [
                                            "Sinovac Life Sciences",
                                            "AstraZeneca"
                                        ],
                                        "numberValues": [],
                                        "queryTimeTransformation": {
                                            "dataTransformation": {
                                                "sourceFieldName": "_manuf_name_"
                                            }
                                        }
                                    }
                                },
                                "dataSubsetNs": {
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "contextNs": "c0"
                                },
                                "version": 3
                            },
                            {
                                "filterDefinition": {
                                    "filterExpression": {
                                        "include": true,
                                        "conceptType": 0,
                                        "concept": {
                                            "name": "qt_tf5sjc9kkc",
                                            "ns": "t0"
                                        },
                                        "queryTimeTransformation": {
                                            "dataTransformation": {
                                                "sourceFieldName": "_hospital_province_"
                                            },
                                            "displayTransformation": {
                                                "displayName": "Province"
                                            }
                                        },
                                        "filterConditionType": "IN",
                                        "stringValues": [
                                            provinceName
                                        ]
                                    }
                                },
                                "dataSubsetNs": {
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "contextNs": "c0"
                                },
                                "version": 3
                            }
                        ],
                        "features": [],
                        "dateRanges": [],
                        "contextNsCount": 1,
                        "dateRangeDimensions": [
                            {
                                "name": "qt_pv3sjc9kkc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_vaccinated_on_"
                                }
                            }
                        ],
                        "calculatedField": [],
                        "needGeocoding": false,
                        "geoFieldMask": [],
                        "geoVertices": 100000
                    },
                    "useDataColumn": true
                },
                {
                    "requestContext": {
                        "reportContext": {
                            "reportId": "731713b6-a3c4-4766-ab9d-a6502a4e7dd6",
                            "pageId": "33037739",
                            "mode": "VIEW",
                            "componentId": "cd-cusf6b9kkc",
                            "displayType": "dimension-filter"
                        }
                    },
                    "datasetSpec": {
                        "dataset": [
                            {
                                "datasourceId": "be20cc44-8f07-40e9-a197-6803fe40ce87",
                                "revisionNumber": 0,
                                "parameterOverrides": []
                            }
                        ],
                        "queryFields": [
                            {
                                "name": "qt_5r7sjc9kkc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_hospital_name_"
                                }
                            },
                            {
                                "name": "qt_6z6sjc9kkc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "datastudio_record_count_system_field_id_98323387"
                                }
                            }
                        ],
                        "sortData": [
                            {
                                "sortColumn": {
                                    "name": "qt_6z6sjc9kkc",
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "dataTransformation": {
                                        "sourceFieldName": "datastudio_record_count_system_field_id_98323387"
                                    }
                                },
                                "sortDir": 1
                            }
                        ],
                        "includeRowsCount": true,
                        "paginateInfo": {
                            "startRow": 1,
                            "rowsCount": 5001
                        },
                        "blendConfig": {
                            "blockDatasource": {
                                "datasourceBlock": {
                                    "id": "block_86ikipfnkc",
                                    "type": 1,
                                    "inputBlockIds": [],
                                    "outputBlockIds": [],
                                    "fields": []
                                },
                                "blocks": [
                                    {
                                        "id": "block_96ikipfnkc",
                                        "type": 5,
                                        "inputBlockIds": [],
                                        "outputBlockIds": [],
                                        "fields": [],
                                        "queryBlockConfig": {
                                            "joinQueryConfig": {
                                                "joinKeys": [],
                                                "queries": [
                                                    {
                                                        "datasourceId": "be20cc44-8f07-40e9-a197-6803fe40ce87",
                                                        "concepts": []
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                ],
                                "delegatedAccessEnabled": true,
                                "isUnlocked": true,
                                "isCacheable": false
                            }
                        },
                        "filters": [
                            {
                                "filterDefinition": {
                                    "filterExpression": {
                                        "include": true,
                                        "conceptType": 0,
                                        "concept": {
                                            "ns": "t0",
                                            "name": "qt_kraj088kkc"
                                        },
                                        "filterConditionType": "IN",
                                        "stringValues": [
                                            "Sinovac Life Sciences",
                                            "AstraZeneca"
                                        ],
                                        "numberValues": [],
                                        "queryTimeTransformation": {
                                            "dataTransformation": {
                                                "sourceFieldName": "_manuf_name_"
                                            }
                                        }
                                    }
                                },
                                "dataSubsetNs": {
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "contextNs": "c0"
                                },
                                "version": 3
                            },
                            {
                                "filterDefinition": {
                                    "filterExpression": {
                                        "include": true,
                                        "conceptType": 0,
                                        "concept": {
                                            "name": "qt_tf5sjc9kkc",
                                            "ns": "t0"
                                        },
                                        "queryTimeTransformation": {
                                            "dataTransformation": {
                                                "sourceFieldName": "_hospital_province_"
                                            },
                                            "displayTransformation": {
                                                "displayName": "Province"
                                            }
                                        },
                                        "filterConditionType": "IN",
                                        "stringValues": [
                                            provinceName
                                        ]
                                    }
                                },
                                "dataSubsetNs": {
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "contextNs": "c0"
                                },
                                "version": 3
                            }
                        ],
                        "features": [],
                        "dateRanges": [],
                        "contextNsCount": 1,
                        "dateRangeDimensions": [
                            {
                                "name": "qt_ls7sjc9kkc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_vaccinated_on_"
                                }
                            }
                        ],
                        "calculatedField": [],
                        "needGeocoding": false,
                        "geoFieldMask": [],
                        "geoVertices": 100000
                    },
                    "useDataColumn": true
                },
                {
                    "requestContext": {
                        "reportContext": {
                            "reportId": "731713b6-a3c4-4766-ab9d-a6502a4e7dd6",
                            "pageId": "33037739",
                            "mode": "VIEW",
                            "componentId": "cd-gusf6b9kkc",
                            "displayType": "dimension-filter"
                        }
                    },
                    "datasetSpec": {
                        "dataset": [
                            {
                                "datasourceId": "be20cc44-8f07-40e9-a197-6803fe40ce87",
                                "revisionNumber": 0,
                                "parameterOverrides": []
                            }
                        ],
                        "queryFields": [
                            {
                                "name": "qt_xk8sjc9kkc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_hospital_code_",
                                    "aggregation": 0
                                }
                            },
                            {
                                "name": "qt_qk8sjc9kkc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "datastudio_record_count_system_field_id_98323387"
                                }
                            }
                        ],
                        "sortData": [
                            {
                                "sortColumn": {
                                    "name": "qt_qk8sjc9kkc",
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "dataTransformation": {
                                        "sourceFieldName": "datastudio_record_count_system_field_id_98323387"
                                    }
                                },
                                "sortDir": 1
                            }
                        ],
                        "includeRowsCount": true,
                        "paginateInfo": {
                            "startRow": 1,
                            "rowsCount": 5001
                        },
                        "blendConfig": {
                            "blockDatasource": {
                                "datasourceBlock": {
                                    "id": "block_izjkipfnkc",
                                    "type": 1,
                                    "inputBlockIds": [],
                                    "outputBlockIds": [],
                                    "fields": []
                                },
                                "blocks": [
                                    {
                                        "id": "block_jzjkipfnkc",
                                        "type": 5,
                                        "inputBlockIds": [],
                                        "outputBlockIds": [],
                                        "fields": [],
                                        "queryBlockConfig": {
                                            "joinQueryConfig": {
                                                "joinKeys": [],
                                                "queries": [
                                                    {
                                                        "datasourceId": "be20cc44-8f07-40e9-a197-6803fe40ce87",
                                                        "concepts": []
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                ],
                                "delegatedAccessEnabled": true,
                                "isUnlocked": true,
                                "isCacheable": false
                            }
                        },
                        "filters": [
                            {
                                "filterDefinition": {
                                    "filterExpression": {
                                        "include": true,
                                        "conceptType": 0,
                                        "concept": {
                                            "ns": "t0",
                                            "name": "qt_kraj088kkc"
                                        },
                                        "filterConditionType": "IN",
                                        "stringValues": [
                                            "Sinovac Life Sciences",
                                            "AstraZeneca"
                                        ],
                                        "numberValues": [],
                                        "queryTimeTransformation": {
                                            "dataTransformation": {
                                                "sourceFieldName": "_manuf_name_"
                                            }
                                        }
                                    }
                                },
                                "dataSubsetNs": {
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "contextNs": "c0"
                                },
                                "version": 3
                            },
                            {
                                "filterDefinition": {
                                    "filterExpression": {
                                        "include": true,
                                        "conceptType": 0,
                                        "concept": {
                                            "name": "qt_tf5sjc9kkc",
                                            "ns": "t0"
                                        },
                                        "queryTimeTransformation": {
                                            "dataTransformation": {
                                                "sourceFieldName": "_hospital_province_"
                                            },
                                            "displayTransformation": {
                                                "displayName": "Province"
                                            }
                                        },
                                        "filterConditionType": "IN",
                                        "stringValues": [
                                            provinceName
                                        ]
                                    }
                                },
                                "dataSubsetNs": {
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "contextNs": "c0"
                                },
                                "version": 3
                            }
                        ],
                        "features": [],
                        "dateRanges": [],
                        "contextNsCount": 1,
                        "dateRangeDimensions": [
                            {
                                "name": "qt_5c9sjc9kkc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_vaccinated_on_"
                                }
                            }
                        ],
                        "calculatedField": [],
                        "needGeocoding": false,
                        "geoFieldMask": [],
                        "geoVertices": 100000
                    },
                    "useDataColumn": true
                },
                {
                    "requestContext": {
                        "reportContext": {
                            "reportId": "731713b6-a3c4-4766-ab9d-a6502a4e7dd6",
                            "pageId": "33037739",
                            "mode": "VIEW",
                            "componentId": "cd-houi9b9kkc",
                            "displayType": "kpi-metric"
                        }
                    },
                    "datasetSpec": {
                        "dataset": [
                            {
                                "datasourceId": "be20cc44-8f07-40e9-a197-6803fe40ce87",
                                "revisionNumber": 0,
                                "parameterOverrides": []
                            }
                        ],
                        "queryFields": [
                            {
                                "name": "qt_c2jumc9kkc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "datastudio_record_count_system_field_id_98323387"
                                }
                            }
                        ],
                        "sortData": [],
                        "includeRowsCount": false,
                        "blendConfig": {
                            "blockDatasource": {
                                "datasourceBlock": {
                                    "id": "block_0zjkipfnkc",
                                    "type": 1,
                                    "inputBlockIds": [],
                                    "outputBlockIds": [],
                                    "fields": []
                                },
                                "blocks": [
                                    {
                                        "id": "block_1zjkipfnkc",
                                        "type": 5,
                                        "inputBlockIds": [],
                                        "outputBlockIds": [],
                                        "fields": [],
                                        "queryBlockConfig": {
                                            "joinQueryConfig": {
                                                "joinKeys": [],
                                                "queries": [
                                                    {
                                                        "datasourceId": "be20cc44-8f07-40e9-a197-6803fe40ce87",
                                                        "concepts": []
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                ],
                                "delegatedAccessEnabled": true,
                                "isUnlocked": true,
                                "isCacheable": false
                            }
                        },
                        "filters": [
                            {
                                "filterDefinition": {
                                    "filterExpression": {
                                        "include": true,
                                        "conceptType": 0,
                                        "concept": {
                                            "ns": "t0",
                                            "name": "qt_kraj088kkc"
                                        },
                                        "filterConditionType": "IN",
                                        "stringValues": [
                                            "Sinovac Life Sciences",
                                            "AstraZeneca"
                                        ],
                                        "numberValues": [],
                                        "queryTimeTransformation": {
                                            "dataTransformation": {
                                                "sourceFieldName": "_manuf_name_"
                                            }
                                        }
                                    }
                                },
                                "dataSubsetNs": {
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "contextNs": "c0"
                                },
                                "version": 3
                            },
                            {
                                "filterDefinition": {
                                    "filterExpression": {
                                        "include": true,
                                        "conceptType": 0,
                                        "concept": {
                                            "name": "qt_tf5sjc9kkc",
                                            "ns": "t0"
                                        },
                                        "queryTimeTransformation": {
                                            "dataTransformation": {
                                                "sourceFieldName": "_hospital_province_"
                                            },
                                            "displayTransformation": {
                                                "displayName": "Province"
                                            }
                                        },
                                        "filterConditionType": "IN",
                                        "stringValues": [
                                            provinceName
                                        ]
                                    }
                                },
                                "dataSubsetNs": {
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "contextNs": "c0"
                                },
                                "version": 3
                            }
                        ],
                        "features": [],
                        "dateRanges": [],
                        "contextNsCount": 1,
                        "dateRangeDimensions": [
                            {
                                "name": "qt_jukumc9kkc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_vaccinated_on_"
                                }
                            }
                        ],
                        "calculatedField": [],
                        "needGeocoding": false,
                        "geoFieldMask": [],
                        "geoVertices": 100000
                    },
                    "useDataColumn": true
                },
                {
                    "requestContext": {
                        "reportContext": {
                            "reportId": "731713b6-a3c4-4766-ab9d-a6502a4e7dd6",
                            "pageId": "33037739",
                            "mode": "VIEW",
                            "componentId": "cd-joui9b9kkc",
                            "displayType": "kpi-metric"
                        }
                    },
                    "datasetSpec": {
                        "dataset": [
                            {
                                "datasourceId": "be20cc44-8f07-40e9-a197-6803fe40ce87",
                                "revisionNumber": 0,
                                "parameterOverrides": []
                            }
                        ],
                        "queryFields": [
                            {
                                "name": "qt_sukumc9kkc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "datastudio_record_count_system_field_id_98323387"
                                }
                            }
                        ],
                        "sortData": [],
                        "includeRowsCount": false,
                        "blendConfig": {
                            "blockDatasource": {
                                "datasourceBlock": {
                                    "id": "block_askkipfnkc",
                                    "type": 1,
                                    "inputBlockIds": [],
                                    "outputBlockIds": [],
                                    "fields": []
                                },
                                "blocks": [
                                    {
                                        "id": "block_bskkipfnkc",
                                        "type": 5,
                                        "inputBlockIds": [],
                                        "outputBlockIds": [],
                                        "fields": [],
                                        "queryBlockConfig": {
                                            "joinQueryConfig": {
                                                "joinKeys": [],
                                                "queries": [
                                                    {
                                                        "datasourceId": "be20cc44-8f07-40e9-a197-6803fe40ce87",
                                                        "concepts": []
                                                    }
                                                ]
                                            }
                                        }
                                    }
                                ],
                                "delegatedAccessEnabled": true,
                                "isUnlocked": true,
                                "isCacheable": false
                            }
                        },
                        "filters": [
                            {
                                "filterDefinition": {
                                    "filterExpression": {
                                        "include": false,
                                        "conceptType": 0,
                                        "concept": {
                                            "ns": "t0",
                                            "name": "qt_oht8n8fbjc"
                                        },
                                        "filterConditionType": "GT",
                                        "stringValues": [],
                                        "numberValues": [
                                            1
                                        ],
                                        "queryTimeTransformation": {
                                            "dataTransformation": {
                                                "sourceFieldName": "_dose_no_",
                                                "aggregation": 0
                                            }
                                        }
                                    }
                                },
                                "dataSubsetNs": {
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "contextNs": "c0"
                                },
                                "version": 3
                            },
                            {
                                "filterDefinition": {
                                    "filterExpression": {
                                        "include": true,
                                        "conceptType": 0,
                                        "concept": {
                                            "ns": "t0",
                                            "name": "qt_kraj088kkc"
                                        },
                                        "filterConditionType": "IN",
                                        "stringValues": [
                                            "Sinovac Life Sciences",
                                            "AstraZeneca"
                                        ],
                                        "numberValues": [],
                                        "queryTimeTransformation": {
                                            "dataTransformation": {
                                                "sourceFieldName": "_manuf_name_"
                                            }
                                        }
                                    }
                                },
                                "dataSubsetNs": {
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "contextNs": "c0"
                                },
                                "version": 3
                            },
                            {
                                "filterDefinition": {
                                    "filterExpression": {
                                        "include": true,
                                        "conceptType": 0,
                                        "concept": {
                                            "name": "qt_tf5sjc9kkc",
                                            "ns": "t0"
                                        },
                                        "queryTimeTransformation": {
                                            "dataTransformation": {
                                                "sourceFieldName": "_hospital_province_"
                                            },
                                            "displayTransformation": {
                                                "displayName": "Province"
                                            }
                                        },
                                        "filterConditionType": "IN",
                                        "stringValues": [
                                            provinceName
                                        ]
                                    }
                                },
                                "dataSubsetNs": {
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "contextNs": "c0"
                                },
                                "version": 3
                            }
                        ],
                        "features": [],
                        "dateRanges": [],
                        "contextNsCount": 1,
                        "dateRangeDimensions": [
                            {
                                "name": "qt_zmlumc9kkc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_vaccinated_on_"
                                }
                            }
                        ],
                        "calculatedField": [],
                        "needGeocoding": false,
                        "geoFieldMask": [],
                        "geoVertices": 100000
                    },
                    "useDataColumn": true
                }
            ]
        }
    )
    const data = JSON.parse(res.data.substring(5))
    data.dataResponse[0].dataSubset[0].dataset.tableDataset.column[1].longColumn.values // supply separated by manufactures
    const hospitals_names = data.dataResponse[2].dataSubset[0].dataset.tableDataset.column[0].stringColumn.values
    const hospitals_codes = data.dataResponse[3].dataSubset[0].dataset.tableDataset.column[0].stringColumn.values
    const hospitals_doses = data.dataResponse[3].dataSubset[0].dataset.tableDataset.column[1].longColumn.values
    const total_doses = Number(data.dataResponse[4].dataSubset[0].dataset.tableDataset.column[0].longColumn.values) // total doses
    const first_doses = Number(data.dataResponse[5].dataSubset[0].dataset.tableDataset.column[0].longColumn.values) // first doses
    const second_doses = total_doses - first_doses
    const over_60_doses = await getByGroup(provinceName)

    return ({
        "total_doses": Number(total_doses),
        "total-1st-dose": Number(first_doses),
        "total-2nd-dose": Number(second_doses),
        ">60-total-doses": Number(over_60_doses),
        "by_hospitals": {
            h_codes: hospitals_codes,
            doses: hospitals_doses,
            h_names: hospitals_names
        }
    })

}

async function getManufacturer() {
    const res = await axios.post('https://datastudio.google.com/batchedDataV2', {
        "dataRequest": [
            {
                "requestContext": {
                    "reportContext": {
                        "reportId": "731713b6-a3c4-4766-ab9d-a6502a4e7dd6",
                        "pageId": "33037739",
                        "mode": "VIEW",
                        "componentId": "cd-8me2cc9kkc",
                        "displayType": "simple-barchart"
                    }
                },
                "datasetSpec": {
                    "dataset": [
                        {
                            "datasourceId": "be20cc44-8f07-40e9-a197-6803fe40ce87",
                            "revisionNumber": 0,
                            "parameterOverrides": []
                        }
                    ],
                    "queryFields": [
                        {
                            "name": "qt_3g0rrc9kkc",
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
                            "name": "qt_09asrc9kkc",
                            "datasetNs": "d0",
                            "tableNs": "t0",
                            "dataTransformation": {
                                "sourceFieldName": "_manuf_name_"
                            }
                        },
                        {
                            "name": "qt_wg0rrc9kkc",
                            "datasetNs": "d0",
                            "tableNs": "t0",
                            "dataTransformation": {
                                "sourceFieldName": "datastudio_record_count_system_field_id_98323387"
                            }
                        }
                    ],
                    "sortData": [
                        {
                            "sortColumn": {
                                "name": "qt_3g0rrc9kkc",
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
                        }
                    ],
                    "includeRowsCount": false,
                    "blendConfig": {
                        "blockDatasource": {
                            "datasourceBlock": {
                                "id": "block_8feppxfpkc",
                                "type": 1,
                                "inputBlockIds": [],
                                "outputBlockIds": [],
                                "fields": []
                            },
                            "blocks": [
                                {
                                    "id": "block_9feppxfpkc",
                                    "type": 5,
                                    "inputBlockIds": [],
                                    "outputBlockIds": [],
                                    "fields": [],
                                    "queryBlockConfig": {
                                        "joinQueryConfig": {
                                            "joinKeys": [],
                                            "queries": [
                                                {
                                                    "datasourceId": "be20cc44-8f07-40e9-a197-6803fe40ce87",
                                                    "concepts": []
                                                }
                                            ]
                                        }
                                    }
                                }
                            ],
                            "delegatedAccessEnabled": true,
                            "isUnlocked": true,
                            "isCacheable": false
                        }
                    },
                    "filters": [
                        {
                            "filterDefinition": {
                                "filterExpression": {
                                    "include": true,
                                    "conceptType": 0,
                                    "concept": {
                                        "ns": "t0",
                                        "name": "qt_kraj088kkc"
                                    },
                                    "filterConditionType": "IN",
                                    "stringValues": [
                                        "Sinovac Life Sciences",
                                        "AstraZeneca"
                                    ],
                                    "numberValues": [],
                                    "queryTimeTransformation": {
                                        "dataTransformation": {
                                            "sourceFieldName": "_manuf_name_"
                                        }
                                    }
                                }
                            },
                            "dataSubsetNs": {
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "contextNs": "c0"
                            },
                            "version": 3
                        },
                        {
                            "filterDefinition": {
                                "filterExpression": {
                                    "include": true,
                                    "conceptType": 0,
                                    "concept": {
                                        "name": "qt_3g0rrc9kkc",
                                        "ns": "t0"
                                    },
                                    "queryTimeTransformation": {
                                        "dataTransformation": {
                                            "sourceFieldName": "_vaccinated_on_",
                                            "transformationConfig": {
                                                "transformationType": 5
                                            }
                                        }
                                    },
                                    "filterConditionType": "IN",
                                    "stringValues": []
                                }
                            },
                            "dataSubsetNs": {
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "contextNs": "c0"
                            },
                            "version": 3
                        },
                        {
                            "filterDefinition": {
                                "filterExpression": {
                                    "include": true,
                                    "conceptType": 0,
                                    "concept": {
                                        "name": "qt_09asrc9kkc",
                                        "ns": "t0"
                                    },
                                    "queryTimeTransformation": {
                                        "dataTransformation": {
                                            "sourceFieldName": "_manuf_name_"
                                        }
                                    },
                                    "filterConditionType": "IN",
                                    "stringValues": [
                                        "Sinovac Life Sciences",
                                        "AstraZeneca"
                                    ]
                                }
                            },
                            "dataSubsetNs": {
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "contextNs": "c0"
                            },
                            "version": 3
                        }
                    ],
                    "features": [],
                    "dateRanges": [],
                    "contextNsCount": 1,
                    "dateRangeDimensions": [
                        {
                            "name": "qt_0tcsrc9kkc",
                            "datasetNs": "d0",
                            "tableNs": "t0",
                            "dataTransformation": {
                                "sourceFieldName": "_vaccinated_on_"
                            }
                        }
                    ],
                    "calculatedField": [],
                    "needGeocoding": false,
                    "geoFieldMask": [],
                    "geoVertices": 100000
                },
                "useDataColumn": true
            }
        ]
    })
    const data = JSON.parse(res.data.substring(5))
    const dates = data.dataResponse[0].dataSubset[0].dataset.tableDataset.column[0].dateColumn.values
    const manufacturer = data.dataResponse[0].dataSubset[0].dataset.tableDataset.column[1].stringColumn.values
    const doses_administered = data.dataResponse[0].dataSubset[0].dataset.tableDataset.column[2].longColumn.values
    const db = []
    dates.map((date, index)=>{
        if(new Date(date) >= new Date('2021-03-01')){
            db.push({
                date:dates[index],
                manufacturer: manufacturer[index],
                doses_administered: Number(doses_administered[index])
            })
        }
    })
    return {
        data: db,
        latest_date: dates[dates.length-1]
    }
}

(async () => {
    try {        
        
        console.log('Downloading manufacturer data.')
        const manufacturer = await getManufacturer()
        await fs.writeFile('../../components/gis/data/manufacturer-vaccination-data.json', JSON.stringify(manufacturer.data), 'utf-8')
        var db = {
            'update_at': manufacturer.latest_date,
            'data': []
        }
        console.log('Downloading provincial vaccination data.')
        //todo: parallel for a faster speed?
        var hospital_doses = {
            'update_at': manufacturer.latest_date,
            'data': []
        }
        console.log(manufacturer.latest_date)
        var count_progress = 0
        for (const i in geo) {
            if (geo[i]['PROV_CODE']) {
                var province = await getProvince(geo[i]['province'])
                var population
                const findPop = _.findIndex(estimated_pop, { "PROV_CODE": geo[i]['PROV_CODE'] })
                if (estimated_pop[findPop]['estimated_living_population']) {
                    population = estimated_pop[findPop]['estimated_living_population']
                }
                else {
                    population = estimated_pop[findPop]['population']
                }
                province_data = {
                    "name": geo[i]['province'],
                    "id": geo[i]['PROV_CODE'],
                    "population": population,
                    "registered_population": geo[i]['total'],
                    ">60-population": Number(geo[i]['>60']),
                    "coverage": (province['total_doses'] / 2) / population,
                    "total_doses": province['total_doses'],
                    "total-1st-dose": province['total-1st-dose'],
                    "total-2nd-dose": province['total-2nd-dose'],
                    ">60-total-doses": province['>60-total-doses']
                }
                db['data'].push(province_data)
                province['by_hospitals']['h_codes'].map((h_code, index) => {
                    hospital_doses['data'].push({
                        h_code: h_code,
                        h_name: province['by_hospitals']['h_names'][index],
                        total_doses: Number(province['by_hospitals']['doses'][index]),
                        province: geo[i]['province']
                    })
                })
                count_progress += 1
                console.log(`${count_progress}/77, Population: ${population}`)
            }

        }
        await fs.writeFile('../../components/gis/data/hospital-vaccination-data.json', JSON.stringify(hospital_doses), 'utf-8')
        await fs.writeFile('../../components/gis/data/provincial-vaccination-data.json', JSON.stringify(db), 'utf-8')
        console.log('provinces vaccine supply data download completed')
        

    } catch (e) {
        console.log(e)
    }
})();