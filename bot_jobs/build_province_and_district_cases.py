from util import json_dump
import pandas as pd
import json
import datetime

district_data_14days_out_path = "../components/gis/data/amphoes-data-14days.json"
province_data_14days_out_path = "../components/gis/data/provinces-data-14days.json"
dataset_path = "./dataset.csv"

DISTRICT_MAP_PATH = "../components/gis/geo/th-map-amphoes.json"
CENSUS_DATA_PATH = "./th-census-data.json"


# Load dataset.csv
df = pd.read_csv(dataset_path, encoding="utf-8")

# Drop unnecessary column
df = df.drop(['No.', 'Notified date', 'nationality',
              'sex', 'age', 'risk', 'Unit'], axis=1)
# Convert day to datetime object
df["announce_date"] = df["announce_date"].map(lambda date: datetime.datetime.strptime(date, "%d/%m/%Y").date())

# Filter from start date
end = datetime.datetime.now().date()
start = end - datetime.timedelta(days=14)
df = df[(df['announce_date'] >= start) & (df['announce_date'] <= end)]
# Convert datetime object to YYYY-MM-DD string 
df["announce_date"] = df["announce_date"].map(lambda dto: datetime.datetime.strftime(dto, "%Y-%m-%d"))

# Change อำเภอ เมือง -> อำเภอ เมือง + จังหวัด
mueng_df = df[df.district_of_onset == "เมือง"]
df.district_of_onset.update(mueng_df.district_of_onset + mueng_df.province_of_onset)
df = df.drop('province_of_onset', axis=1)

# Load province and district name in to sets
json_data = json.load(open(DISTRICT_MAP_PATH, encoding="utf-8"))
province_names = set()
district_names = set()
for feature in json_data['features']:
    province_names.add(feature["properties"]["P_NAME_T"])
    district_names.add(feature["properties"]["A_NAME_T"])

# Filter by district name
df_filtered_by_district = df[df.district_of_onset.isin(district_names)].drop("announce_date", axis=1)
# Count values by district
df_district_case_14days = df_filtered_by_district.value_counts(sort=True).to_frame(name="caseCount")
# Create a dict with district data
district_cases_14days = [
    {
        "name": district,
        "province": province,
        "caseCount": case_count,
    } for (district, province), case_count in df_district_case_14days.to_dict()["caseCount"].items()
]

# Write district data to json file
json_dump(district_cases_14days, district_data_14days_out_path)

# Filter by province name
df_filtered_by_province = df[df.province_of_isolation.isin(province_names)].drop("district_of_onset", axis=1)
# Count values by provinces by date
province_cases_each_day = pd.crosstab(df_filtered_by_province.announce_date,
                                      df_filtered_by_province.province_of_isolation).to_dict()
# Count values by provinces (for all 14 days)
province_cases_14days = df_filtered_by_province.drop("announce_date", axis=1).value_counts(sort=True)
# Get census data
province_population = {i['province']: i['population'] for i in
                       json.load(open(CENSUS_DATA_PATH, encoding="utf-8"))}

# Create a dict with all data combined
province_cases_each_day_with_total = [
    {
        "name": name,
        "cases": cases,
        "caseCount": int(province_cases_14days[name]),
        "cases-per-100k": (int(province_cases_14days[name]) * 10 ** 5) // province_population[name],
    } for name, cases in province_cases_each_day.items()
]

# Write province data to json file
json_dump(province_cases_each_day_with_total, province_data_14days_out_path)
