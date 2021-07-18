from PyPDF2 import PdfFileWriter, PdfFileReader
import requests
from bs4 import BeautifulSoup
import pdfplumber
import re
import pandas as pd

def parse_report_by_url(url):
    response = requests.get(url)
    file = open("daily_slides.pdf", "wb")
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
          print(text.find('  '))
          text = text.replace('  ', ' ')

        text = text.replace(' ,', '')
        text = text.replace(', ', '')
        text = text.replace(',', '')

        lines = text.split('\n')


    return lines

def search_manufacturer(report):
    found = False
    shift = 0
    items = []
    manufacturers = []
    doses = []
    print('searching')
    for line in report:
        if (found):
            line_items = line.split(' ')
            print(line_items)
            if line_items[2] == 'ราย':
              dose = line_items[1]
              doses.append(int(dose))
              
              manufacturer = line_items[0]
              manufacturers.append(manufacturer)
            else:
              print('break')
              break
        if (line.find('แนกตามบ') >= 0):
            found = True

    for i in range(len(doses)):
        items.append((manufacturers[i], doses[i]))
    items = dict(items)
    
    return(items)

df = pd.read_json("tmp/vaccine-manufacturer-timeseries.json")
if len(df)>0:
    latest_date = pd.to_datetime(df.iloc[-1]['date'])
else:
    latest_date = pd.to_datetime("2021-07-01")
url = "https://ddc.moph.go.th/vaccine-covid19/diaryPresentMonth/0" + str(latest_date.month) + "/10/2021"
req = requests.get(url)
soup = BeautifulSoup(req.content, 'html.parser')
day = latest_date.day
manufacturer_timeseries = df
rows = soup.find_all("td", text=re.compile('สไลด์นำเสนอ'))
for row in rows[latest_date.day:len(rows)]:
    tr = row.parent
    report_url = tr.find("a").get("href")
    print('--'+tr.text.strip()+'--')
    print(report_url)
    report = parse_report_by_url(report_url)
    data = search_manufacturer(report)
    if(data != False):
        if(day+1 < 10):
            data["date"] = "2021-07-0"+str(day+1)
        else:
            data["date"] = "2021-07-"+str(day+1)
        data["date"] = pd.to_datetime(data["date"])
        manufacturer_timeseries = manufacturer_timeseries.append(data,ignore_index=True)
    day += 1

manufacturer_timeseries['date']=manufacturer_timeseries['date'].astype(str)
manufacturer_timeseries.to_json("tmp/vaccine-manufacturer-timeseries.json",orient="records",indent=2)
print('saved!')

