import csv
import json


def convert(input_file, sort_by, header_line, last_data_line):

    with open(input_file, "r") as input_file:
        with open("cleaned_data.csv", "w") as cleaned_file:

            for index, line in enumerate(input_file):
                if index >= (header_line - 1) and index <= (last_data_line - 1):
                    cleaned_file.write(line)

    with open("cleaned_data.csv", "r") as cleaned_file:
        input = csv.DictReader(cleaned_file)

        data = {}
        for row in input:
            key = "jaar"+row[sort_by].split()[0]
            data[key] = row

    with open("output.json", "w") as output_file:
        output_file.write(json.dumps(data, indent=4))


if __name__ == "__main__":
    convert("levensverwachting.csv", "Perioden", 4, 12)
