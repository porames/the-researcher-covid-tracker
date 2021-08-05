from PyPDF2 import PdfFileWriter, PdfFileReader
import requests
from bs4 import BeautifulSoup
import pdfplumber
import re
import pandas as pd
import datetime


START_DATE = "2021-07-02"

def parse_report_by_url(url):
    response = requests.get(url)
    file = open("tmp/daily_slides.pdf", "wb")
    file.write(response.content)
    file.close()

    inputpdf = PdfFileReader(open("tmp/daily_slides.pdf", "rb"))
    output = PdfFileWriter()
    output.addPage(inputpdf.getPage(2))
    with open("tmp/manufacturer_table.pdf", "wb") as outputStream:
        output.write(outputStream)
    with pdfplumber.open("tmp/manufacturer_table.pdf") as pdf:
        first_page = pdf.pages[0]
        text = first_page.extract_text()
        while text.find('  ') != -1:
            text = text.replace('  ', ' ')
        text = text.replace(' ,', '')
        text = text.replace(', ', '')
        text = text.replace(',', '')
        lines = text.split('\n')      
    return lines

def search_manufacturer(report):
    """
    Search through the report for the line with จำแนกตามบริษัท
    and extract data from the following three lines.
    Returns a dict of { manufacturer: doses } 
    """
    items = []
    # Huge brain search. Any better suggestion?
    matching_lines_indices = [i for i, item in enumerate(report) if re.search('จาแนกตามบ', item.replace(" ", ""))]
    if len(matching_lines_indices) == 0:
        return False
    # Index of the first line that matches the regex
    first_matching_line_index = matching_lines_indices[0]
    vaccines_by_manufacturer = {}
    # For the following 3 lines
    for data in report[first_matching_line_index+1:first_matching_line_index+4]:
        data = data.replace(" ราย","")
        data = data.split(" ")
        vaccines_by_manufacturer[data[0]] = int(data[1])
    return vaccines_by_manufacturer

def calculate_rate(df):
    """
    Calculate rate of vaccination based on differences
    of cumulative sums of vaccines
    """
    df['date'] = pd.to_datetime(df['date'])
    # Fill empty dates with previous values
    df.set_index('date', inplace=True)
    df = df.asfreq(freq='D')
    df.reset_index(inplace=True)
    df.fillna(method='ffill', inplace=True)
    # Separate between old data and new ones
    old_df = df[df['date'] < START_DATE].copy()
    new_df = df[df['date'] >= START_DATE].copy()
    # Calculate rate of vaccination based on diff
    new_df.loc[:, 'AstraZeneca_rate'] = new_df.loc[:, 'AstraZeneca'].diff()
    new_df.loc[:, 'Sinopharm_rate'] = new_df.loc[:, 'Sinopharm'].diff()
    new_df.loc[:, 'Sinovac_rate'] = new_df.loc[:, 'Sinovac'].diff()
    new_df = new_df.fillna(0)
    return old_df.append(new_df, ignore_index=True)

df = pd.read_json("../../components/gis/data/vaccine-manufacturer-timeseries.json")
if len(df) > 0:
    latest_date = pd.to_datetime(df.iloc[-1]['date'])
else:
    latest_date = pd.to_datetime(START_DATE)
print(latest_date)
url = "https://ddc.moph.go.th/vaccine-covid19/diaryPresentMonth/" + str((latest_date + pd.DateOffset(1)).month).zfill(2) + "/10/2021"
req = requests.get(url)
soup = BeautifulSoup(req.content, 'html.parser')
manufacturer_timeseries = df
rows = soup.find_all("td", text=re.compile('สไลด์นำเสนอ'))
for row in rows[latest_date.day:len(rows)]:
    tr = row.parent
    report_url = tr.find("a").get("href")
    print('--'+tr.text.strip()+'--')
    print(report_url)
    report = parse_report_by_url(report_url)
    data = search_manufacturer(report)
    latest_date += datetime.timedelta(days=1)
    if data != False:
        data["date"] = latest_date
        manufacturer_timeseries = manufacturer_timeseries.append(data,ignore_index=True)

manufacturer_timeseries = calculate_rate(manufacturer_timeseries)
manufacturer_timeseries['date'] = manufacturer_timeseries['date'].astype(str)

manufacturer_timeseries.to_json("../../components/gis/data/vaccine-manufacturer-timeseries.json",orient="records",indent=2)

print('saved!')
