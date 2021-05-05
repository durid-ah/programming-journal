// line charts are paths where you tell the svg towards which point 

async function process_line_data() {
   let data = await fetch_data();
   let filtered_data = filterData(data);
   return filtered_data;
}

async function line_chart_main() {
   // Setting up the frame measurements
   const margin = {top: 40, bottom:40, left: 80, right: 40};
   const width = 500 - margin.left - margin.right;
   const height = 500 - margin.top - margin.bottom;


}