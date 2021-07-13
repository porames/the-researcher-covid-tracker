import requests
import time

# Get data.go.th COVID-19 cases dataset
print("Downloading Provincial dataset")
url = "https://data.go.th/dataset/8a956917-436d-4afd-a2d4-59e4dd8e906e/resource/be19a8ad-ab48-4081-b04a-8035b5b2b8d6/download/confirmed-cases.csv"
path = "./dataset.csv"

start = time.time()
req = requests.get(url)
req.encoding = "utf-8"

if (req.status_code == 200) :
    print("Provincial dataset downloaded, Took:", time.time()-start, "seconds")
    # Dataset typo corrections
    start = time.time()
    text = req.text.replace("ุุ", "ุ") 
    text = text.replace("เเ", "แ") 
    text = text.replace("อ.", "")
    text = text.replace("จ.", "")
    text = text.replace("กทม", "กรุงเทพมหานคร")
    text = text.replace("กำแพงเพฃร", "กำแพงเพชร")
    text = text.replace("ลพบรี", "ลพบุรี")
    with open(path, "w+", encoding="utf-8") as fout :
        fout.write(text)
    print("Provincial dataset written to", path+",", "Took:", time.time()-start, "seconds")
else :
    print("Error occured while getting datasets")
    print("Error Code :", req.status_code)
