// line charts are paths where you tell the svg towards which point 

function prepare_line_chart_data(data) {
   // Group by year and extract measures
   const group_by = d => d.release_year;
   const reduce_revenue = values => d3.sum(values, leaf => leaf.revenue);
   const revenue_map = d3.rollup(data, reduce_revenue, group_by);
   const reduce_budget = values => d3.sum(values, leaf => leaf.budget);
   const budget_map = d3.rollup(data, reduce_budget, group_by);

   const revenue = Array.from(revenue_map).sort((a,b) => a[0] - b[0]);
   const budget = Array.from(budget_map).sort((a,b) => a[0] - b[0]);

   // parse year
   const parse_year = d3.timeParse('%Y');
   const dates = revenue.map(d => parse_year(d[0]));

   // collect the values of both lines in an array to
   // get max value
   const yValues = [
      ...Array.from(revenue_map.values()),
      ...Array.from(budget_map.values())
   ];
   const yMax = d3.max(yValues);

   // final data
   const line_data = {
      series: [
         {
            name: 'Revenue',
            color: 'dodgerblue',
            values: revenue.map(d => ({date: parse_year(d[0]), value: d[1]})),
         },
         {
            name: 'Budget',
            color: 'darkorange',
            values: budget.map(d => ({date: parse_year(d[0]), value: d[1]})),
         }
      ],
      dates: dates,
      yMax: yMax,
   }

   return line_data;

}

async function process_line_data() {
   let data = await fetch_data();
   let filtered_data = filterData(data);
   let prepared_data = prepare_line_chart_data(filtered_data);
   return prepared_data;
}

function build_chart_container(margin, width, height) {
   let svg = d3.select('.line-chart-container')
   .append('svg')
   .attr('width', width + margin.left + margin.right)
   .attr('height', height + margin.top + margin.bottom)
   .append('g')
   .attr('transform', `translate(${margin.left}, ${margin.top})`);

   return svg;
}

function build_line_x_scale(width, data) {
   return d3.scaleTime()
      .domain(d3.extent(data.dates))
      .range([0, width]);
}

function build_line_y_scale(height, data) {
   return d3.scaleLinear()
      .domain([0, data.yMax])
      .range([height, 0]);
}

function create_line_generator(x_scale, y_scale) {
   let gen = d3
      .line()
      .x(d => x_scale(d.date))
      .y(d => y_scale(d.value));

   return gen;
}

function draw_lines(container, line_gen, data) {
   const chart_group = container.append('g')
      .attr('class', 'line-chart');

   return chart_group.selectAll('.line-series')
      .data(data.series)
      .enter()
      .append('path')
      .attr('class', d => `line-series ${d.name.toLowerCase()}`)
      .attr('d', d => line_gen(d.values))
      .style('fill', 'none') // what the chart looks like from the inside
      .style('stroke', d => d.color);
}

function configure_x_axis(x_scale) {
   return d3.axisBottom(x_scale)
      .tickSizeOuter(0);
}

function draw_x_axis(height, x_axis, container) {
   return container.append('g')
      .attr('transform', `translate(0, ${height})`)
      .attr('class', 'x axis')
      .call(x_axis);
}

function configure_y_axis(y_scale, width) {
   return d3.axisLeft(y_scale)
      .ticks(5)
      .tickFormat(d3.format('~s'))
      .tickSizeOuter(0)
      .tickSizeInner(-width);
}

function draw_y_axis(container, y_axis) {
   return container.append('g')
      .attr('class', 'y axis')
      .call(y_axis);
}

function add_series_labels(container, line_data, x_scale, y_scale) { // the title at the end of the lines
   container.append('g')
      .attr('class', 'series-labels')
      .selectAll('.series-label')
      .data(line_data.series)
      .enter()
      .append('text')
      .attr('x', d => x_scale(d.values[d.values.length - 1].date) + 5)
      .attr('y', d => y_scale(d.values[d.values.length - 1].value) + 5)
      .text(d => d.name)
      .style('dominant-baseline', 'central')
      .style('font-size', '0.1 rem')
      //.style('font-weight', 'bold')
      .style('fill', d => d.color);
}

async function line_chart_main() {
   // Setting up the frame measurements
   const margin = {top: 40, bottom:40, left: 60, right: 70};
   const width = 500 - margin.left - margin.right;
   const height = 500 - margin.top - margin.bottom;

   let data = await process_line_data();

   let x_scale = build_line_x_scale(width, data);
   let y_scale = build_line_y_scale(height, data);
   let container = build_chart_container(margin, width, height);
   let line_gen = create_line_generator(x_scale, y_scale);
   let _ = draw_lines(container, line_gen, data);
   let x_axis = configure_x_axis(x_scale);
   let x_axis_draw = draw_x_axis(height, x_axis, container);
   let y_axis = configure_y_axis(y_scale, width);
   let y_axis_draw = draw_y_axis(container, y_axis);
   add_series_labels(container, data, x_scale, y_scale);
}

line_chart_main();