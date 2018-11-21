import csv
import json


def convert(input_file, variables, data_start, data_end):
    with open(input_file, "r") as input_file:
        with open("output.json", "w") as output_file:
            input = csv.DictReader(input_file, variables)
            for index, row in enumerate(input):
                if index >= data_start and index <= data_end:
                    row["periode"] = int(row["periode"].split()[0])
                    json.dump(row, output_file)
                    output_file.write('\n')


if __name__ == "__main__":
    convert("levensverwachting.csv", ("periode", "levensverwachting mannen",
                                      "levensverwachting vrouwen"), 5, 12)
