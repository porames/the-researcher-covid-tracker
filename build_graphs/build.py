import pandas as pd
import datetime
from collections import Counter
import matplotlib.pyplot as plt
import time
import numpy as np
import json
from matplotlib.dates import DateFormatter
data=pd.read_csv('data-9-jan-2021.csv')
pdata=[]
with open('th-provinces-centroids.json') as json_file:
    jsondata = json.load(json_file)
    for province in jsondata['features']:
        pdata.append(province['properties']['PROV_NAMT'])        
start = datetime.datetime.strptime("2020-12-15", "%Y-%m-%d")
end = datetime.datetime.strptime("2021-01-11", "%Y-%m-%d")
date_generated = [start + datetime.timedelta(days=x) for x in range(0, (end-start).days)]
fulldate=[]
for date in date_generated:
    fulldate.append(date)        
provinces={}
for row in data.iterrows():
    row = dict(row[1])
    province = row['province_of_isolation']
    date = row['announce_date']
    if province in provinces:
        if(isinstance(date, str)):
            date=datetime.datetime.strptime(date,'%m/%d/%Y %H:%M')
            if(date>=start):
                provinces[province].append(date)    
    else:
        provinces[province]=[]
        
def movingAve(ys):
    N = 7
    cumsum, moving_aves = [0], []

    for i, x in enumerate(ys, 1):
        cumsum.append(cumsum[i-1] + x)
        if i>=N:
            moving_ave = (cumsum[i] - cumsum[i-N])/N
            #can do stuff with moving_ave here
            moving_aves.append(moving_ave)
    return(moving_aves)

for name in provinces.keys():
    if(name in pdata):
        start=time.time()
        province=dict(Counter(provinces[name]))
        names=list(province.keys())
        values=list(province.values())
        for day in fulldate:
            if(day not in names):
                province[day]=0
        names=sorted(province)
        ys=[]
        for day in names:
            ys.append(province[day])

        moving_aves=movingAve(ys)

        fig = plt.gcf()        
        plt.cla()
        #fig.set_size_inches(10,8)
        if(max(ys)==0):
            plt.ylim(0,1)
        else:
            plt.ylim(0,max(ys))
        plt.fill_between(names[-14:],0,moving_aves[-14:], alpha=0.5, color='#dc3545', zorder=2)
        plt.plot(names[6:],moving_aves, color='#dc3545',linewidth=2, alpha=0.6)
        plt.bar(names, ys, width=0.9,color='#fa9ba4', alpha=0.6)
        plt.plot(names[-14:],moving_aves[-14:], color='#dc3545',linewidth=2)         
        
        
        plt.box(False)
        plt.tick_params(axis='y',length=16, width=2,direction='in',color='#e0e0e0',pad=10)        
        #plt.tick_params(axis='x',length=0, pad=10)
        #plt.xticks([min(names), max(names)],fontsize=24, color='#e0e0e0')        
        plt.xticks([])
        plt.gca().xaxis.set_major_formatter(DateFormatter('%d %b'))
        plt.yticks([max(ys)],fontsize=24, color='#e0e0e0')
        plt.savefig('export/'+str(pdata.index(name)+1)+'.svg',bbox_inches=0, transparent=True)        
        #plt.show()
        print(time.time()-start, name)

images=[]
for name in provinces.keys():
    if(name in pdata):
        fid = pdata.index(name)+1
        province=dict(Counter(provinces[name]))
        names=list(province.keys())
        values=list(province.values())
        for day in fulldate:
            if(day not in names):
                province[day]=0
        names=sorted(province)
        ys=[]
        for day in names:
            ys.append(province[day])
        
        moving_aves=movingAve(ys)

        change = moving_aves[-1]-movingAve(ys)[-14]
        images.append({
            'name':str(fid)+'.svg',
            'change': change,
            'total-14days': sum(ys[-14:]),
            'max': max(ys),
            'province': name
        })

with open('export/built_images.json', 'w') as f:
    json.dump(images, f)
    f.close()
print('done')        