import json
import numpy as np
import difflib


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


def moving_average(ys, N=7):
    if len(ys) < N: return []
    return np.convolve(np.array(ys), np.ones(N), "valid") / N


def find_similar_word(word : str, template_word : set) -> str :
    tmp = difflib.get_close_matches(word, template_word)
    if len(tmp) == 0 : return word
    else : return tmp[0]