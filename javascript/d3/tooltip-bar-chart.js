async function fetch_bar_data() {
   let data = await fetch_data()
   const movies_clean = filterData(data);
   return movies_clean;
}

function filter_metric_data(metric, chart_data) {
   return chart_data
      .sort((a, b) => b[metric] - a[metric])
      .filter((_, i) => i < 15);
}

function get_x_scale(width) {
   return d3
      .scaleLinear()
      .range([0, width]);
}

function get_y_scale(height) {
   return d3.scaleBand()
      .rangeRound([0, height])
      .paddingInner(0.25) // The padding for each bar, between 0 and 1;
}

function draw_this_x_axis(xScale, chart, height) {
   const x_axis = d3.axisTop(xScale)
      .ticks(5)
      .tickFormat(d3.format('~s'))
      .tickSizeInner(-height)
      .tickSizeOuter(0);

   const x_axis_draw = chart
      .append('g')
      .attr('class', 'x axis')
      .call(x_axis);

   return [x_axis, x_axis_draw];
}

function draw_this_y_axis(yScale, chart) {
   const yAxis = d3.axisLeft(yScale).tickSize(0);
   const yAxisDraw = chart.append('g')
      .attr('class', 'y axis');
   
   return [yAxis, yAxisDraw];
}

function create_graph_container(width, height, margin, container_name) {
   return d3.select(container_name)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);
}

function update(bars, data, y_scale, x_scale, metric, x_draw, y_draw, x_axis, y_axis) {
   x_scale.domain([0, d3.max(data, d => d[metric])]);
   y_scale.domain(data.map(d => d.title));

   // Set up transition.
   const dur = 1000;
   const t = d3.transition().duration(dur);

   bars
      .selectAll('.bar')
      .data(data, d => d.title)
      .join(
         enter => {
            enter
              .append('rect')
              .attr('class', 'bar')
              .attr('y', d => y_scale(d.title))
              .attr('height', y_scale.bandwidth())
              .style('fill', 'lightcyan')
              .transition(t) // This line adds the transition to the following attr
              .delay((_, i) => i * 20) // adding delay to the following attr
              .attr('width', d => x_scale(d[metric]))
              .style('fill', 'dodgerblue');
         },
         
         update =>{
            update
              .transition(t)
              .delay((d, i) => i * 20)
              .attr('y', d => y_scale((d.title)))
              .attr('width', d => x_scale(d[metric]));
         },

         exit => {
            exit
              .transition()
              .duration(dur / 2)
              .style('fill-opacity', 0)
              .remove();
          }
      );
   
   // Update Axes.
   x_draw.transition(t).call(x_axis.scale(x_scale));
   y_draw.transition(t).call(y_axis.scale(y_scale));
   y_draw.selectAll('text').attr('dx', '-0.6em');
   
}

function prepare_bar_container(chart) {
   return chart.append('g')
      .attr('class', 'bars');
}

async function build_animated_chart() {
   const margin = {top: 40, bottom:40, left: 200, right: 40};
   const width = 600 - margin.left - margin.right;
   const height = 500 - margin.top - margin.bottom;
   
   let chart_data = await fetch_bar_data();
   let filtered_data = filter_metric_data("revenue", chart_data);
   console.log(filtered_data);
   let x_scale = get_x_scale(width);
   let y_scale = get_y_scale(height);

   let chart = create_graph_container(width, height, margin, '.tooltip-barchart-container');
   let bars = prepare_bar_container(chart);

   let [x_axis, x_draw] = draw_this_x_axis(x_scale, chart, height);
   let [y_axis, y_draw] = draw_this_y_axis(y_scale, chart);

   update(bars, filtered_data, y_scale, x_scale, "revenue", x_draw, y_draw, x_axis, y_axis);
   
   function click() {
      let new_metric = this.dataset.name;
      let new_data = filter_metric_data(new_metric, chart_data);
      update(
         bars, new_data, y_scale, x_scale, new_metric, x_draw, y_draw, x_axis, y_axis
      );
   }

   d3.selectAll('button').on('click', click);
}

build_animated_chart();