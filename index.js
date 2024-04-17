import { createTooltip } from "./tooltip.js";

const url = "https://raw.githubusercontent.com/freeCodeCamp/ProjectReferenceData/master/global-temperature.json"
const req = new XMLHttpRequest();

let baseTemp;
let values = [];
//Variables for legend
const colors = [
    "#210872", 
    "#24559b", 
    "#5c92ed", 
    "#cedefb", 
    "#fafa9b", 
    "#e0c944", 
    "#d99138", 
    "#b14d26", 
    "#801003"
];
const legendRange = [
    "2.8", 
    "3.9", 
    "5.0", 
    "6.1", 
    "7.2", 
    "8.3", 
    "9.5", 
    "10.6", 
    "11.7",
    "12.8"
];

let xScale;
let yScale; 

const width = 1400;
const height = 600;
const padding = 70;
let minYear;
let maxYear;
let numberOfYears;

const svg = d3.select("svg");

//Setting the dimentions of the svg container
const drawCanvas = () => {
    svg.attr("width", width);
    svg.attr("height", height + 40); //Creating space for the legend
};

//Defining the space where the data values will be positioned within the svg container
const generateScales = () => {
    //Finding the oldest and most recent year
    minYear = d3.min(values, (d) => d["year"]);
    maxYear = d3.max(values, (d) => d["year"]);

    xScale = d3.scaleLinear()
        .domain([minYear, maxYear + 1])
        .range([padding, width - padding]);

    yScale = d3.scaleTime()
        .domain([d3.max(values, (d) => new Date(0, d["month"], 0, 0, 0, 0, 0)), d3.min(values, (d) => new Date(0, d["month"] - 1, 0, 0, 0, 0, 0))])
        .range([height - padding, padding])
};

//Creating the actual axes based on the scales defined in "generateScales" function
const generateAxes = () => {
    const xAxis = d3.axisBottom(xScale)
        .tickFormat(d3.format("d")) //"d" takes a number and turns it into a integer

    const yAxis = d3.axisLeft(yScale)
        .tickFormat(d3.timeFormat("%B")) //"%B" for showing the full month as a string
        .tickSize(9)
        .tickPadding(6)

    //Placing the xAxis on the svg container
    svg.append("g")
        .call(xAxis)
        .attr("id", "x-axis")
        .attr("transform", "translate(0, " + (height - padding) + ")")

    //Placing the yAxis on the svg container
    const yAxisGroup = svg.append("g")
        .call(yAxis)
        .attr("id", "y-axis")
        .attr("transform", "translate(" + padding + ", 0)")

    //Placing the month names along the yAxis
    yAxisGroup.selectAll(".tick text")
        .attr("dy", (d, i) => {
            const cellHeight = (height - (2 * padding)) / 12;
            return cellHeight / 2 + 2.5;
        })

    //Placing the tick lines properly
    yAxisGroup.selectAll(".tick line")
        .attr("y1", (d, i) => {
            const cellHeight = (height - (2 * padding)) / 12;
            return cellHeight / 2;
        })
        .attr("y2", (d, i) => {
            const cellHeight = (height - (2 * padding)) / 12;
            return cellHeight / 2;
        })
};

const tooltip = createTooltip("#tooltip");

//Creating all the corresponding cells
const drawCells = () => {
    numberOfYears = maxYear - minYear;

    svg.selectAll("rect")
        .data(values)
        .enter()
        .append("rect")
        .attr("class", "cell")
        .attr("fill", (d) => { //Applying colors depending on its variance
            const variance = d["variance"];
            return variance < -4.76 
                ? "#210872" 
                : variance >= -4.76 && variance < -3.66
                ? "#24559b"
                : variance >= -3.66 && variance < -2.56
                ? "#5c92ed"
                : variance >= -2.56 && variance < -1.46
                ? "#cedefb"
                : variance >= -1.46 && variance < -0.36
                ? "#fafa9b"
                : variance >= -0.36 && variance < 0.84
                ? "#e0c944"
                : variance >= 0.84 && variance < 1.94
                ? "#d99138"
                : variance >= 1.94 && variance < 3.04
                ? "#b14d26"
                : "#801003"
        })
        .attr("data-month", (d) => d["month"] - 1)
        .attr("data-year", (d) => d["year"])
        .attr("data-temp", (d) => baseTemp + d["variance"])
        .attr("height", (height - (2 * padding)) / 12)
        .attr("y", (d) => {
            return yScale(new Date(0, d["month"] - 1, 0, 0, 0, 0, 0))
        })
        .attr("width", (width - (2 * padding)) / numberOfYears)
        .attr("x", (d) => xScale(d["year"]))
        .on("mouseover", (event, item) => {
            tooltip.showTooltip(event, item);
        })
        .on("mouseout", () => {
            tooltip.hideTooltip();
        })
};

//Creating a legend that shows what range each color comprises
const createLegend = (colors, legendRange) => {
    //Defining variables for dimentions and position
    const legendWidth = 45;
    const legendHeight = 25;
    const legendX = width - 1200;
    const legendY = height - padding + 50;

    //Creating an placing the legend
    const legend = svg.append("g")
        .attr("id", "legend")
        .attr("transform", "translate(" + legendX + ", " + legendY + ")");

    //Setting the colors on the scale
    legend.selectAll("rect")
        .data(colors)
        .enter()
        .append("rect")
        .attr("class", "colorRect")
        .attr("x", (d, i) => i * legendWidth)
        .attr("y", 0)
        .attr("width", legendWidth)
        .attr("height", legendHeight)
        .attr("fill", (d) => d)

    //Setting the text of each color on the scale
    legend.selectAll("text")
        .data(legendRange)
        .enter()
        .append("text")
        .attr("x", (d, i) => (i * legendWidth) - 10)
        .attr("y", legendHeight * 1.5)
        .text((d) => d)
        .style("font-size", "12px")
        .style("alignment-baseline", "middle");
};

//Fetching JSON data
req.open("GET", url, true);
req.onload = () => { 
    const data = JSON.parse(req.responseText);
    baseTemp = data["baseTemperature"];
    values = data["monthlyVariance"];

    drawCanvas();
    generateScales();
    generateAxes();
    drawCells();
    createLegend(colors, legendRange);
}
req.send();