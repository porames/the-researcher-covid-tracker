const geo = require('../th-census-age-group.json')

const axios = require('axios')
const csv = require('csv-parser')
const fs = require('fs').promises

async function getHospital() {
    const res = await axios.post('https://datastudio.google.com/batchedDataV2?appVersion=20210506_00020034',
        { "dataRequest": [{ "requestContext": { "reportContext": { "reportId": "731713b6-a3c4-4766-ab9d-a6502a4e7dd6", "pageId": "31081301", "mode": "VIEW", "componentId": "cd-vipnb1bcjc", "displayType": "simple-table" } }, "datasetSpec": { "dataset": [{ "datasourceId": "05bbf5e6-7c84-45c4-9028-e8fe8de09357", "revisionNumber": 0, "parameterOverrides": [] }], "queryFields": [{ "name": "qt_wipnb1bcjc", "datasetNs": "d0", "tableNs": "t0", "dataTransformation": { "sourceFieldName": "_hospital_code_" } }, { "name": "qt_xipnb1bcjc", "datasetNs": "d0", "tableNs": "t0", "dataTransformation": { "sourceFieldName": "_hospital_name_" } }, { "name": "qt_7lf7mdidjc", "datasetNs": "d0", "tableNs": "t0", "dataTransformation": { "sourceFieldName": "_hospital_zone_" } }, { "name": "qt_k6rcrdidjc", "datasetNs": "d0", "tableNs": "t0", "dataTransformation": { "sourceFieldName": "_hospital_province_" } }, { "name": "qt_yipnb1bcjc", "datasetNs": "d0", "tableNs": "t0", "dataTransformation": { "sourceFieldName": "_quantity_", "aggregation": 6 } }, { "name": "qt_nca2m2bcjc", "datasetNs": "d0", "tableNs": "t0", "dataTransformation": { "sourceType": 1, "sourceFieldName": "adhoc_qt_nca2m2bcjc", "textFormula": "SUM(t0._quantity_) - SUM(t0._quantity_vaccinated_)", "frontendTextFormula": "SUM(t0._quantity_)-SUM(t0._quantity_vaccinated_)", "formulaOutputDataType": 1, "aggregation": 7 } }], "sortData": [{ "sortColumn": { "name": "qt_nca2m2bcjc", "datasetNs": "d0", "tableNs": "t0", "dataTransformation": { "sourceType": 1, "sourceFieldName": "adhoc_qt_nca2m2bcjc", "textFormula": "SUM(t0._quantity_) - SUM(t0._quantity_vaccinated_)", "frontendTextFormula": "SUM(t0._quantity_)-SUM(t0._quantity_vaccinated_)", "formulaOutputDataType": 1, "aggregation": 7 } }, "sortDir": 1 }], "includeRowsCount": true, "paginateInfo": { "startRow": 1, "rowsCount": 500 }, "blendConfig": { "blockDatasource": { "datasourceBlock": { "id": "block_l17h6ouhkc", "type": 1, "inputBlockIds": [], "outputBlockIds": [], "fields": [] }, "blocks": [{ "id": "block_m17h6ouhkc", "type": 5, "inputBlockIds": [], "outputBlockIds": [], "fields": [], "queryBlockConfig": { "joinQueryConfig": { "joinKeys": [], "queries": [{ "datasourceId": "05bbf5e6-7c84-45c4-9028-e8fe8de09357", "concepts": [] }] } } }], "delegatedAccessEnabled": true, "isUnlocked": true, "isCacheable": false } }, "filters": [{ "filterDefinition": { "filterExpression": { "include": false, "conceptType": 0, "concept": { "ns": "t0", "name": "qt_kh0bqwzbjc" }, "filterConditionType": "NU", "stringValues": ["20210501150000"], "numberValues": [], "queryTimeTransformation": { "dataTransformation": { "sourceFieldName": "_arrive_at_hospital_" } } } }, "dataSubsetNs": { "datasetNs": "d0", "tableNs": "t0", "contextNs": "c0" }, "version": 3 }, { "filterDefinition": { "or": { "filterDefinitions": [{ "filterExpression": { "include": true, "conceptType": 0, "concept": { "ns": "t0", "name": "qt_d5ctq5hdjc" }, "filterConditionType": "GT", "stringValues": [], "numberValues": [0], "queryTimeTransformation": { "dataTransformation": { "sourceFieldName": "quantity_available" } } } }, { "filterExpression": { "include": true, "conceptType": 0, "concept": { "ns": "t0", "name": "qt_z3xgq9hdjc" }, "filterConditionType": "NU", "stringValues": [], "numberValues": [], "queryTimeTransformation": { "dataTransformation": { "sourceFieldName": "quantity_available" } } } }] } }, "dataSubsetNs": { "datasetNs": "d0", "tableNs": "t0", "contextNs": "c0" }, "version": 3 }, { "filterDefinition": { "filterExpression": { "include": false, "conceptType": 0, "concept": { "ns": "t0", "name": "qt_lolah1gcjc" }, "filterConditionType": "NU", "stringValues": [""], "numberValues": [], "queryTimeTransformation": { "dataTransformation": { "sourceFieldName": "_hospital_name_" } } } }, "dataSubsetNs": { "datasetNs": "d0", "tableNs": "t0", "contextNs": "c0" }, "version": 3 }], "features": [], "dateRanges": [], "contextNsCount": 1, "calculatedField": [{ "calculatedFieldId": "adhoc_qt_nca2m2bcjc", "ns": "t0", "textFormula": "SUM(t0._quantity_) - SUM(t0._quantity_vaccinated_)", "dataType": 0 }], "needGeocoding": false, "geoFieldMask": [], "geoVertices": 100000 }, "useDataColumn": true }] }
    )
    const data = JSON.parse(res.data.substring(5))
    return data
}

