import argparse
import os
import sys
import * from calulator_utils
from datetime import datetime, timedelta
from random import randint
from subprocess import Popen

USAGE = "Usage: git_obfuscate.py [-r REPOSITORY] [-dry] [-h] [-n] [-m] [-p POISSON]"
        "[-t] [-u] [-f FILE] [-d DATE] [-o OFFSET]\n"
        "Choose either random noise to generate a chart or specify a custom one\n"
        "see readme for full description"

import numpy as np
import pandas as pd
from pandas import DataFrame


def parse_csv_graph(filepath: str) -> DataFrame:
    """expects 2 columns of csv (date: 'YYYY-MM-DD', amount: int) pairs"""

    day_names = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ]
    df_index = dict(enumerate(day_names))

    file_path = "contribution_graph.csv"
    df = pd.read_csv(file_path, header=None, comment="#")
    print("-" * 30)
    df["date"] = pd.to_datetime(df[0])
    df["day_of_week"] = (df["date"].dt.dayofweek + 1) % 7
    df["is_sunday"] = (df["day_of_week"] == 0).astype(int)
    df["week_of_year"] = df["is_sunday"].cumsum() - 1
    df["data_tuple"] = list(zip(df[0], df[1]))

    remote_df = df.pivot(
        index="day_of_week",
        columns="week_of_year",
        values="data_tuple",
    )
    # remote_df = remote_df.rename(index=df_index)
    # remote_df = remote_df.reindex(day_names)
    remote_df = remote_df.map(lambda x: ("NA", 0) if pd.isna(x) else x)
    return remote_df


from PIL import Image, ImageDraw


def create_graph_image(df: DataFrame) -> Image.Image:
    """
    expects a dataframe with index of 7 weekdays starting on Sunday
    and with values as tuple of (date: 'YYYY-MM-DD', amount: int) pairs
    """
    tile_size = 12
    padding = 2
    border = 20
    num_rows, num_cols = df.shape
    img_width = num_cols * (tile_size + padding) + border * 2
    img_height = num_rows * (tile_size + padding) + border * 2
    all_values = map(lambda x: x[1], df.values.flatten())
    print(f"image of df: {df}")
    min_value = min(all_values)

    img = Image.new("RGB", (img_width, img_height), color=(50, 40, 60))
    draw = ImageDraw.Draw(img)
    for day_index, (day_name, weeks) in enumerate(df.iterrows()):
        # print(f"day of week: {day_index}, {day_name}")
        for week_col, value in enumerate(weeks):
            # print(f"week: {week_col}, value: {value}")
            if value[0] == "NA":
                continue
            contributions = value[1]

            intensity = int(
                max(10, 255 * np.sqrt(contributions / (max(1, 10 - min_value))))
            )
            x0 = border + week_col * (tile_size + padding)
            y0 = border + day_index * (tile_size + padding)
            x1 = x0 + tile_size
            y1 = y0 + tile_size
            draw.rectangle([x0, y0, x1, y1], fill=(0, intensity, 0))

    for r in range(num_rows):
        for c in range(num_cols):
            x0 = border + c * (tile_size + padding)
            y0 = border + r * (tile_size + padding)
            x1 = x0 + tile_size
            y1 = y0 + tile_size
            draw.rectangle([x0, y0, x1, y1], outline=(70, 70, 120))

    return img


from collections import defaultdict


def parse_chart_file(filepath: str) -> DataFrame:
    """takes the .chart pathfile and parses it into pd.DataFrame"""

    with open(filepath, "r") as file:
        content = file.read()

    day_names = [
        "Sunday",
        "Monday",
        "Tuesday",
        "Wednesday",
        "Thursday",
        "Friday",
        "Saturday",
    ]
    df_index = dict(enumerate(day_names))

    content = content.split("\n")
    header, content = content[:1], content[1:]
    start_date = header[0].replace("-", "")[0:8]
    print(start_date)
    total_days = 0
    max_col = 0

    print(df_index.values())
    contribution_grid = defaultdict(list)
    row_no = 0
    col_no = -1

    for line_no, line in enumerate(content):
        if row_no == 7:
            break
        line = line.strip()
        if not line or line[0] == "#":
            continue
        for char_col, char_value in enumerate(line):
            if char_value == "#":
                break
            if not char_value.isdigit():
                raise Exception(
                    f"Invalid value in chart file ({line_no},{char_col}): letter {char_value}"
                )

            col_no = char_col
            # pad with zeros above
            if max_col < col_no and row_no > 0:
                contribution_grid[col_no] += [0 for _ in range(row_no)]
            contribution_grid[col_no].append(int(char_value))
        # pad with zeros to the right
        while max_col > col_no:
            col_no = col_no + 1
            contribution_grid[col_no].append(0)

        max_col = max(max_col, char_col)
        row_no = row_no + 1
        print(f"line: {line}")

    if row_no != 7:
        raise Exception(f"Chart file has too few rows.")

    start_date = pd.to_datetime(start_date)
    offset = start_date.dayofweek + 1
    dates_offset = ["NA" for _ in range(offset % 7)]
    total_days = 7 * (max_col + 1) - (offset % 7)
    dates = pd.date_range(start=start_date, periods=total_days).strftime("%Y-%m-%d")
    dates = dates.tolist()
    dates = dates_offset + dates

    for index, date in enumerate(dates):
        # print(f"index: {index}, date: {date}")
        row = index % 7
        col = index // 7
        contribution_grid[col][row] = (str(date), contribution_grid[col][row])

    df = DataFrame(contribution_grid, index=df_index)
    return df


