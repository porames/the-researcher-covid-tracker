import datetime
import json
import time

import matplotlib.pyplot as plt
import pandas as pd
from pandas.plotting import register_matplotlib_converters
import numpy as np

register_matplotlib_converters()

from util import *

vaccines = get_vaccines()
data = pd.read_csv('dataset.csv')
pdata = get_pdata()
start, end = get_start_end(data)
provinces = get_provinces(data, start)

images = []
i = 1
for name in provinces:
    if name in pdata:
        start = time.time()
        province = provinces[name]
        names = sorted(province)
        ys = [province[day] for day in names]
        moving_aves = moving_average(ys)
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
