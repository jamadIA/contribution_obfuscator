# Contribution Obfuscator Script
Simple script that obfuscates the github contribution graph

# Author
This whole script has been handcrafted by one person only, and [that's me](www.github.com/AdamJamro)

### Prerequisites
- Python3.1x, NumPy, Pandas, Pillow (PIL fork)
- github CLI: git, gh
- viu (optionally for in-terminal images)

> NOTE: for such a compact project all that heavy machinery
> is a result of a pure whim, and it'd be easy to replace pd.dataframe
> with regular ugly-ass python lists

## Usage
Use this script to generate a .chart with random noise,
with various parametizable distributions.
Use .chart files with the help of this script to create
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
