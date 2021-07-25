import pandas as pd
import datetime
import json

DEATH_DATA_14DAYS_OUT_PATH = "../components/gis/data/province-deaths-data-14days.json"
PROVINCE_MAP_PATH = "../components/gis/geo/th-provinces-centroids.json"
CENSUS_DATA_PATH = "./th-census-data.json"

URL = "https://github.com/djay/covidthailand/wiki/cases_by_province.csv"

PROVINCE_EN_TO_TH = {feature["properties"]["PROV_NAME"].replace(" ", ""):feature["properties"]["PROV_NAMT"] for feature in
               json.load(open(PROVINCE_MAP_PATH, encoding="utf-8"))["features"]}

# Get national data from URL
df = pd.read_csv(URL)

# Select column and filter to end (14 days)
df = df[["Date", "Province", "Deaths"]]
df.fillna(0, inplace=True)
df["Date"] = pd.to_datetime(df["Date"])
end = df["Date"].iloc[-1]
df = df[df["Date"] > end - datetime.timedelta(days=14)]
df["Date"] = df["Date"].apply(lambda dto : dto.isoformat())


df_grouped_by_province = df.pivot_table(index="Date", columns="Province", values="Deaths", fill_value=0)

province_population = {i["province"]: i["population"] for i in
                       json.load(open(CENSUS_DATA_PATH, encoding="utf-8"))}

death_by_province_14days = []
for province, death_by_date in df_grouped_by_province.to_dict().items() :
    province = province.upper().replace(" ","") # Convert to uppercase and remove spaces to match dict
    if province in PROVINCE_EN_TO_TH:
        province_name_th = PROVINCE_EN_TO_TH[province]
        deaths_count = sum(death_by_date.values())

        death_by_province_14days.append({
            "name": province_name_th,
            "deaths": death_by_date,
            "deathsCount": deaths_count,
            "deaths-per-100k" : round(deaths_count * 100000 / province_population[province_name_th], 2)
        })

    else :
        print("Invalid Province:", province)

with open(DEATH_DATA_14DAYS_OUT_PATH, "w+", encoding="utf-8") as fout:
    json.dump(death_by_province_14days, fout, ensure_ascii=False, indent=2)