#!/usr/bin/env python
# Name: Thomas Franx
# Student number: 12485640
"""
This script scrapes IMDB and outputs a CSV file with highest rated movies.
"""

import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup

TARGET_URL = "https://www.imdb.com/search/title?title_type=feature&release_date=2008-01-01,2018-01-01&num_votes=5000,&sort=user_rating,desc"
BACKUP_HTML = 'movies.html'
OUTPUT_CSV = 'movies.csv'


def extract_movies(dom):
    """
    Extract a list of highest rated movies from DOM (of IMDB page).
    Each movie entry should contain the following fields:
    - Title
    - Rating
    - Year of release (only a number!)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """
    # create output list
    output_list = []

    # loop over movie data from parsed html page
    for movies in dom.find_all("div", class_="lister-item mode-advanced"):

        # create list for current movie
        movie_list = []

        # find movie title and append current movie list
        title = movies.find("h3").find("a").text
        movie_list.append(title)

        # find movie rating and append to current movie list
        rating = movies.find("div", class_="inline-block ratings-imdb-rating").find("strong").text
        movie_list.append(float(rating))

        # find movie release year
        year_raw = movies.find("span", class_="lister-item-year text-muted unbold").text.split()

        # get rid of unnecessary data
        if len(year_raw) == 1:
            year = year_raw[0]
        else:
            year = year_raw[1]

        # get rid of brackets and append release year to current movie list
        year = year[1:len(year) - 1]
        movie_list.append(int(year))

        # create temporary list to store actor names
        temp_list = []

        # find movie actor data and iterate over data
        actor_data = movies.find("p", class_="sort-num_votes-visible").find_previous_sibling().stripped_strings
        for index, actor in enumerate(actor_data):

            # get rid of unnecessary comma's and append data to temporary list
            if len(actor) > 1:
                temp_list.append(actor)

            # erease unnecessary data from temporary list
            if "Stars:" in actor:
                temp_list = temp_list[index + 1:len(temp_list)]

        # join temporary actor list and append to current movie list
        actors = ", ".join(temp_list)

        # create value for movie without actors
        if actors == "":
            actors = "-"

        # append actors to current movie list
        movie_list.append(actors)

        # find movie runtime an append to current movie list
        runtime = movies.find("p", class_="text-muted").find("span", class_="runtime").text
        movie_list.append(runtime)

        # append current movie list to output list
        output_list.append(movie_list)

    return output_list

def save_csv(outfile, movies):
    """
    Output a CSV file containing highest rated movies.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Year', 'Actors', 'Runtime'])

    for movie in movies:
        writer.writerow([movie[0], movie[1], movie[2], movie[3], movie[4]])

def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the movies (using the function you implemented)
    movies = extract_movies(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, movies)
