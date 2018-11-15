"""
This script creates a dataframe and visualizes it's values. Finally, it creates
a .json file containing the dataframes values.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns


def create_df(csvfile):
    """Returns dataframe made from input csv with the necessary values"""

    # create dataframe using specified columns, changing float comma's to dots
    # and changing value "unknown" to NaN
    df = pd.read_csv(csvfile, usecols=[0, 1, 4, 7, 8], quotechar='"',
                     decimal=",", na_values="unknown", keep_default_na=True)

    # strip unwanted whitespace from dataframe
    df["Region"] = df["Region"].str.strip()

    # delete traling "dollars" from GDP column and change values to numbers
    df.iloc[:, 4] = pd.to_numeric(df.iloc[:, 4].str[:-8])

    # check if GDP values exceed highest GDP in the world ($107,709) and if so
    # change value to NaN
    for index, gdp in enumerate(df.iloc[:, 4]):
        if gdp > 107709:
            df.at[index, "GDP ($ per capita) dollars"] = np.nan

    return df


def print_values(df):
    """Calculate the mean, median, mode and standard deviation of the GDP's"""

    gdp_column = df.iloc[:, 4]
    print("The mean GDP is: ", round(gdp_column.mean(), 2))
    print("The median GDP's is: ", int(gdp_column.median()))
    print("The mode GDP's is: ", int((gdp_column.mode())[0]))
    print("The standard deviation of the GDP is: ", round(gdp_column.std(), 2))


def create_plots(df):
    """Show a histogram of the GDP's and a boxplot of the infant mortality"""

    # create histogram to show distribution of worlds GDP's
    plt.hist(df["GDP ($ per capita) dollars"], list(range(0, 60001, 5000)),
             edgecolor='black', linewidth=1.2)

    plt.title("Countries of the world sorted by GDP per capita")
    plt.ylabel("Number of countries")
    plt.xlabel("GDP per capita in dollars")
    plt.xticks(np.arange(0, 60000, step=10000))
    plt.margins(x=0.0052)

    plt.show()

    # create boxplot to show distribution of mortality rate
    boxplot = sns.boxplot(y='Infant mortality (per 1000 births)', data=df,
                          width=0.1, color="darkred")
    boxplot.set_title("Infant mortality boxplot")
    sns.set_style("darkgrid")

    plt.show()


def create_json(df):
    """"Create a .json file with the data from the dataframe"""

    # open new file and use pandas library to create right output
    with open("data.json", "w"):
        df.to_json(path_or_buf="data.json", orient="records", lines=True)


if __name__ == "__main__":

    # create dataframe from input file
    data = create_df("input.csv")

    # print Central Tendency values
    print_values(data)

    # show histogram and boxplot
    create_plots(data)

    # create data.json file
    create_json(data)
