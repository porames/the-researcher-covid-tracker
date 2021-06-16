import datetime
import json
import time
from collections import Counter

import matplotlib.pyplot as plt
import pandas as pd
from pandas.plotting import register_matplotlib_converters

register_matplotlib_converters()

vaccines = {}
with open('../components/gis/data/provincial-vaccination-data.json', encoding='utf-8') as json_file:
    jsondata = json.load(json_file)
    jsondata = jsondata['data']
    for province in jsondata:
        vaccines[province['name']] = round(province['coverage'] * 100, 2)

data = pd.read_csv('dataset.csv')
pdata = []
with open('../components/gis/geo/th-provinces-centroids.json', encoding='utf-8') as json_file:
    jsondata = json.load(json_file)
    for province in jsondata['features']:
        pdata.append(province['properties']['PROV_NAMT'])

lastRow = data.tail(1)
date = list(lastRow['announce_date'])[0].strip()
end = datetime.datetime.strptime(date, '%d/%m/%y')
start = datetime.datetime.strptime("2020-12-15", "%Y-%m-%d")

fulldate = [start + datetime.timedelta(days=x) for x in range((end - start).days)]

provinces = {}
for row in data.iterrows():
    row = dict(row[1])
    province = row['province_of_isolation']
    date = row['announce_date']
    if province in provinces:
        if isinstance(date, str):
            parsedDate = datetime.datetime.strptime(date.strip(), '%d/%m/%y')
            if parsedDate >= start:
                provinces[province].append(parsedDate)
    else:
        provinces[province] = []


def movingAve(ys, N=7):
    cumsum, moving_aves = [0], []
    for i, x in enumerate(ys, 1):
        cumsum.append(cumsum[i - 1] + x)
        if i >= N:
            moving_ave = (cumsum[i] - cumsum[i - N]) / N
            # can do stuff with moving_ave here
            moving_aves.append(moving_ave)
    return moving_aves


images = []
i = 1
for name in provinces:
    if name in pdata:
        start = time.time()
        province = dict(Counter(provinces[name]))
        for day in fulldate:
            if day not in province:
                province[day] = 0
        names = sorted(province)
        ys = [province[day] for day in names]
        moving_aves = movingAve(ys)
        fig = plt.gcf()
        plt.cla()
        fig.set_size_inches(10, 5)
        if max(moving_aves[-14:]) < 10:
            plt.ylim(0, 10)
        else:
            plt.ylim(0, max(moving_aves[-14:]))
        plt.fill_between(names[-14:], 0, moving_aves[-14:], alpha=0.3, color='#dc3545', zorder=2)
        plt.plot(names[-14:], moving_aves[-14:], color='#dc3545', linewidth=25)
        plt.box(False)
        plt.xticks([])
        plt.yticks([])
        plt.savefig('../public/infection-graphs-build/' + str(pdata.index(name) + 1) + '.svg', bbox_inches=0,
                    transparent=True)
        # plt.show()
        print(time.time() - start, name)
        if moving_aves[-14] > 0:
            change = int((moving_aves[-1] - moving_aves[-14]) * 100 / (moving_aves[-14]))
        else:
            change = 0
        images.append({
            "name": str(pdata.index(name) + 1) + ".svg",
            "change": change,
            "total-14days": sum(ys[-14:]),
            "province": name,
            "vax-coverage": vaccines[name]

        })
        i += 1

with open('../components/build_job.json', 'w', encoding='utf-8') as f:
    data = {'images': images, 'job': {
        'ran_on': datetime.date.today().strftime("%m/%d/%Y %H:%M"),
        'dataset_updated_on': end.strftime("%m/%d/%Y %H:%M")
    }}
    json.dump(data, f)

print('done')
