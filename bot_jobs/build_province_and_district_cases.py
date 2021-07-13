from util import json_dump
import pandas as pd
import json
import datetime

district_data_14days_out_path = "../components/gis/data/amphoes-data-14days.json"
province_data_14days_out_path = "../components/gis/data/provinces-data-14days.json"
dataset_path = "./dataset.csv"

PROVINCE_MAP_PATH = "../components/gis/geo/th-provinces-centroids.json"
DISTRICT_MAP_PATH = "../components/gis/geo/th-map-amphoes.json"
CENSUS_DATA_PATH = "./th-census-data.json"


# Load dataset.csv
df = pd.read_csv(dataset_path, encoding="utf-8")

# Drop unnecessary column
df = df.drop(["No.", "Notified date", "nationality", "province_of_isolation",
              "sex", "age", "risk", "Unit"], axis=1)
# Convert day to datetime object
df["announce_date"] = df["announce_date"].map(lambda date: datetime.datetime.strptime(date, "%d/%m/%Y"))

# Filter from start date
end = df.tail(1)["announce_date"].iloc[0]
start = end - datetime.timedelta(days=14)
start = start.replace(hour=0, minute=0, second=0, microsecond=0)
df = df[(df['announce_date'] > start) & (df['announce_date'] <= end)]
# Convert datetime object to ISO string 
df["announce_date"] = df["announce_date"].map(lambda dto: dto.isoformat())

# Change อำเภอ เมือง -> อำเภอ เมือง + จังหวัด
mueng_df = df[df.district_of_onset == "เมือง"]
df.district_of_onset.update(mueng_df.district_of_onset + mueng_df.province_of_onset)

# Load province and district name in to sets
json_data = json.load(open(DISTRICT_MAP_PATH, encoding="utf-8"))
district_and_province_names = pd.DataFrame(i["properties"] for i in json_data['features'])[["fid","P_NAME_T", "A_NAME_T"]]
district_and_province_names = district_and_province_names.rename(columns={"fid": "id", "P_NAME_T": "province", "A_NAME_T": "district"})
province_names = district_and_province_names["province"]
district_names = district_and_province_names["district"]

# Filter by district name
df_no_date = df.drop("announce_date", axis=1).rename(columns={"province_of_onset": "province", "district_of_onset": "district"})

df_filtered_by_district = df_no_date[df_no_date.district.isin(district_names)]
# Count values by district
df_district_case_14days = df_filtered_by_district.value_counts(sort=True).to_frame(name="caseCount").reset_index()
df_district_case_14days = df_district_case_14days.rename(columns={"province_of_onset": "province", "district_of_onset": "district"})

# Merge only valid district and province pair
df_district_case_14days_with_id = district_and_province_names.merge(df_district_case_14days, how='left', on=['province', 'district'])
df_district_case_14days_with_id = df_district_case_14days_with_id.fillna(0)
df_district_case_14days_with_id["caseCount"] = df_district_case_14days_with_id["caseCount"].astype(int)

# Write df to json
df_district_case_14days_with_id.to_json(district_data_14days_out_path, orient="records", indent=2, force_ascii=False)    

# Filter by province name
df_no_district = df.drop("district_of_onset", axis=1)
df_filtered_by_province = df_no_district[df_no_district.province_of_onset.isin(province_names)]

# Print invalid Province name
df_invalid_province = df_no_district[~df_no_district.province_of_onset.isin(province_names)]
df_invalid_province = df_invalid_province.fillna(0)
with pd.option_context('display.max_rows', None, 'display.max_columns', None):
    print(df_invalid_province[df_invalid_province.province_of_onset != 0])

# Count values by provinces by date
province_cases_each_day = pd.crosstab(df_filtered_by_province.announce_date,
                                      df_filtered_by_province.province_of_onset).to_dict()
# Count values by provinces (for all 14 days)
province_cases_14days = df_filtered_by_province.drop("announce_date", axis=1).value_counts(sort=True)
# Get census data
province_population = {i["province"]: i["population"] for i in
                       json.load(open(CENSUS_DATA_PATH, encoding="utf-8"))}

province_id = {feature["properties"]["PROV_NAMT"]:feature["properties"]["PROV_CODE"] for feature in
               json.load(open(PROVINCE_MAP_PATH, encoding="utf-8"))["features"]}

# Create a dict with all data combined
province_cases_each_day_with_total = [
    {
        "name": name,
        "cases": cases,
        "id": int(province_id[name]),
        "caseCount": int(province_cases_14days[name]),
        "cases-per-100k": (int(province_cases_14days[name]) * 10 ** 5) // province_population[name],
    } for name, cases in province_cases_each_day.items()
]

# Write province data to json file
json_dump(province_cases_each_day_with_total, province_data_14days_out_path)

print("Built province and district cases")
