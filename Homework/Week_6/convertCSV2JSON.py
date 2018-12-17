import csv
import json


def convert(input_file, sort_by, header_line, last_data_line):

    with open(input_file, "r") as input_file:
        with open("cleaned_data.csv", "w") as cleaned_file:

            for index, line in enumerate(input_file):
                if index >= (header_line - 1) and index <= (last_data_line - 1):
                    line = line[1:-27]+"\n"
                    cleaned_file.write(line)

    with open("cleaned_data.csv", "r") as cleaned_file:
        with open("country_codes.json", "r") as country_file:
            input = csv.DictReader(cleaned_file)
            country_codes = json.load(country_file)

            data = {}
            for row in input:
                key = row[sort_by]

                # add country codes to output.json
                for country in country_codes:
                    if country_codes[country]["name"] == key:
                        row.update({"country-code":country_codes[country]["alpha-3"]})
                data[key] = row

    with open("output.json", "w") as output_file:
        output_file.write(json.dumps(data, indent=4))


if __name__ == "__main__":
    convert("hpi-data-2016.csv", "Country", 6, 146)
