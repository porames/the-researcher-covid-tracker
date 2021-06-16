from util import *

import time
import matplotlib.pyplot as plt
from pandas.plotting import register_matplotlib_converters
import datetime

register_matplotlib_converters()

data = pd.read_csv('dataset.csv')
start, end = get_start_end(data)
provinces = get_provinces(data, start)
provinces_name = get_provinces_name('../components/gis/geo/th-provinces-centroids.json')
vaccines = get_vaccines('../components/gis/data/provincial-vaccination-data.json')

images = []
i = 1
for name in provinces:
    if name in provinces_name:
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
        plt.savefig('../public/infection-graphs-build/' + str(provinces_name.index(name) + 1) + '.svg', bbox_inches=0,
                    transparent=True)
        print(time.time() - start, name)
        if moving_aves[-14] > 0:
            change = int((moving_aves[-1] - moving_aves[-14]) * 100 / (moving_aves[-14]))
        else:
            change = 0
        images.append({
            "name": str(provinces_name.index(name) + 1) + ".svg",
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
