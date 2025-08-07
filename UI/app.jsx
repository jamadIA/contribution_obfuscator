const { useState, useMemo, useCallback, useEffect, useRef } = React;

const Download = ({styling = ""}) => {
  return (
    <div className={ "grid place-items-center " + (styling || "w-24 h-24") }>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
    </div>
  )
};

const Calendar = ({styling}) => {
  return (
    <div className={ "grid place-items-center " + (styling || "w-24 h-24") }>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M16 2v4"/><path d="M3 10h18"/><path d="M8 2v4"/><path d="M17 14h-6"/><path d="M13 18H7"/><path d="M7 14h.01"/><path d="M17 18h.01"/></svg>
    </div>
  )
};

const Edit = ({styling}) => {
  return (
    <div className={ "grid place-items-center " + (styling || "w-24 h-24") }>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.174 6.812a1 1 0 0 0-3.986-3.987L3.842 16.174a2 2 0 0 0-.5.83l-1.321 4.352a.5.5 0 0 0 .623.622l4.353-1.32a2 2 0 0 0 .83-.497z"/><path d="m15 5 4 4"/></svg>
    </div>
  )
};

const ChevronDown = ({styling}) => {
  return (
    <div className={ "grid place-items-center " + (styling || "w-24 h-24") }>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
    </div>
  )
}

const ChevronUpDown = ({styling}) => {
  return (
    <div className={ "grid place-items-center " + (styling || "w-24 h-24") }>
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7 15 5 5 5-5"/><path d="m7 9 5-5 5 5"/></svg>
    </div>
  );
}

