#!/usr/bin/env python
# Name: Thomas Franx
# Student number: 12485640
"""
This script visualizes data obtained from a .csv file
"""
from collections import defaultdict

import csv
import matplotlib.pyplot as plt
import numpy as np

# Global constants for the input file, first and last year
INPUT_CSV = "movies.csv"
START_YEAR = 2008
END_YEAR = 2018

# create default dictionary for storing year and multiple ratings
year_rating_dict = defaultdict(list)

# parse year and ratings from csv file and store in dictionary
with open(INPUT_CSV, newline='') as csvfile:
    reader = csv.DictReader(csvfile)
    for row in reader:
        year_rating_dict[row["Year"]].append(float(row["Rating"]))

# Global dictionary for the data
data_dict = {str(key): [] for key in range(START_YEAR, END_YEAR)}

# calculate average ratings and store in data_dict
for years, ratings in year_rating_dict.items():
    data_dict[years] = sum(ratings)/len(ratings)


if __name__ == "__main__":
    # prepare data for creating bar table
    year_list = []
    rating_list = []
    for year, rating in data_dict.items():
        year_list.append(year)
        rating_list.append(rating - 8.0)
    y_pos= np.arange(len(year_list))

    # create bar table
    plt.bar(y_pos, rating_list, bottom=8.0, align='center', alpha=0.5)
    plt.xticks(y_pos, year_list)
    plt.yticks(np.arange(8, 9.1, step=0.1))
    plt.ylabel("rating")
    plt.title("Average rating of IMDb top 50 by year")

    plt.show()
