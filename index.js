// Configure linter to check for ES6 features
// jshint esversion: 6

// Enable tooltips from popper.js library
$(function() {
  $('[data-toggle="tooltip"]').tooltip();
});

// When calculate button pressed: If form validation was correct calculate and update plot, else return
$("form").submit(function(e) {
  // Block submit from refreshing page
  e.preventDefault();
  // Validate the form
  var isValid = validateForm(e);
  if (isValid === true) {
    // Calulate interest and update plot
    dataset = calculateInterest();
    updatePlot(dataset);
  } else {
    // Block form from submitting
    return false;
  }
});

// Create Number Formatter for US dollars
var formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: '0'
});

// Calculate Interest based on default values
var dataset = calculateInterest();

// Use d3 to plot data
// Set graph size and margins
var margin = {
  top: 50,
  right: 20,
  bottom: 54,
  left: 110,
  bootstrapPadding: 33,
};

// Retrieve dimensions of container the bar chart will be placed in
var chartColumnWidth = $(".barChart").width();
var formHeight = $(".inputForm").height();

// Create width based on size of column from bootstrap grid - margins
var width = chartColumnWidth - margin.left - margin.right - margin.bootstrapPadding;
var height = formHeight - margin.top - margin.bottom;

// Extract x data (years) for use in creating graph x axis
var xData = [];
for (i = 0; i < dataset.length; i++) {
  xData.push(dataset[i].year);
}

// Create stacking bar data
var stack = d3.stack()
  .keys(["totalInvested", "totalInterest"])
  .order(d3.stackOrderNone)
  .offset(d3.stackOffsetNone);

var series = stack(dataset);

// Create x and y scaling factors.
var xScale = d3.scaleBand()
  .range([0, width])
  .domain(xData)
  .padding([0.1]);
var yScale = d3.scaleLinear()
  .range([height, 0])
  .domain([0, d3.max(series, d => d3.max(d, d => d[1]))]);

// Create svg chart object and apply margins
var svg = d3.select(".barChart").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("class", "marginAdjust")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// Create axis labels
var tickDivider = tickCalculator(xScale);
var xAxis = d3.axisBottom(xScale)
  .tickValues(xScale.domain().filter((d, i) => !(i % tickDivider)));
// Create format object with commas for thousands and dollar signs
var yAxisFormat = d3.format("$,.0f");
var yAxis = d3.axisLeft(yScale).tickFormat(yAxisFormat).ticks();

// Create tooltip divs
var div = d3.select(".barChart").append("div")
  .attr("class", "barTooltip")
  .style("opacity", 0);

//Create color scheme for bars
var colorArray = ["#4086AA", "#91C3DC"];
var color = d3.scaleOrdinal().range(colorArray);

// Create bar rectangles
var rects = svg.selectAll("g").data(series).enter()
  .append("g")
  .attr("fill", d => color(d.key));

rects.selectAll("rect")
  .data(d => d)
  .join("rect")
  .attr("x", (d, i) => xScale(d.data.year))
  .attr("y", d => yScale(d[1]))
  .attr("height", d => yScale(d[0]) - yScale(d[1]))
  .attr("width", xScale.bandwidth())
  .attr("class", "bar")
  .on("mouseover", function(d) {
    div.transition()
      .duration(200)
      .style("opacity", 0.9);
    div.html("Age: " + d.data.year + "<br>Invested: " + formatter.format(d.data.totalInvested) +
        "<br>Interest: " + formatter.format(d.data.totalInterest) + "<br>Total: " +
        formatter.format((d.data.totalInvested + d.data.totalInterest)) + "<br>Return: " +
        ((d.data.totalInvested + d.data.totalInterest) / d.data.totalInvested).toFixed(1) + " x")
      .style("left", (d3.event.pageX - 480) + "px")
      .style("top", (d3.event.pageY - 220) + "px");
  })
  .on("mouseout", function(d) {
    div.transition()
      .duration(500)
      .style("opacity", 0);
  });

// Add Axes
svg.append("g")
  .attr("class", "x axis")
  .attr("transform", "translate(0," + (height) + ")")
  .call(xAxis);

svg.append("g")
  .attr("class", "y axis")
  .attr("transform", "translate(0, 0)")
  .call(yAxis);

// Add X-Axis Label
svg.append("text")
  .attr("class", "xLabel")
  .attr("transform",
    "translate(" + (width / 2) + " ," +
    (height + margin.top) + ")")
  .style("text-anchor", "middle")
  .text("Age");

