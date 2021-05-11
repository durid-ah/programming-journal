// Setting up the frame measurements
const margin = {top: 40, bottom:40, left: 200, right: 40};
const width = 600 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

let chart_data = [];
let chart_metric = 'revenue';
let bars = null;
let x_scale = null;
let y_scale = null;

async function get_new_bar_data(metric) {
   let data = await fetch_data()
   const movies_clean = filterData(data);
   const revenue_data = movies_clean
      .sort((a, b) => b[metric] - a[metric])
      .filter((_, i) => i < 15);

   return revenue_data;
}

function build_new_x_scale(width, data) {
   const xMax = d3.max(data, d => d[chart_metric]);
   return d3
      .scaleLinear()
      .domain([0, xMax])
      .range([0, width]);
}

function build_new_y_scale(height, chart_data) {
   return d3.scaleBand()
      .domain(chart_data.map(d => d.title))
      .rangeRound([0, height])
      .paddingInner(0.25) // The padding for each bar, between 0 and 1;
}

function build_new_graph(width, height, margin, container_name) {
   return d3.select(container_name)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
}

function prepare_bar_container(chart) {
   return chart.append('g')
      .attr('class', 'bars');
}

function update(bars, data, y_scale, x_scale) {
   let new_x_scale = build_new_x_scale(width, data)
   let new_y_scale = build_new_y_scale(height, data)

   return bars
      .selectAll('.bar')
      .data(data)
      .join(
         enter => enter
            .append('rect')
            .attr('class', 'bar')
            .attr('y', d => y_scale(d.title))
            .attr('width', d => x_scale(d.revenue))
            .attr('height', y_scale.bandwidth())
            .style('fill', 'dodgerblue'),
         
         update => update
            .attr('y', d => y_scale(d.title))
            .attr('width', d => x_scale(d.revenue)),

         exit => exit.remove()
      );
}

function create_x_axis(xScale, chart, height) {
   const xAxis = d3.axisTop(xScale)
      .ticks(5)
      .tickFormat(d3.format('~s'))
      .tickSizeInner(-height)
      .tickSizeOuter(0);

   return chart
      .append('g')
      .attr('class', 'x axis')
      .call(xAxis);
}

async function click() {
   metric = this.dataset.name;
   chart_data = await get_new_bar_data(chart_data);
   update(bars, chart_data, y_scale, x_scale);
}

async function build_updatable_chart() {
   // Setting up the frame measurements
   const margin = {top: 40, bottom:40, left: 200, right: 40};
   const width = 600 - margin.left - margin.right;
   const height = 500 - margin.top - margin.bottom;

   chart_data = await get_new_bar_data(chart_metric);
   console.log(chart_data);
   x_scale = build_x_scale(width, chart_data);
   y_scale = build_new_y_scale(height, chart_data);
   let chart = build_new_graph(width, height, margin, '.update-barchart-container');
   bars = prepare_bar_container(chart);
   let x_axis = create_x_axis(x_scale, chart, height);
   let y_axis = create_y_axis(y_scale, chart);

   update(bars, chart_data, y_scale, x_scale);

   d3.selectAll('button').on('click', click);
} 

build_updatable_chart();