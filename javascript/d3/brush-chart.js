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
   const svg = d3.select('.brush-container')
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
      .style('fill-opacity', 0.5) 
}

function add_brush_group(container, brush) {
   return container.append('g')
      .attr('class', 'brush')
      .call(brush);
}

function highlight_selected(data) {
   const selected_ids = data.map(d => d.id);
   d3.selectAll('.scatter')
      .filter(d => selected_ids.includes(d.id))
      .style('fill', 'coral');

   d3.selectAll('.scatter')
      .filter(d => !selected_ids.includes(d.id))
      .style('fill', 'dodgerblue');
}

function update_selected(data) {
   d3.select('.selected-body')
      .selectAll('.selected-element')
      .data(data, d => d.id)
      .join(
         enter => enter.append('p')
         .attr('class', 'selected-element')
         .html(
            d => `<span class="selected-title">${d.title}</span>, ${d.release_year} <br> budget: ${d.budget} | revenue: ${d.revenue}`
         ),

         update => update,
         exit => exit.remove()
      )
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

   function brushed(event) {
      let selected_data = [];
      if (event.selection) {
         const [[x0, y0], [x1, y1]] = event.selection;
         selected_data = chart_data.filter(
            d =>
               x0 <= xScale(d.budget) && xScale(d.budget) < x1 &&
               y0 <= yScale(d.revenue) && yScale(d.revenue) < y1 
         )
      }
      update_selected(selected_data);
      highlight_selected(selected_data);
   }

   d3.select('.selected-container')
      .style('width', `${width + margin.left + margin.right}px`)
      .style('height', `${height + margin.top + margin.bottom}px`)


   const brush = d3.brush()
      .extent([[0,0], [width, height]]).on('brush end', brushed); //brush and end are two separate events
   add_brush_group(scatter_container, brush);
}

scatter_plot_main();