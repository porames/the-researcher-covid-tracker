import pandas as pd
import json
from datetime import datetime


# Load dataset.csv and drop unnecessary column
df = pd.read_csv("../dataset.csv")
df = df.drop(['No.','Notified date','nationality', 'province_of_isolation', 
             'sex', 'age', 'risk', 'Unit', 'Unnamed: 11', 'Unnamed: 12', 'Unnamed: 13'], axis=1)
df["announce_date"] = df["announce_date"].map(lambda date : datetime.strptime(date, "%d/%m/%y")) # Convert day to YYYY-MM-DD


# Filter from start date
start = "2021-06-02"
end = "2021-06-17"
df = df[(df['announce_date'] >= start) & (df['announce_date'] <= end)]


# Change อำเภอ เมือง -> อำเภอ เมือง + จังหวัด
mueng_df = df[df.district_of_onset == "เมือง"]
df.district_of_onset.update(mueng_df.district_of_onset + mueng_df.province_of_onset)


# Load district name in to set
json_data = json.load(open("../../components/gis/geo/th-map-amphoes.json"))
district_names = {district['properties']['A_NAME_T'] for district in json_data['features']}


# Filter by district name
df_filted_by_district = df[df.district_of_onset.isin(district_names)]
df_filted_by_district = df_filted_by_district.drop(["announce_date"], axis=1)


# Count values by district
finished_df = pd.DataFrame(df_filted_by_district.value_counts(sort=True)).rename(columns={0: "caseCount"})


# Write dataframe as json table
with open("../../components/gis/data/amphoes-data-14days.json","w+",encoding="utf-8") as fout :
    finished_df.to_json(fout,orient='table',force_ascii=False)
