import datetime
import json
import pandas as pd


def get_vaccines(fname):
    with open(fname, encoding='utf-8') as json_file:
        json_data = json.load(json_file)
    return {province["name"]: round(province["coverage"] * 100, 2) for province in json_data['data']}


def get_provinces_name(fname):
    with open(fname, encoding='utf-8') as json_file:
        json_data = json.load(json_file)
    return tuple(province["properties"]["PROV_NAMT"] for province in json_data["features"])


def get_start_end(data):
    start = datetime.datetime.strptime("2020-12-15", "%Y-%m-%d")
    date = data.tail(1)['announce_date'].iloc[0].strip()
    end = datetime.datetime.strptime(date, '%d/%m/%y')
    return start, end


def get_provinces(data, start):
    data_ymd = data.copy()
    data_ymd["announce_date"] = data_ymd["announce_date"].map(
        lambda date: datetime.datetime.strptime(date.strip(), "%d/%m/%y"))
    data_filtered = data_ymd[data_ymd["announce_date"] >= start]
    return pd.crosstab(data_filtered.announce_date, data_filtered.province_of_isolation).to_dict()


def moving_average(ys, N=7):
    cumulative_sum = [0]
    moving_aves = []
    for i, x in enumerate(ys, 1):
        cumulative_sum.append(cumulative_sum[i - 1] + x)
        if i >= N:
            moving_ave = (cumulative_sum[i] - cumulative_sum[i - N]) / N
            # can do stuff with moving_ave here
            moving_aves.append(moving_ave)
    return moving_aves