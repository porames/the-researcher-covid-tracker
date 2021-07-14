import datetime
import json
import pandas as pd
import numpy as np


def json_load(fname):
    with open(fname, encoding='utf-8') as json_file:
        return json.load(json_file)


def json_dump(json_data,fname):
    with open(fname, "w+", encoding="utf-8") as fout:
        json.dump(json_data, fout, ensure_ascii=False, indent=2)


def get_population(json_data):
    return {province["name"]: province["population"] for province in json_data['data']}


def get_vaccines(json_data):
    return {province["name"]: province for province in json_data['data']}


def get_provinces_name(json_data):
    return tuple(province["properties"]["PROV_NAMT"] for province in json_data["features"])


def get_start_end(data):
    start = datetime.datetime.strptime("2020-12-15", "%Y-%m-%d")
    date = data.tail(1)['announce_date'].iloc[0].strip()
    end = datetime.datetime.strptime(date, "%d/%m/%Y")
    return start, end


def get_provinces(data, start):
    data_ymd = data.copy()
    data_ymd["announce_date"] = data_ymd["announce_date"].map(
        lambda date: datetime.datetime.strptime(date.strip(), "%d/%m/%Y"))
    data_filtered = data_ymd[data_ymd["announce_date"] >= start]
    return pd.crosstab(data_filtered.announce_date, data_filtered.province_of_onset).to_dict()


def moving_average(ys, N=7):
    if len(ys) < N: return []
    return np.convolve(np.array(ys), np.ones(N), "valid") / N