async function getProvinceTimeseries(id) {
    const res = await axios.post('https://datastudio.google.com/batchedDataV2?appVersion=20210506_00020034', {

        "dataRequest": [
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
                    "dataset": [
                        {
                            "datasourceId": "ec80c3ab-15d6-4261-a79c-a4df315e463f",
                            "revisionNumber": 0,
                            "parameterOverrides": []
                        }
                    ],
                    "queryFields": [
                        {
                            "name": "qt_olb8mhf0jc",
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
                            "name": "qt_pta8mhf0jc",
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
                                "name": "qt_olb8mhf0jc",
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
                                "id": "block_qfumblthkc",
                                "type": 1,
                                "inputBlockIds": [],
                                "outputBlockIds": [],
                                "fields": []
                            },
                            "blocks": [
                                {
                                    "id": "block_rfumblthkc",
                                    "type": 5,
                                    "inputBlockIds": [],
                                    "outputBlockIds": [],
                                    "fields": [],
                                    "queryBlockConfig": {
                                        "joinQueryConfig": {
                                            "joinKeys": [],
                                            "queries": [
                                                {
                                                    "datasourceId": "ec80c3ab-15d6-4261-a79c-a4df315e463f",
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
                                        "name": "qt_c70cwhf0jc",
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
                        }
                    ],
                    "features": [],
                    "dateRanges": [],
                    "contextNsCount": 1,
                    "dateRangeDimensions": [
                        {
                            "name": "qt_yahhqhf0jc",
                            "datasetNs": "d0",
                            "tableNs": "t0",
                            "dataTransformation": {
                                "sourceFieldName": "_vaccinated_on_",
                                "transformationConfig": {
                                    "transformationType": 5
                                }
                            }
                        }
                    ],
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
                    "dataset": [
                        {
                            "datasourceId": "ec80c3ab-15d6-4261-a79c-a4df315e463f",
                            "revisionNumber": 0,
                            "parameterOverrides": []
                        }
                    ],
                    "queryFields": [
                        {
                            "name": "qt_plb8mhf0jc",
                            "datasetNs": "d0",
                            "tableNs": "t0",
                            "dataTransformation": {
                                "sourceFieldName": "_vaccine_name_"
                            }
                        },
                        {
                            "name": "qt_pta8mhf0jc",
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
                                "name": "qt_pta8mhf0jc",
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
                        "rowsCount": 10
                    },
                    "blendConfig": {
                        "blockDatasource": {
                            "datasourceBlock": {
                                "id": "block_qfumblthkc",
                                "type": 1,
                                "inputBlockIds": [],
                                "outputBlockIds": [],
                                "fields": []
                            },
                            "blocks": [
                                {
                                    "id": "block_rfumblthkc",
                                    "type": 5,
                                    "inputBlockIds": [],
                                    "outputBlockIds": [],
                                    "fields": [],
                                    "queryBlockConfig": {
                                        "joinQueryConfig": {
                                            "joinKeys": [],
                                            "queries": [
                                                {
                                                    "datasourceId": "ec80c3ab-15d6-4261-a79c-a4df315e463f",
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
                                        "name": "qt_c70cwhf0jc",
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
                        }
                    ],
                    "features": [],
                    "dateRanges": [],
                    "contextNsCount": 1,
                    "dateRangeDimensions": [
                        {
                            "name": "qt_yahhqhf0jc",
                            "datasetNs": "d0",
                            "tableNs": "t0",
                            "dataTransformation": {
                                "sourceFieldName": "_vaccinated_on_",
                                "transformationConfig": {
                                    "transformationType": 5
                                }
                            }
                        }
                    ],
                    "calculatedField": [],
                    "needGeocoding": false,
                    "geoFieldMask": []
                },
                "useDataColumn": true
            }
        ]

    })
    const data = JSON.parse(res.data.substring(5))
    var dates = data['dataResponse'][0]['dataSubset'][0]['dataset']['tableDataset']['column'][0]['dateColumn']['values']
    var doses = data['dataResponse'][0]['dataSubset'][0]['dataset']['tableDataset']['column'][1]['longColumn']['values']
    doses = doses.map(x => Number(x))
    const administered = doses.reduce((a, b) => a + b, 0)
    var province = {
        'doses': doses,
        'dates': dates,
        'administered': administered
    }
    return province
}

async function getProvince(provinceName) {
    const res = await axios.post('https://datastudio.google.com/batchedDataV2?appVersion=20210506_00020034',
        {
            "dataRequest": [
                {
                    "requestContext": {
                        "reportContext": {
                            "reportId": "731713b6-a3c4-4766-ab9d-a6502a4e7dd6",
                            "pageId": "31081302",
                            "mode": "VIEW",
                            "componentId": "cd-k8ri5fccjc",
                            "displayType": "kpi-metric"
                        }
                    },
                    "datasetSpec": {
                        "dataset": [
                            {
                                "datasourceId": "ec80c3ab-15d6-4261-a79c-a4df315e463f",
                                "revisionNumber": 0,
                                "parameterOverrides": []
                            }
                        ],
                        "queryFields": [
                            {
                                "name": "qt_myjbygf0jc",
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
                                    "id": "block_4l4rfrvhkc",
                                    "type": 1,
                                    "inputBlockIds": [],
                                    "outputBlockIds": [],
                                    "fields": []
                                },
                                "blocks": [
                                    {
                                        "id": "block_5l4rfrvhkc",
                                        "type": 5,
                                        "inputBlockIds": [],
                                        "outputBlockIds": [],
                                        "fields": [],
                                        "queryBlockConfig": {
                                            "joinQueryConfig": {
                                                "joinKeys": [],
                                                "queries": [
                                                    {
                                                        "datasourceId": "ec80c3ab-15d6-4261-a79c-a4df315e463f",
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
                                            "name": "qt_y7gqvef0jc",
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
                                            `${provinceName}`
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
                                "name": "qt_4uv65gf0jc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_vaccinated_on_",
                                    "transformationConfig": {
                                        "transformationType": 5
                                    }
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
                            "pageId": "31081302",
                            "mode": "VIEW",
                            "componentId": "cd-h8dlwgccjc",
                            "displayType": "kpi-metric"
                        }
                    },
                    "datasetSpec": {
                        "dataset": [
                            {
                                "datasourceId": "ec80c3ab-15d6-4261-a79c-a4df315e463f",
                                "revisionNumber": 0,
                                "parameterOverrides": []
                            }
                        ],
                        "queryFields": [
                            {
                                "name": "qt_7bvm8gf0jc",
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
                                    "id": "block_de5rfrvhkc",
                                    "type": 1,
                                    "inputBlockIds": [],
                                    "outputBlockIds": [],
                                    "fields": []
                                },
                                "blocks": [
                                    {
                                        "id": "block_ee5rfrvhkc",
                                        "type": 5,
                                        "inputBlockIds": [],
                                        "outputBlockIds": [],
                                        "fields": [],
                                        "queryBlockConfig": {
                                            "joinQueryConfig": {
                                                "joinKeys": [],
                                                "queries": [
                                                    {
                                                        "datasourceId": "ec80c3ab-15d6-4261-a79c-a4df315e463f",
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
                                            "name": "qt_y7gqvef0jc",
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
                                            `${provinceName}`
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
                                "name": "qt_xrfq9gf0jc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_vaccinated_on_",
                                    "transformationConfig": {
                                        "transformationType": 5
                                    }
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
                            "pageId": "31081302",
                            "mode": "VIEW",
                            "componentId": "cd-uq66ihccjc",
                            "displayType": "kpi-metric"
                        }
                    },
                    "datasetSpec": {
                        "dataset": [
                            {
                                "datasourceId": "ec80c3ab-15d6-4261-a79c-a4df315e463f",
                                "revisionNumber": 0,
                                "parameterOverrides": []
                            }
                        ],
                        "queryFields": [
                            {
                                "name": "qt_mv22bhf0jc",
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
                                    "id": "block_ue5rfrvhkc",
                                    "type": 1,
                                    "inputBlockIds": [],
                                    "outputBlockIds": [],
                                    "fields": []
                                },
                                "blocks": [
                                    {
                                        "id": "block_ve5rfrvhkc",
                                        "type": 5,
                                        "inputBlockIds": [],
                                        "outputBlockIds": [],
                                        "fields": [],
                                        "queryBlockConfig": {
                                            "joinQueryConfig": {
                                                "joinKeys": [],
                                                "queries": [
                                                    {
                                                        "datasourceId": "ec80c3ab-15d6-4261-a79c-a4df315e463f",
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
                                            "name": "qt_ehkx79fbjc"
                                        },
                                        "filterConditionType": "EQ",
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
                                            "name": "qt_y7gqvef0jc",
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
                                            `${provinceName}`
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
                                "name": "qt_gk3cdhf0jc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_vaccinated_on_",
                                    "transformationConfig": {
                                        "transformationType": 5
                                    }
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
                            "pageId": "31081302",
                            "mode": "VIEW",
                            "componentId": "cd-1nrsbiccjc",
                            "displayType": "kpi-metric"
                        }
                    },
                    "datasetSpec": {
                        "dataset": [
                            {
                                "datasourceId": "ec80c3ab-15d6-4261-a79c-a4df315e463f",
                                "revisionNumber": 0,
                                "parameterOverrides": []
                            }
                        ],
                        "queryFields": [
                            {
                                "name": "qt_z9wffhf0jc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_hospital_code_",
                                    "aggregation": 3
                                }
                            }
                        ],
                        "sortData": [],
                        "includeRowsCount": false,
                        "blendConfig": {
                            "blockDatasource": {
                                "datasourceBlock": {
                                    "id": "block_fi8rfrvhkc",
                                    "type": 1,
                                    "inputBlockIds": [],
                                    "outputBlockIds": [],
                                    "fields": []
                                },
                                "blocks": [
                                    {
                                        "id": "block_gi8rfrvhkc",
                                        "type": 5,
                                        "inputBlockIds": [],
                                        "outputBlockIds": [],
                                        "fields": [],
                                        "queryBlockConfig": {
                                            "joinQueryConfig": {
                                                "joinKeys": [],
                                                "queries": [
                                                    {
                                                        "datasourceId": "ec80c3ab-15d6-4261-a79c-a4df315e463f",
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
                                            "name": "qt_y7gqvef0jc",
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
                                            `${provinceName}`
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
                                "name": "qt_9grighf0jc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_vaccinated_on_",
                                    "transformationConfig": {
                                        "transformationType": 5
                                    }
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
                            "pageId": "31081302",
                            "mode": "VIEW",
                            "componentId": "cd-ads51jccjc",
                            "displayType": "kpi-metric"
                        }
                    },
                    "datasetSpec": {
                        "dataset": [
                            {
                                "datasourceId": "ec80c3ab-15d6-4261-a79c-a4df315e463f",
                                "revisionNumber": 0,
                                "parameterOverrides": []
                            }
                        ],
                        "queryFields": [
                            {
                                "name": "qt_6oclihf0jc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_hospital_province_",
                                    "aggregation": 3
                                }
                            }
                        ],
                        "sortData": [],
                        "includeRowsCount": false,
                        "blendConfig": {
                            "blockDatasource": {
                                "datasourceBlock": {
                                    "id": "block_oa9rfrvhkc",
                                    "type": 1,
                                    "inputBlockIds": [],
                                    "outputBlockIds": [],
                                    "fields": []
                                },
                                "blocks": [
                                    {
                                        "id": "block_pa9rfrvhkc",
                                        "type": 5,
                                        "inputBlockIds": [],
                                        "outputBlockIds": [],
                                        "fields": [],
                                        "queryBlockConfig": {
                                            "joinQueryConfig": {
                                                "joinKeys": [],
                                                "queries": [
                                                    {
                                                        "datasourceId": "ec80c3ab-15d6-4261-a79c-a4df315e463f",
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
                                            "name": "qt_y7gqvef0jc",
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
                                            `${provinceName}`
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
                                "name": "qt_ep0kjhf0jc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_vaccinated_on_",
                                    "transformationConfig": {
                                        "transformationType": 5
                                    }
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
                            "pageId": "31081302",
                            "mode": "VIEW",
                            "componentId": "cd-pm9zukccjc",
                            "displayType": "google-map"
                        }
                    },
                    "datasetSpec": {
                        "dataset": [
                            {
                                "datasourceId": "ec80c3ab-15d6-4261-a79c-a4df315e463f",
                                "revisionNumber": 0,
                                "parameterOverrides": []
                            }
                        ],
                        "queryFields": [
                            {
                                "name": "qt_c70cwhf0jc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_hospital_province_code_"
                                }
                            },
                            {
                                "name": "qt_d70cwhf0jc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_hospital_province_"
                                }
                            },
                            {
                                "name": "qt_ef0cwhf0jc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_doctor_id_",
                                    "aggregation": 3
                                }
                            },
                            {
                                "name": "qt_ff0cwhf0jc",
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
                                    "name": "qt_ef0cwhf0jc",
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "dataTransformation": {
                                        "sourceFieldName": "_doctor_id_",
                                        "aggregation": 3
                                    }
                                },
                                "sortDir": 1
                            }
                        ],
                        "includeRowsCount": true,
                        "paginateInfo": {
                            "startRow": 1,
                            "rowsCount": 2000
                        },
                        "blendConfig": {
                            "blockDatasource": {
                                "datasourceBlock": {
                                    "id": "block_5a9rfrvhkc",
                                    "type": 1,
                                    "inputBlockIds": [],
                                    "outputBlockIds": [],
                                    "fields": []
                                },
                                "blocks": [
                                    {
                                        "id": "block_6a9rfrvhkc",
                                        "type": 5,
                                        "inputBlockIds": [],
                                        "outputBlockIds": [],
                                        "fields": [],
                                        "queryBlockConfig": {
                                            "joinQueryConfig": {
                                                "joinKeys": [],
                                                "queries": [
                                                    {
                                                        "datasourceId": "ec80c3ab-15d6-4261-a79c-a4df315e463f",
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
                                            "name": "qt_y7gqvef0jc",
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
                                            `${provinceName}`
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
                                "name": "qt_9p75xhf0jc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_vaccinated_on_",
                                    "transformationConfig": {
                                        "transformationType": 5
                                    }
                                }
                            }
                        ],
                        "calculatedField": [],
                        "needGeocoding": true,
                        "geoTypeCategory": 4,
                        "geoFieldMask": [
                            2
                        ],
                        "geoVertices": 100000
                    },
                    "useDataColumn": true
                },
                {
                    "requestContext": {
                        "reportContext": {
                            "reportId": "731713b6-a3c4-4766-ab9d-a6502a4e7dd6",
                            "pageId": "31081302",
                            "mode": "VIEW",
                            "componentId": "cd-w6caz6ccjc",
                            "displayType": "simple-barchart"
                        }
                    },
                    "datasetSpec": {
                        "dataset": [
                            {
                                "datasourceId": "ec80c3ab-15d6-4261-a79c-a4df315e463f",
                                "revisionNumber": 0,
                                "parameterOverrides": []
                            }
                        ],
                        "queryFields": [
                            {
                                "name": "qt_u20i5hf0jc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_person_type_"
                                }
                            },
                            {
                                "name": "qt_n20i5hf0jc",
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
                                    "name": "qt_u20i5hf0jc",
                                    "datasetNs": "d0",
                                    "tableNs": "t0",
                                    "dataTransformation": {
                                        "sourceFieldName": "_person_type_"
                                    }
                                },
                                "sortDir": 0
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
                                    "id": "block_v1gsfrvhkc",
                                    "type": 1,
                                    "inputBlockIds": [],
                                    "outputBlockIds": [],
                                    "fields": []
                                },
                                "blocks": [
                                    {
                                        "id": "block_w1gsfrvhkc",
                                        "type": 5,
                                        "inputBlockIds": [],
                                        "outputBlockIds": [],
                                        "fields": [],
                                        "queryBlockConfig": {
                                            "joinQueryConfig": {
                                                "joinKeys": [],
                                                "queries": [
                                                    {
                                                        "datasourceId": "ec80c3ab-15d6-4261-a79c-a4df315e463f",
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
                                            "name": "qt_y7gqvef0jc",
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
                                            `${provinceName}`
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
                                "name": "qt_9vfo6hf0jc",
                                "datasetNs": "d0",
                                "tableNs": "t0",
                                "dataTransformation": {
                                    "sourceFieldName": "_vaccinated_on_",
                                    "transformationConfig": {
                                        "transformationType": 5
                                    }
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
    const total_doses = data['dataResponse'][0]['dataSubset'][0]['dataset']['tableDataset']['column'][0]['longColumn']['values'][0]
    const first_doses = data['dataResponse'][1]['dataSubset'][0]['dataset']['tableDataset']['column'][0]['longColumn']['values'][0]
    const second_doses = data['dataResponse'][2]['dataSubset'][0]['dataset']['tableDataset']['column'][0]['longColumn']['values'][0]
    const over_60_doses = data['dataResponse'][6]['dataSubset'][0]['dataset']['tableDataset']['column'][1]['longColumn']['values'][1]
    return ({
        "total_doses": Number(total_doses),
        "total-1st-dose": Number(first_doses),
        "total-2nd-dose": Number(second_doses),
        ">60-total-doses": Number(over_60_doses)
    })

}

(async () => {
    try {
        var hostpial = await getHospital()
        await fs.writeFile('../../components/gis/data/hospital-vaccination-data.json', JSON.stringify(hostpial), 'utf-8')
        console.log('hospital supply data download completed')
        var db = []
        for (const i in geo) {
            if (geo[i]['PROV_CODE']) {
                var province = await getProvince(geo[i]['province'])
                province['name'] = geo[i]['province']
                province['id'] = geo[i]['PROV_CODE']
                province['population'] = Number(geo[i]['total'])
                province['>60-population'] = Number(geo[i]['>60'])
                province['coverage'] = (province['total_doses'] / 2) / geo[i]['total']
                db.push(province)
                console.log(geo[i]['PROV_CODE'])
            }

        }
        await fs.writeFile('../../components/gis/data/provincial-vaccination-data-dashboard.json', JSON.stringify(db), 'utf-8')
        console.log('provinces vaccine supply data download completed')

    } catch (e) {
        console.log(e)
    }
})();