// Add legend
var legend = svg.append("g")
  .attr("class", "legend")
  .attr("height", 100)
  .attr("width", 100)
  .attr('transform', 'translate(-20,10)');

// Add Legend color identifiers
legend.selectAll('rect')
  .data(colorArray.reverse())
  .enter()
  .append("rect")
  .attr("class", "legendRect")
  .attr("x", 50)
  .attr("y", function(d, i) {
    return i * 30;
  })
  .attr("width", 18)
  .attr("height", 18)
  .style("fill", d => d);

// Add legend text
legend.selectAll('text')
  .data(["Interest", "Contributions"])
  .enter()
  .append("text")
  .attr("class", "legendLabel")
  .attr("x", 75)
  .attr("y", function(d, i) {
    return i * 30 + 16;
  })
  .text(d => d);

// Make legend transparent on small screens to avoid overlap
var x = window.matchMedia("(max-width: 500px)");
hideLegend(x); // Call listener function at run time
x.addListener(hideLegend); // Attach listener function on state changes

function calculateInterest() {
  // Calculate compound interest using parameters from user form

  // Retrieve user variables from form
  var startingAmount = Number($("#startingAmount").val());
  var interestRate = $("#interestRate").val();
  var retirementAge = $("#retirementAge").val();
  var currentAge = Number($("#currentAge").val());
  var monthlyContribution = Number($("#monthlyContribution").val());

  // Calculate investment time in years
  investmentTime = retirementAge - currentAge;
  // Convert interest rate to decimal format
  decimalInterestRate = interestRate / 100;

  // Set compound rate to monthly (Equations are setup to support other compounding
  // intervals but using only monthly greatly simplifies user experience with
  // negligible differences in the results.)
  var compoundIntervalNumber = 12;

  // Calculate compounding interest using:
  // https://www.thecalculatorsite.com/articles/finance/compound-interest-formula.php
  var compoundInterest = [startingAmount];
  var contributionInterest = [0];
  var totalValue = [startingAmount];
  var totalInvested = [startingAmount];
  var totalInterest = [0];
  var year = [currentAge];

  // Calculate interest for each investment year.
  for (i = 1; i <= investmentTime; i++) {
    year.push(i + currentAge);

    // Calculate Compound interest, equations split into multiple parts below:
    // (r/n)
    rDivN = (decimalInterestRate / compoundIntervalNumber);
    // (1 + r/n)^(nt)
    var partialCalc = Math.pow((1 + rDivN), (compoundIntervalNumber * i));
    // Calculate Compound Interest for each year: A = P(1 + r/n)^(nt)
    compoundInterest.push(Math.floor(startingAmount * partialCalc));
    // Calculate monthly Contribution: PMT × {[(1 + r/n)(nt) - 1] / (r/n)} × (1+r/n)
    contributionInterest.push(Math.floor((monthlyContribution * (partialCalc - 1) / rDivN) * (1 + rDivN)));
    totalValue.push(compoundInterest[i] + contributionInterest[i]);

    //Calculate total contributions
    // If first year, skip bc no contributions yet.Total = previous year total + monthly deposit * 12
    if (i != 0) {
      totalInvested.push(totalInvested[i - 1] + 12 * monthlyContribution);
    }
    totalInterest.push(totalValue[i] - totalInvested[i]);
  }

  // Format data for d3 plot
  var dataD3Format = [];
  for (j = 0; j < year.length; j++) {
    dataD3Format.push({
      year: year[j],
      totalInvested: totalInvested[j],
      totalInterest: totalInterest[j]
    });
  }

  // Update GUI with results
  updateResults(dataD3Format);

  return dataD3Format;
}

function hideLegend(x) {
  // Make legend transparent on small screens to avoid overlap
  if (x.matches) { // If media query matches
    $(".legendLabel").attr("opacity", "0");
    $(".legendRect").attr("opacity", "0");
  } else {
    $(".legendLabel").attr("opacity", "100");
    $(".legendRect").attr("opacity", "100");
  }
}

