import unittest
from util import *
import pandas as pd
import datetime


class TestUtils(unittest.TestCase):
    data = pd.read_csv('tests/dataset.csv')

    def test_vaccines(self):
        vaccines = get_vaccines('tests/provincial-vaccination-data.json')
        with open('tests/vaccines-current.json', 'w') as f:
            json.dump(vaccines, f, default=str)
        with open('tests/vaccines-template.json') as template:
            template_obj = json.load(template)
        with open('tests/vaccines-current.json') as current:
            current_obj = json.load(current)
        self.assertDictEqual(template_obj, current_obj)

    def test_get_provinces_name(self):
        pdata = get_provinces_name('tests/th-provinces-centroids.json')
        with open('tests/pdata-current.json', 'w') as f:
            json.dump(pdata, f, default=str)
        with open('tests/pdata-template.json') as template:
            template_obj = json.load(template)
        with open('tests/pdata-current.json') as current:
            current_obj = json.load(current)
        self.assertSequenceEqual(template_obj, current_obj)

    def test_start_end(self):
        start, end = get_start_end(self.data)
        self.assertEqual(start, datetime.datetime(2020, 12, 15, 0, 0))
        self.assertEqual(end, datetime.datetime(2021, 6, 14, 0, 0))

    def test_provinces(self):
        start, end = get_start_end(self.data)
        provinces = get_provinces(self.data, start)
        with open('tests/provinces-current.json', 'w') as f:
            json.dump(provinces, f, default=str)
        with open('tests/provinces-template.json') as template:
            template_obj = json.load(template)
        with open('tests/provinces-current.json') as current:
            current_obj = json.load(current)
        self.assertDictEqual(template_obj, current_obj)

    def test_moving_average(self):
        a = [6, 3, 5, 7, 1, 4, 8, 12, 3, 95, 4, 23, 12, 38, 1, 5, 4, 17]
        expected = [4.857142857142857, 5.714285714285714, 5.714285714285714, 18.571428571428573, 18.142857142857142, 21.285714285714285, 22.428571428571427, 26.714285714285715, 25.142857142857142, 25.428571428571427, 12.428571428571429, 14.285714285714286]
        moving_ave = moving_average(a)
        self.assertSequenceEqual([round(x * 1e9) for x in moving_ave], [round(x * 1e9) for x in expected])
        self.assertSequenceEqual(moving_average([1, 2, 3]), [])


if __name__ == '__main__':
    unittest.main()
