function get_first_100(data) {
   return data.sort((a,b) => b.budget - a.budget).filter((d, i) => i < 100);
}

async function process_scatter_data() {
   let data = await fetch_data();
   let filtered_data = filterData(data);
   let scatter_data = get_first_100(filtered_data);
   return scatter_data;
}

function build_scatter_container(margin, width, height) {
   const svg = d3.select('.scatter-plot-container')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
   
   return svg;
}

function build_scatter_x_scale(width, data) {
   return d3.scaleLinear()
      .domain(d3.extent(data, d => d.budget))
      .range([0, width]);
}

function build_scatter_y_scale(height, data) {
   return d3.scaleLinear()
      .domain(d3.extent(data, d => d.revenue))
      .range([height, 0])
}

function draw_plots(container, plot_data, xScale, yScale) {
   return container.selectAll('.scatter')
      .data(plot_data)
      .enter()
      .append('circle')
      .attr('class', 'scatter')
      .attr('cx', d => xScale(d.budget))
      .attr('cy', d => yScale(d.revenue))
      .attr('r', 3)
      .style('fill', 'dodgerblue')
      .style('fill-opacity', 0.2)
      
}

async function scatter_plot_main() {
   // Setting up the frame measurements
   const margin = {top: 40, bottom:40, left: 80, right: 40};
   const width = 500 - margin.left - margin.right;
   const height = 500 - margin.top - margin.bottom;

   let chart_data = await process_scatter_data();
   let xScale = build_scatter_x_scale(width, chart_data);
   let yScale = build_scatter_y_scale(height, chart_data);
   let scatter_container = build_scatter_container(margin, width, height);
   let plots = draw_plots(scatter_container, chart_data, xScale, yScale);
   console.log(chart_data);
}

scatter_plot_main();