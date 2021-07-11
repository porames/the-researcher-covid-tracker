from email.utils import encode_rfc2231
import requests

# Get data.go.th COVID-19 cases dataset
print("Downloading Provincial dataset")
url = "https://data.go.th/dataset/8a956917-436d-4afd-a2d4-59e4dd8e906e/resource/be19a8ad-ab48-4081-b04a-8035b5b2b8d6/download/confirmed-cases.csv"
path = "./dataset.csv"

req = requests.get(url)
req.encoding = "tis-620"

if (req.status_code == 200) :
    print("Provincial dataset downloaded")
    with open(path, "w+", encoding="utf-8") as fout :
        fout.write(req.text)
    print("Provincial dataset written to", path)
else :
    print("Error occured while getting datasets")
    print("Error Code :", req.status_code)