def differences_between_dataframes(
    original: DataFrame, desired: DataFrame
) -> DataFrame:
    df = DataFrame(index=desired.index, columns=desired.columns)
    # df = df.map(lambda x: ('NA', 0))
    original = dict(original.values.flatten())
    # print(original)

    for index, row in desired.iterrows():
        df.iloc[index, :] = row.map(
            lambda x: (x[0], max(0, x[1] - original.get(x[0], 0)))
        )
        # print("desired:\n", row)
        # print("diff:\n",df.iloc[index, :],"\n")

    return df


def dataframe_to_csv(df: DataFrame, filepath: str) -> None:
    """
    expects a dataframe with index of 7 weekdays starting on Sunday
    and transforms it into a csv file with given filepath name
    """
    try:
        with open(filepath, "w") as file:
            for index, row in df.iterrows():
                for item in row:
                    if item[0] == 'NA' or item[1] == 0:
                        continue
                    file.write(f"{item[0]},{item[1]}\n")
    except IOError as e:
        print(f"Error writing to {filepath}: {e}")


def main():
    chart_df = parse_chart_file("test_packman.chart")
    chart_img = create_graph_image(chart_df)
    chart_img.save("parsed_chart.png")

    remote_df = parse_csv_graph("contribution_graph.csv")
    remote_img = create_graph_image(remote_df)

    diff_df = differences_between_dataframes(original=remote_df, desired=chart_df)
    diff_img = create_graph_image(diff_df)

    chart_img.show()
    remote_img.show()
    diff_img.show()
    dataframe_to_csv(df=diff_df, filepath="./changes.csv")
    exit(0)

    args = parse_arguments()
    today = datetime.now().strftime("%Y-%M-%d")
    url: str

    if args.repository is None:
        url = "repository-" + today
    else:
        url = args.repository

    #   1) GENERATE RANDOM NOISE
    if args.noise is not None:
        ...

    elif args.file is not None:
        ...
    else:
        print(f"invalid arguemnts. {USAGE}")

    chart = chart


def parse_arguments() -> argparse.ArgumentParser:
    """parses arguemtns as specified."""
    parser = argparse.ArgumentParser()

    #   GENERAL USECASE ARGS
    parser.add_argument(
        "-r",
        "--repository",
        help="specify a repository where the commits will go"
    )
    parser.add_argument(
        "-dry",
        "--dry",
        help="generates images but doesn't commit anything to the repository. if you won't specify repository it's implicitly a dry run",
    )

    #   1) GENERATE RANDOM NOISE
    #
    parser.add_argument(
        "-d",
        "--date",
        type=str,
        help="specify start date NOTE: valid chart should start on a SUNDAY!",
    )
    parser.add_argument(
        "-n", 
        "--noise", 
        help="create chart with random noise"
    )
    parser.add_argument(
        "-m",
        "--max",
        action="store_true",
        help="adjusts maximal amount of contributions per day",
    )
    parser.add_argument(
        "-p",
        "--poisson",
        type=int,
        help="generate noise with poisson distribution with parameter from 1 to 100",
    )
    parser.add_argument(
        "-t",
        "--triangular",
        action="store_true",
        help="generate noise with triangular distribution (i.e. linear descending)",
    )
    parser.add_argument(
        "-u",
        "--uniform",
        action="store_true",
        help="generate noise with uniform distribution",
    )

    #   2) COMMIT CHANGES SPECIFIED BY A .CHART
    #
    parser.add_argument(
        "-f",
        "--file",
        type=str,
        help="speicfy a .chart file"
    )
   parser.add_argument(
        "-o",
        "--offset",
        type=str,
        help="specify day of last update, to opt out of some unnecessary work",
    )

    return parser.parse_args()


if __name__ == "__main__":
    main()
