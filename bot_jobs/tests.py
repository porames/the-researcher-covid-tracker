import unittest
from util import *

class TestUtils(unittest.TestCase):
    def test_vaccines(self):
        # TODO: test
        pass
    
    def test_pdata(self):
        # TODO: test
        pass
    
    def test_start_end(self):
        # TODO: test
        pass
    
    def test_provinces(self):
        # TODO: test
        pass
    
    def test_moving_average(self):
        a = [6, 3, 5, 7, 1, 4, 8, 12, 3, 95, 4, 23, 12, 38, 1, 5, 4, 17]
        expected = [4.857142857142857, 5.714285714285714, 5.714285714285714, 18.571428571428573, 18.142857142857142, 21.285714285714285, 22.428571428571427, 26.714285714285715, 25.142857142857142, 25.428571428571427, 12.428571428571429, 14.285714285714286]
        moving_ave = moving_average(a)
        self.assertSequenceEqual([round(x * 1e9) for x in moving_ave], [round(x * 1e9) for x in expected])
        self.assertSequenceEqual(moving_average([1,2,3]), [])

if __name__ == '__main__':
    unittest.main()