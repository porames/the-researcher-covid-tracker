import pandas as pd
import datetime
from collections import Counter
import matplotlib.pyplot as plt
import time
import numpy as np
import json
from matplotlib.dates import DateFormatter
from pandas.plotting import register_matplotlib_converters
register_matplotlib_converters()
vaccines={}
with open('../components/gis/data/provincial-vaccination-data.json', encoding='utf-8') as json_file:
    jsondata=json.load(json_file)
    for province in jsondata:
        vaccines[province['name']]=round(province['coverage']*100,2)
data=pd.read_csv('dataset.csv')
pdata=[]
with open('../components/gis/geo/th-provinces-centroids.json', encoding='utf-8') as json_file:
    jsondata = json.load(json_file)
    for province in jsondata['features']:
        pdata.append(province['properties']['PROV_NAMT'])        

lastRow=data.tail(1)
date=list(lastRow['announce_date'])[0].strip()
end=datetime.datetime.strptime(date,'%d/%m/%y')
start = datetime.datetime.strptime("2020-12-15", "%Y-%m-%d")

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
            parsedDate=datetime.datetime.strptime(date.strip(),'%d/%m/%y')                            
            if(parsedDate>=start):
                provinces[province].append(parsedDate)            
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
images=[]
i=1
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
        fig.set_size_inches(10,5)
        if(max(moving_aves[-14:])==0):
            plt.ylim(0,1)
        else:
            plt.ylim(0,max(moving_aves[-14:]))
        plt.fill_between(names[-14:],0,moving_aves[-14:], alpha=0.3, color='#dc3545', zorder=2)
        #plt.fill_between(names[6:len(names)-13],0,moving_aves[:len(moving_aves)-13], alpha=0.3, color='#fa9ba4', zorder=2)
        #plt.plot(names[6:],moving_aves, color='#fa9ba4',linewidth=2)
        #plt.bar(names, ys, width=0.9,color='#fa9ba4', alpha=0.2)
        plt.plot(names[-14:],moving_aves[-14:], color='#dc3545',linewidth=25)         
        plt.box(False)
        #plt.tick_params(axis='y',length=16, width=2,direction='in',color='#e0e0e0',pad=10)        
        #plt.tick_params(axis='x',length=0, pad=10)
        #plt.xticks([min(names), max(names)],fontsize=24, color='#e0e0e0')        
        #plt.gca().xaxis.set_major_formatter(DateFormatter('%d %b'))
        print(ys)
        plt.xticks([])
        plt.yticks([])
        plt.savefig('../public/infection-graphs-build/'+str(pdata.index(name)+1)+'.svg',bbox_inches=0, transparent=True)        
        #plt.show()
        print(time.time()-start, name)
        change = int((moving_aves[-1]-moving_aves[-14])*100/(moving_aves[-14]))
        images.append({
            "name": str(pdata.index(name)+1)+".svg",
            "change": change,
            "total-14days": sum(ys[-14:]),
            "province": name,
            "vax-coverage": vaccines[name]
            
        })
        i+=1

with open('../components/build_job.json', 'w', encoding='utf-8') as f:
    data={'images': images, 'job': {
        'ran_on': datetime.date.today().strftime("%m/%d/%Y %H:%M"),
        'dataset_updated_on': end.strftime("%m/%d/%Y %H:%M")
    }}
    json.dump(data, f)
    f.close()
print('done')
