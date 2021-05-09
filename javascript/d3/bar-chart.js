function build_x_scale(width, data) {
   const xMax = d3.max(data, d => d.revenue);
   return d3
      .scaleLinear()
      .domain([0, xMax])
      .range([0, width]);
}

function build_y_scale(height, chart_data) {
   return d3.scaleBand()
      .domain(chart_data.map(d => d.genre))
      .rangeRound([0, height])
      .paddingInner(0.25) // The padding for each bar, between 0 and 1;
}

function build_graph(width, height, margin) {
   return d3.select('.bar-chart-container')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
}

function draw_bars(chart, data, yScale, xScale) {
   return chart
      .selectAll('.bar')
      .data(data)
      .enter()
      .append('rect')
      .attr('class', 'bar')
      .attr('y', d => yScale(d.genre))
      .attr('width', d => xScale(d.revenue))
      .attr('height', yScale.bandwidth())
      .style('fill', 'dodgerblue')
}

function create_x_axis(xScale, chart, height) {
   const xAxis = d3.axisTop(xScale)
      .tickFormat(d3.format('~s'))
      .tickSizeInner(-height)
      .tickSizeOuter(0);
   return chart
      .append('g')
      .attr('class', 'x axis')
      .call(xAxis);
}

function create_y_axis(yScale, chart) {
   const yAxis = d3.axisLeft(yScale).tickSize(0);
   const yAxisDraw = chart.append('g')
      .attr('class', 'y axis')
      .call(yAxis);
   
      yAxisDraw.selectAll('text').attr('dx', '-0.6em');
}

async function build_chart() {
   // Setting up the frame measurements
   const margin = {top: 40, bottom:40, left: 80, right: 40};
   const width = 400 - margin.left - margin.right;
   const height = 500 - margin.top - margin.bottom;

   let chart_data = await get_processed_data();

   // each axis needs to be scaled so the values of every bar
   // is mapped to a proper width
   let xScale = build_x_scale(width, chart_data);
   let yScale = build_y_scale(height, chart_data);
   let chart = build_graph(width, height, margin);
   let bars = draw_bars(chart, chart_data, yScale, xScale);
   let xAxis = create_x_axis(xScale, chart, height);
   let yAxis = create_y_axis(yScale, chart);
}

build_chart();
