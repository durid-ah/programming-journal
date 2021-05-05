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
   let svg = d3.select('.scatter-plot-container')
   .append('svg')
   .attr('width', width + margin.left + margin.right)
   .attr('height', height + margin.top + margin.bottom)
   .append('g')
   .attr('transform', `translate(${margin.left}, ${margin.top})`);

   return svg;
}

async function line_chart_main() {
   // Setting up the frame measurements
   const margin = {top: 40, bottom:40, left: 80, right: 40};
   const width = 500 - margin.left - margin.right;
   const height = 500 - margin.top - margin.bottom;

   let data = process_line_data();
}

line_chart_main();