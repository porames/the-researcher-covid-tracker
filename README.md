![bot-taks-scheduler](https://github.com/porames/the-researcher-covid-bot/workflows/bot-taks-scheduler/badge.svg)
## รายงานข้อมูล COVID-19 ในประเทศไทย

ตัวเว็บไซต์พัฒนาโดย JavaScript โดยใช้ Framework NextJS, แสดงผลข้อมูลในรูปแบบกราฟโดยใช้ [visx](https://github.com/airbnb/visx/), แสดงผลข้อมูลในรูปแบบแผนที่โดยใช้ [Mapbox](https://mapbox.com)
ตัวประมวลผลข้อมูลใช้ NodeJS และ Python

### ที่มาข้อมูล

ข้อมูลตำแหน่งที่พบผู้ป่วยประจำวันจาก [กรมควบคุมโรค กระทรวงสาธารณสุข](https://data.go.th/dataset/covid-19-daily)
ข้อมูลจำนวนผู้ป่วยรายวันจาก [กรมควบคุมโรค กระทรวงสาธารณสุข](http://covid19.th-stat.com/json/covid19v2/getTimeline.json)
ข้อมูลจำนวนการฉีดวัคซีนรายวันจาก [รายงานการฉีดวัคซีนประจำวัน กรมควบคุมโรค กระทรวงสาธารณสุข]() ประมวลผลจาก PDF โดยคุณ [Dylan Jay](https://github.com/djay/covidthailand)


### หลักการประมวลผลข้อมูล
 **- ค่าเฉลี่ยช่วง 7 วัน (7-day Moving Average)**
	 คือค่าเฉลี่ยของข้อมูลในช่วงเวลาหนึ่งย้อนหลังไปอีก  6 วัน ทำให้เห็นแนวโน้มของการเปลี่ยนแปลงข้อมูลมีความแปรปรวน