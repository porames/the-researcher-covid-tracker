import pandas as pd

URL = "https://raw.githubusercontent.com/wiki/djay/covidthailand/combined.csv"
USE_COL = ["Hospitalized", "Cases", "Deaths"]
START_DATE = "2021-01-01"

# Get national data from URL
df = pd.read_csv(URL)

# Select Column and rename
df = df[["Date",] + USE_COL]
df = df.fillna(0)
df[USE_COL] = df[USE_COL].astype(int)
df = df.rename(columns={"Cases": "NewConfirmed", "Deaths": "NewDeaths"})

# Calculate cumulative sum for each day
df["Deaths"] = df["NewDeaths"].cumsum()
df["Confirmed"] = df["NewConfirmed"].cumsum()

# Filter data from start date
df = df[df["Date"] >= START_DATE]

# In case of invalid data set value to be the last corrected date
if df.iloc[-1 ,df.columns.get_loc("Hospitalized")] == 0 :
    df.iloc[-1 ,df.columns.get_loc("Hospitalized")] = df.iloc[-2 ,df.columns.get_loc("Hospitalized")]
if df.iloc[-1 ,df.columns.get_loc("Deaths")] == 0 :
    df.iloc[-1 ,df.columns.get_loc("Deaths")] = df.iloc[-2 ,df.columns.get_loc("Deaths")]
if df.iloc[-1 ,df.columns.get_loc("Confirmed")] == 0 :
    df.iloc[-1 ,df.columns.get_loc("Confirmed")] = df.iloc[-2 ,df.columns.get_loc("Confirmed")]

# Write data to json
df.to_json("../components/gis/data/national-timeseries.json", orient="records", indent=2)
