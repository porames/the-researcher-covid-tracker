import pandas as pd
import datetime

# Get data.go.th COVID-19 test dataset
url = "https://data.go.th/dataset/9f6d900f-f648-451f-8df4-89c676fce1c4/resource/0092046c-db85-4608-b519-ce8af099315e/download/thailand_covid-19_testing_data-update-20210710-1.xlsx"

# Download and read excel as df
df = pd.read_excel(url)

# Select a specific column
df = df[['Date','Pos','Total']]
# Remove cannot specify date and time
df = df.drop(0).reset_index(drop=True) 
# Map datatime to YYYY-MM-DD
df["Date"] = df["Date"].map(lambda dto: datetime.datetime.strftime(dto,"%Y-%m-%d"))
df = df[(df['Date'] >= "2021-01-01")]
df = df.rename(columns={"Date": "date", "Pos": "positive", "Total": "tests"})

# Write df as json table
df.to_json("../components/gis/data/testing-data.json",orient="records",indent=2)
