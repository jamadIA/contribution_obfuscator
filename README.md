# Contribution Obfuscator Script
Simple script that obfuscates the github contribution graph

It sole purpose to shove some actual logic into a similar project that had a cool web UI contribution painter I found [here](https://github.com/mattrltrent/github_painter)

# Author
This project has been handcrafted by one person only, and that person was [me](www.github.com/AdamJamro)

### Prerequisites
- Python3.1x, NumPy, Pandas, Pillow (PIL fork)
- github CLI: git, gh
- viu (optionally for in-terminal images)

> NOTE: for such a compact project all that heavy machinery
> is a result of a pure whim, and it'd be easy to replace pd.dataframe
> with some implementation of 2d matrices using even bultins for simplicity sake

### Features
automatically generated random noise charts with parametrizable distributions, custom chart UI editor (based on [someone else's github painter](https://github.com/mattrltrent/github_painter)
When used with github CLI it automatically calculates differences between desired and remote charts and commits only missing commits.

## Usage

Make sure you're logged into the desired github account via the gh CLI

```
gh auth login
```

generate a .chart file with random noise.
You can then use the .chart file to create
lists of commits with the desired dates.

For detailed description of .chart files see the test.chart
```
./tests/test.chart
```

### Generating a .chart


### Using .chart files (e.g. custom)


### Running periodically
For continuous usecase you need to run the script periodically.
Even though the scale of computatuion doesn't necessitate it for best performance usethe special flag --append. This will make the script remember last update date, by default it does it with a day offset so that it would incomporate real changes and try to mitigate it's influence on the desired chart from the .chart file


TODO delete:

# OPTIONS
usage: your_script_name.py [-r REPOSITORY] [-dry] [-h] [-n] [-m] [-p POISSON]
                           [-t] [-u] [-f FILE] [-d DATE] [-o OFFSET]

---

## General Options

These options control the overall behavior of the script.

* **-r, --repository REPOSITORY**
    Specify the **repository** where the commits will be pushed. This is where your generated changes will be applied.

* **-dry, --dry**
    When this flag is present, the script will generate images but **will not commit** anything to the specified repository. If you don't specify a repository using `-r` or `--repository`, a dry run is **implicitly** performed.

* **-h, --help**
    Displays this verbose usage message, providing detailed information about all available arguments and their functions.

---

## Generate Random Noise

Use these options to create charts based on various random noise distributions.

* **-n, --noise**
    Activates the **random noise generation** mode, instructing the script to create a chart filled with random contributions.

* **-m, --max**
    When used with noise generation, this flag **adjusts the maximal amount of contributions** that can occur per day. This allows you to control the density of your generated contribution chart.

* **-p, --poisson POISSON**
    Generates noise using a **Poisson distribution**. You must provide an integer parameter between **1 and 100** (inclusive) to specify the $\lambda$ (lambda) value for the distribution.

* **-t, --triangular, --triangular**
    Generates noise using a **triangular distribution**. This will typically result in a linear descending pattern of contributions.

* **-u, --uniform, --uniform**
    Generates noise using a **uniform distribution**, ensuring an even spread of contributions across the days.

---

## Push Changes from a .chart File

Use these options to apply changes to your repository based on a predefined `.chart` file.

* **-f, --file FILE**
    Specify the path to a **.chart file** that contains the contribution data. The script will read this file to determine the commit pattern.

* **-d, --date DATE**
    Specify the **start date** for applying the chart data. It's crucial that a valid chart begins on a **Sunday**. The date should be provided in a string format that the script can parse (e.g., "YYYY-MM-DD").

* **-o, --offset OFFSET**
    Specify the **day of the last update** to optimize the process. This allows the script to avoid re-processing unnecessary work that has already been completed, speeding up subsequent runs.

