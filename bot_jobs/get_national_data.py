import pandas as pd

URL = "https://raw.githubusercontent.com/wiki/djay/covidthailand/combined.csv"
START_DATE = "2021-01-01"

# Get national data from URL
df = pd.read_csv(URL)

# Select Column and rename
df = df[["Date", "Hospitalized", "Cases", "Deaths"]]

# Fill missing value with data from previous day
df["Hospitalized"].ffill(inplace=True)
df.fillna(0, inplace=True)
df[["Hospitalized", "Cases", "Deaths"]] = df[["Hospitalized", "Cases", "Deaths"]].astype(int)
df = df.rename(columns={"Cases": "NewConfirmed", "Deaths": "NewDeaths", "Date": "date"})

# Calculate cumulative sum for each day
df["Deaths"] = df["NewDeaths"].cumsum()
df["Confirmed"] = df["NewConfirmed"].cumsum()

# Filter data from start date
df = df[df["date"] >= START_DATE]

# Write data to json
df.to_json("../components/gis/data/national-timeseries.json", orient="records", indent=2)