function updatePlot(dataset) {
  // Update plot when user hits calculate button

  // Extract x data (years) for use in creating graph x axis
  var xData = [];
  for (i = 0; i < dataset.length; i++) {
    xData.push(dataset[i].year);
  }

  // Create x and y scaling factors.
  var series = stack(dataset);
  var xScale = d3.scaleBand()
    .range([0, width])
    .domain(xData)
    .padding([0.1]);
  var yScale = d3.scaleLinear()
    .range([height, 0])
    .domain([0, d3.max(series, d => d3.max(d, d => d[1]))]);

  // Create axis labels
  var tickDivider = tickCalculator(xScale);
  var xAxis = d3.axisBottom(xScale)
    .tickValues(xScale.domain().filter((d, i) => !(i % tickDivider)));
  // Create format object with commas for thousands and dollar signs
  var yAxisFormat = d3.format("$,.0f");
  var yAxis = d3.axisLeft(yScale).tickFormat(yAxisFormat).ticks();

  // Select the chart, then the rectangles, and update to new data
  var svg = d3.select("svg").select(".marginAdjust");

  // Update/Animate the axes
  svg.select(".x.axis").transition()
    .duration(750)
    .call(xAxis);
  svg.select(".y.axis").transition()
    .duration(750)
    .call(yAxis);

  // Create tooltip divs
  var div = d3.select(".barChart").append("div")
    .attr("class", "barTooltip")
    .style("opacity", 0);

  // Remove the extra bars if less years graphed than previous
  var bars = svg.selectAll(".bar").data(series);
  bars.exit().transition()
    .attr("height", 0)
    .attr("y", height)
    .remove();

  // Add new bars if needed and merge old/new plot data
  rects = svg.selectAll("g").data(series);

  rects.enter()
    .append("g")
    .attr("fill", d => color(d.key));

  rects.selectAll("rect")
    .data(d => d)
    .join("rect")
    .attr("x", (d, i) => xScale(d.data.year))
    .attr("y", d => yScale(d[1]))
    .attr("height", d => yScale(d[0]) - yScale(d[1]))
    .attr("width", xScale.bandwidth())
    .attr("class", "bar")
    .on("mouseover", function(d) {
      div.transition()
        .duration(200)
        .style("opacity", 0.9);
      div.html("Age: " + d.data.year + "<br>Invested: " + formatter.format(d.data.totalInvested) +
          "<br>Interest: " + formatter.format(d.data.totalInterest) + "<br>Total: " +
          formatter.format((d.data.totalInvested + d.data.totalInterest)) + "<br>Return: " +
          ((d.data.totalInvested + d.data.totalInterest) / d.data.totalInvested).toFixed(1) + " x")
        .style("left", (d3.event.pageX - 480) + "px")
        .style("top", (d3.event.pageY - 220) + "px");
    })
    .on("mouseout", function(d) {
      div.transition()
        .duration(500)
        .style("opacity", 0);
    })
    .merge(rects).transition()
    .duration(750)
    .attr("x", (d, i) => xScale(d.data.year))
    .attr("y", d => yScale(d[1]))
    .attr("height", d => yScale(d[0]) - yScale(d[1]))
    .attr("width", xScale.bandwidth());
}

function tickCalculator(xScale) {
  // Calculate space for xlabels. Want to leave 70px of space for each label
  // so divide width of 1 bar by 70 and take reciprical which yields the
  // number of tick marks to filter out.  If > 70 don't need to filter any.
  var tickDivider = 1;
  if (xScale.bandwidth() < 70) {
    tickDivider = Math.floor(1 / (xScale.bandwidth() / 70));
  } else {
    tickDivider = 1;
  }
  return tickDivider;
}

function updateResults(dataset) {
  // Update and format final results
  var finalIndex = dataset.length - 1;
  $(".totalContributions").text(formatter.format(dataset[finalIndex].totalInvested));
  $(".interestEarned").text(formatter.format(dataset[finalIndex].totalInterest));
  $(".finalTotalValue").text(formatter.format(dataset[finalIndex].totalInvested + dataset[finalIndex].totalInterest));
  $(".returnMultiplier").text(((dataset[finalIndex].totalInvested + dataset[finalIndex].totalInterest) / dataset[finalIndex].totalInvested).toFixed(1) + "\xa0x");
}

function validateForm(form) {
  // Validate the Form
  var isValid = true;
  // Retrieve user variables from form
  var currentAge = Number($("#currentAge").val());
  var retirementAge = Number($("#retirementAge").val());
  // Check for validity and alert user
  if (retirementAge < currentAge) {
    alert("Retirement age must be greater than current age.");
    isValid = false;
  }
  return isValid;
}