const Dropdown = (props) => {
  const [selected, setSelected] = useState(props.defaultOption || '');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const options = props.options;
  const onSelect = props.onSelect;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      >
        <span className={selected ? 'text-gray-900' : 'text-gray-500'}>
          {selected || 'choose...'}
        </span>
        <ChevronDown
          styling={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'transform rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-md shadow-lg z-50">
          <div className="py-1 max-h-60 overflow-auto">
            {options.map((option, index) => (
              <button
                key={index}
                onClick={() => {
                  setSelected(option);
                  onSelect(option);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-150 ${
                  selected === option 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-900'
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

const dateAsString = (date) => (String(date));

const groupByAsArray = (data, keyFn) => (Object.values(Object.groupBy(data, keyFn)));

const smoothstep = (minThreshold, maxThreshold) => (value) => {
  const x = ((value - minThreshold) / (maxThreshold - minThreshold));
  return x <= 0 ? 0 :
         x >= 1 ? 1 :
         (3-2*x)*x*x;
}

const getDaysAmountBetween = (startDate, endDate) => Math.round((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;

const linearTransform = (min, max, inputMin = 0, inputMax = 1) => value => min + (max - min) * (value - inputMin) / (inputMax - inputMin);

const quantize = precision => value => Math.round(value / precision) * precision;

const compose = (...fns) => (...args) => fns.reduceRight((acc, fn) => fn(acc), args);

const curry = fn => (...args) => // actually a fancier curry that broadcasts args
  fn.length > args.length ?
    (...nextArgs) => fn(...args, ...nextArgs)
    : fn(...args.slice(0, fn.length));

const clamp = (min, max) => compose(curry(Math.max)(min), curry(Math.min)(max));

const randomIntInRange = (min, max) => compose(Math.floor, linearTransform(min,max))(Math.random());

const useCache = (...states) => {
  states.forEach((state, stateIndex) => {
    useEffect(() => {
      localStorage.setItem(state.name, JSON.stringify(state.ref));
    }, [state.ref]);
  });
};

const ContributionChartEditorApp = () => {
  const today = useMemo(() => new Date());
  const [selectedYear, setSelectedYear] = useState(() => {
    const saved = localStorage.getItem('selectedYear');
    return saved ? JSON.parse(saved) : today.getFullYear();
  });
  const [maxContributionsPerDay, setMaxContributionsPerDay] = useState(() => {
    const saved = localStorage.getItem('maxContributionsPerDay');
    return saved ? JSON.parse(saved) : 10;
  });
  const [footerHeight, setFooterHeight] = useState(200);
  const [isFooterMinimized, setIsFooterMinimized] = useState(false);
  const [iframeUrl, setIframeUrl] = useState('http://localhost:8888');
  const [isAnimating, setIsAnimating] = useState(true);
  useCache(
    { ref: selectedYear, name: 'selectedYear' }, 
    { ref: maxContributionsPerDay, name: 'maxContributionsPerDay' }, 
    //{ ref: isAnimating, name: 'isAnimating' }
  );

  const cellStyles = useMemo(() => {
    const getBackgroundSaturation = compose(
      quantize(100),
      linearTransform(200, 700),
      smoothstep(0, 1)
    );
    const sizeBuckets = [5,6,7];
    const getDigitsLengthClamped = compose(
      curry(Math.min)(sizeBuckets.length - 1),
      curry(Math.max)(0),
      Math.floor,
      Math.log10,
    );
    const cellSize = sizeBuckets[getDigitsLengthClamped(maxContributionsPerDay)];
    const newStyles = Array.from({ length: maxContributionsPerDay }, (_, index) => {
      const background = 'bg-green-' + String(getBackgroundSaturation(index/maxContributionsPerDay));
      return [background, 'w-'+cellSize, 'h-'+cellSize];
    });
    newStyles[0].forEach((element, index) => {
      if (element.startsWith('bg')) {
        newStyles[0][index] = 'bg-gray-200';
      }
    });
    return newStyles;
  }, [maxContributionsPerDay]);
  const cellStyleCalculator = (count) => cellStyles[clamp(0, maxContributionsPerDay - 1)(count)];

  const cellTextStyles = useMemo(() => {
    const getTextColor = compose(
      curry(Math.min)(950),
      curry(Math.max)(50),
      quantize(100),
      (x) => Math.abs(x - 350) < 200 ? 149 : x, // cut out the text-gray-mid on bg-green-mid
      linearTransform(1000, 0),
      smoothstep(0,1),
    );
    console.log("maxCOunt: " + maxContributionsPerDay);
    return Array.from( { length: maxContributionsPerDay }, (_, index) => 
      [ 'text-gray-' + String(getTextColor(index/maxContributionsPerDay)) ]
    );
  }, [maxContributionsPerDay]);
  const cellTextStyleCalculator = (count) => cellTextStyles[clamp(0, maxContributionsPerDay - 1)(count)];

  const generateChartCellsInYear = useCallback((year, maxCount) => {
    const dates = [];
    const startDate = new Date(year, 0, 1); // Start of current year
    const currentDate = new Date(startDate);

    while (currentDate.getFullYear() === Number(year)) {
      const date = new Date(currentDate);
      currentDate.setDate(currentDate.getDate() + 1);
      dates.push({
        date: date,
        dateStr: dateAsString(date),
        contributions: Math.floor(Math.random() * (maxCount + 1)) // TODO: default to zero
      });
    }
    console.log('chart data list:' + dates.map((element) => Object.values(element)));
    return dates;
  }, []);
  const randomChart = useCallback((year, maxCount) => {
    const dateData = generateChartCellsInYear(year, maxCount)
      .filter(({date}) => (Number(year) === date.getFullYear()))
      .map(data => ({
        ...data,
        date: data.date instanceof Date ? data.date : Date(data.date)
      }))
      .sort((a, b) => a.date - b.date);
    //date_span = getDaysAmountBetween(dateData.at(0), dateData.at(-1));
    const sundayOffset = dateData.at(0).date.getDay();
    const weeks = groupByAsArray(dateData, ({date}) => {
      const dayOfYear = getDaysAmountBetween(dateData.at(0).date, date);
      return Math.floor((dayOfYear + sundayOffset - 1) / 7);
    });
    const months = groupByAsArray(weeks, weekDays => weekDays.at(-1).date.getMonth());
    console.log(months);
    const sundayOffsetArray = Array(sundayOffset).fill({ contributions: 0, dateStr: "", date: null });
    weeks[0].unshift(...sundayOffsetArray);

    console.log(weeks);
    return months
  }, []);

  const [chartData, setChartData] = useState(() => randomChart(selectedYear, maxContributionsPerDay))

  //useEffect(() => {
  //let maxContributionsCount = 0;
  //chartData.forEach((month, monthIndex) => { // abstract away iteration to a function
  //  month.forEach((week, weekIndex) => {
  //    week.forEach((day, dayIndex) => {
  //      if (day.date) {
  //        maxContributionsCount = Math.max(day.contributions, maxContributionsCount);
  //      }
  //    });
  //  });
  //});
  //console.log("calced maxContributionsPerDay: "+maxContributionsCount);
  //setMaxContributionsPerDay((_) => maxContributionsCount);
  //}, [chartData]);

  // Handle cell click to edit contributions
  const handleCellClick = (monthIndex, weekIndex, dayIndex, delta=1) => {
    setChartData(prev => {
      const newData = structuredClone(prev);
      const cellReference = prev[monthIndex][weekIndex][dayIndex];
      newData[monthIndex][weekIndex][dayIndex].contributions = Math.max(0, cellReference.contributions + delta) % (maxContributionsPerDay + 1);
      //console.log();
      return newData;
    });
  };


  const intervalRef = useRef(null);
  useEffect(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (isAnimating) {
      intervalRef.current = setInterval(() => {
        setChartData(prev => {
          const newData = structuredClone(prev);
          newData.forEach((month, monthIndex) => {
            month.forEach((week, weekIndex) => {
              week.forEach((day, dayIndex) => {
                if (Math.random() < 0.5) {
                  return;
                }
                const delta = compose(
                  Math.round,
                  ((frac) => linearTransform(-frac, frac))(0.1*maxContributionsPerDay)
                )(Math.random());
                newData[monthIndex][weekIndex][dayIndex].contributions = compose(
                  (x) => (x % (maxContributionsPerDay + 1)),
                  curry(Math.max)(0),
                  (x) => (x + delta),
                  (x) => (Number(x))
                )(prev[monthIndex][weekIndex][dayIndex].contributions);
              });
            });
          });
          return newData;
        });
        //const randomMonth = randomIntInRange(0, chartData.length - 1);
        //const randomWeek = randomIntInRange(0, chartData[randomMonth].length - 1);
        //const randomDay = randomIntInRange(0, chartData[randomMonth][randomWeek].length - 1);
        //handleCellClick(randomMonth, randomWeek, randomDay, 2 * Math.round(Math.random()) - 1);
      }, 16);
    }
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isAnimating, maxContributionsPerDay]);
  
  useEffect(() => {
    function handleClickOnGrid(event) {
      if (document.getElementById("graph-editor-grid").contains(event.target)) {
        setIsAnimating(false);
      }
    }

    document.addEventListener('mousedown', handleClickOnGrid);
    return () => {
      document.removeEventListener('mousedown', handleClickOnGrid);
    };
  }, []);





  const generateTextFile = () => {
    const content = chartData
      .map(item => `${item.date}: ${item.contributions} contributions`)
      .join('\n');

    // Create and download the file
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'contribution-data.txt';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  //// Organize data into weeks for display
  //Const organizeIntoWeeks = () => {
  //  const weeks = [];
  //  for (let i = 0; i < chartData.length; i += 7) {
  //    weeks.push(chartData.slice(i, i + 7));
  //  }
  //  return weeks;
  //};

  //Const weeks = organizeIntoWeeks();

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar styling="w-8 h-8 text-green-600" />
            <h1 className="text-2xl font-bold text-gray-900">GitHub Contribution Chart Editor</h1>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <Edit styling="w-4 h-4" />
            <span>Click cells to edit contributions</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-6 pb-0">
        <div className="max-w-8xl mx-auto">
          {/* Chart Container */}
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            {/* chart header */}
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Contribution Chart</h2>
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span>Less</span>
                <div className="flex space-x-1">
                  <div className="w-3 h-3 bg-gray-200 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-200 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-400 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-700 rounded-sm"></div>
                  <div className="w-3 h-3 bg-green-900 rounded-sm"></div>
                </div>
                <span>More</span>
              </div>
            </div>

            {/* Options */}
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-1">
                <div className="p-2">
                  {/*<h2 className="text-,d font-semibold text-gray-800 mb-4">
                    Year
                  </h2>*/}
                  <Dropdown defaultOption={String(today.getFullYear())}
                    options={Array.from({length: 10}, (_, index) => String(2028-index))}
                    onSelect={(option) => {
                      const year = Number(option);
                      setSelectedYear((_) => year);
                      setChartData((_) => randomChart(year, maxContributionsPerDay));
                    }}
                  />
                </div>
                <div className="p-2 flex items-center space-between">
                  <h2 className="text-md font-semibold text-gray-800 mr-2">
                    Maximum Contributions
                  </h2>
                  <Dropdown defaultOption={String(maxContributionsPerDay)}
                    options={['3','5','10','50','100']}
                    onSelect={(option) => {
                      const maxCount = Number(option);
                      setMaxContributionsPerDay((_) => maxCount); 
                      setChartData((_) => randomChart(selectedYear, maxCount)); 
                    }}
                  />
                </div>
              </div>
              <div className="flex flex-row-reverse space-x-reverse space-x-2 m-2 mb-4">
                <button className="h-7 px-2 bg-green-200 hover:bg-green-400 text-black rounded-lg font-medium transition-colors shadow-sm"
                >random shuffle</button>
                <button className="h-7 px-2 bg-green-200 hover:bg-green-400 text-black rounded-lg font-medium transition-colors shadow-sm"
                >{isAnimating ? "stop animation" : "resume animation"}</button>
                <button className="h-7 px-2 bg-green-200 hover:bg-green-400 text-black rounded-lg font-medium transition-colors shadow-sm"
                >clear</button>
              </div>
            </div>

            {/* Contribution Grid */}
            <div id="graph-editor-grid" className="overflow-x-auto grid place-items-center">
              <div className="flex flex-row space-x-0.5 min-w-max">
                {chartData.map((month, monthIndex) => (
                  <div>
                    <div key={`${monthIndex}`} className="flex flex-row space-x-0.5">
                      {month.map((week, weekIndex) =>
                        <div key={`${monthIndex}-${weekIndex}`} className="flex flex-col space-y-0.5">
                          {week.map((day, dayIndex) =>
                            <div
                              key={`${monthIndex}-${weekIndex}-${dayIndex}`}
                              className={`text-center rounded-sm select-none flex items-center justify-center ${
                                day.date ? (
                                  'cursor-pointer shadow-sm transition-all hover:ring-2 hover:ring-green-400 ' +
                                  cellStyleCalculator(day.contributions).join(' ')
                                )
                                : (cellStyleCalculator(day.contributions)
                                    .filter(style => style.startsWith("w") || style.startsWith("h"))
                                    .join(' ')
                                  + ' bg-white')
                              }`}
                              onClick={ day.date ? () => handleCellClick(monthIndex, weekIndex, dayIndex) : undefined }
                              title={`${day.dateStr}: ${day.contributions} contributions`}
                            >
                              <p className={`font-light italic text-sm ${
                                cellTextStyleCalculator(day.contributions)
                              }`}>{day.date ? day.contributions : ""}</p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                    <span>{month[0].at(-1).date.toLocaleDateString(undefined, { month: 'short' })}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <div className="flex justify-center mb-6">
            <button
              onClick={generateTextFile}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg font-medium transition-colors shadow-sm"
            >
              <Download styling="w-5 h-5" />
              <span>Generate Text File</span>
            </button>
          </div>
        </div>
      </main>

      {/* Adjustable Footer with Iframe */}
      <footer
        className="sticky bottom-0 bg-white border-t shadow-lg transition-all duration-200 ease-in-out"
        style={{ height: isFooterMinimized ? '60px' : `${footerHeight}px` }}
      >
        <div className="h-full flex flex-col">
          {/* Footer Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <div className="flex items-center space-x-4">
              <label className="text-sm font-medium text-gray-700">
                Iframe URL:
              </label>
              <input
                type="url"
                value={iframeUrl}
                onChange={(e) => setIframeUrl(e.target.value)}
                className="px-3 py-1 border border-gray-300 rounded text-sm w-64"
                placeholder="Enter iframe URL"
              />
            </div>

            <div className="flex items-center space-x-2">
              {!isFooterMinimized && (
                <div className="flex items-center space-x-2">
                  <label className="text-sm text-gray-600">Height:</label>
                  <input
                    type="range"
                    min="100"
                    max="600"
                    value={footerHeight}
                    onChange={(e) => setFooterHeight(parseInt(e.target.value))}
                    className="w-24"
                  />
                  <span className="text-sm text-gray-600 w-12">{footerHeight}px</span>
                </div>
              )}

              <button
                onClick={() => setIsFooterMinimized(!isFooterMinimized)}
                className="p-2 hover:bg-gray-200 rounded transition-colors"
                title={isFooterMinimized ? 'Maximize' : 'Minimize'}
              >
                  <ChevronUpDown styling="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Iframe Container */}
          {!isFooterMinimized && (
            <div className="flex-1">
              <iframe
                src={iframeUrl}
                className="w-full h-full border border-gray-300 rounded"
                title="Embedded Content Prompt"
                sandbox="allow-same-origin allow-scripts allow-forms"
              />
            </div>
          )}
        </div>
      </footer>
    </div>
  );
};


const App = () => {
    const [count, setCount] = React.useState(0);

    return (
      <div>
            <h1>Hello!</h1>
      </div>
    );
};

// Find the DOM element to mount our React app
const rootElement = document.getElementById('root');

// Create a root and render the App component
ReactDOM.createRoot(rootElement).render(<ContributionChartEditorApp />);
