import pandas as pd
import json

YEAR_MONTH = "6406"
CENSUS_AGE_GROUP_OUT_PATH = "../th-census-age-group.json"

URL = f"https://stat.bora.dopa.go.th/stat/statnew/connectSAPI/stat_forward.php?API=/api/statpophouse/v1/statpop/list?action=23&yymm={YEAR_MONTH}&nat=999&popst=99"
PROVINCE_MAP_PATH = "../../components/gis/geo/th-provinces-centroids.json"


id_to_name = {} 
for feature in json.load(open(PROVINCE_MAP_PATH, encoding="utf-8"))["features"]:
    id_to_name[int(feature["properties"]["PROV_CODE"])] = {
        "province": feature["properties"]["PROV_NAMT"],
        "PROV_NAME": feature["properties"]["PROV_NAME"],
        "clean-name": feature["properties"]["PROV_NAME"].replace(" ","")
    }


def get_provinces_age_census(province_code: int) -> pd.DataFrame:
    try :
        df_male_female = pd.read_json(URL + f"&cc={province_code}").T
    except Exception as e:
        print("Error whilst getting province census data Province Code:", province_code)
        raise e
    df_male_female.drop(index=["lstrLevel","lsageRcode","lsageAA","lsageTT","lsageMM","lsageYYMM","lsageSex","lageNat","lagePopSt","lstAgev0","lsAgethai","lsSumTotTot"], inplace=True)
    df = df_male_female[0] + df_male_female[1]
    df = df.reset_index(drop=True)
    return df

def filter_by_age_group(province_code: int) -> pd.DataFrame:
    province_age_census = get_provinces_age_census(province_code)
    s0_20 = province_age_census[:20].sum()
    s20_60 = province_age_census[20:60].sum()
    s60_inf = province_age_census[60:].sum()
    province_data = id_to_name[province_code]
    df = pd.DataFrame(columns=["<20", "20-60", ">60", "total", "PROV_CODE", "PROV_NAME", "clean-name"],
                      index=[province_data["province"]],
                      data=[[s0_20, s20_60, s60_inf, province_age_census.sum(), province_code, province_data["PROV_NAME"], province_data["clean-name"]]])
    return df


combined_province_census = pd.DataFrame()

for i in id_to_name:
    combined_province_census = combined_province_census.append(filter_by_age_group(i))

combined_province_census = combined_province_census.reset_index()
combined_province_census.to_json(CENSUS_AGE_GROUP_OUT_PATH ,force_ascii=False, orient="records", indent=2)
