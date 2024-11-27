d3.csv('aggregated_data.csv').then(data => {
    console.log("Loaded Data: ", data);  // Log data to check the structure

    // Prepare unique filters
    const industries = Array.from(new Set(data.map(d => d.IND)));
    const nativities = Array.from(new Set(data.map(d => d.NATIVITY)));

    // Function to populate dropdown
    function populateDropdown(dropdown, options, defaultOptionValue) {
        options = [defaultOptionValue, ...options.filter(opt => opt !== defaultOptionValue)];
        options.sort((a, b) => a === defaultOptionValue ? -1 : a.localeCompare(b));
        options.forEach(option => {
            const opt = document.createElement('option');
            opt.value = option;
            opt.textContent = option;
            dropdown.appendChild(opt);
        });
        dropdown.value = defaultOptionValue;
    }

    // Populate filters
    populateDropdown(industryFilter, industries, 'All');
    populateDropdown(nativityFilter, nativities, 'All');

    // Render initial map and table
    renderMap(data);
    renderTable(data);

    // Update map and table on filter change
    industryFilter.addEventListener('change', filterData);
    nativityFilter.addEventListener('change', filterData);

    function filterData() {
        const selectedIndustry = industryFilter.value;
        const selectedNativity = nativityFilter.value;

        const filteredData = data.filter(d =>
            (selectedIndustry === 'All' || d.IND === selectedIndustry) &&
            (selectedNativity === 'All' || d.NATIVITY === selectedNativity)
        );

        renderMap(filteredData);
        renderTable(filteredData);
    }

    function renderMap(data) {
        // Filter out data with missing IDs
        const paths = svg.selectAll('path')
            .data(data.filter(d => d.ID !== undefined), d => `${d.ID}-${d.IND}-${d.NATIVITY}`);  // Use a composite key

        // Create a color scale based on `Underemployment Level`
        const underemploymentExtent = d3.extent(data, d => +d.UNDEREMPLOYMENT_LEVEL);
        const colorScale = d3.scaleLinear()
            .domain(underemploymentExtent)
            .range(['#ffffff', '#000000']);

        // Enter and update paths
        paths.join(
            enter => enter.append('path')
                .attr('id', d => `${d.ID}-${d.IND}-${d.NATIVITY}`)  // Composite ID for uniqueness
                .attr('fill', d => colorScale(+d.UNDEREMPLOYMENT_LEVEL) || '#ccc')
                .attr('stroke', 'none')
                .on('click', function (event, d) {
                    // Reduce opacity for unselected regions
                    svg.selectAll('path')
                        .style('opacity', p => p.ID === d.ID ? 1 : 0.5);
                }),
            update => update
                .attr('fill', d => colorScale(+d.UNDEREMPLOYMENT_LEVEL) || '#ccc')
                .attr('stroke', 'none'),
            exit => exit.remove()
        );
    }

    // Function to render the table
    function renderTable(data) {
        dataTable.html(''); // Clear previous table rows

        data.forEach(d => {
            dataTable.append('tr')
                .html(`
                    <td>${d.ID}</td>
                    <td>${d.State}</td>
                    <td>${d.COUNTIES}</td>
                    <td>${d['Underemployment Level']}</td>
                    <td>${d['Required Education Level']}</td>
                    <td>${d['Percent of Workforce']}</td>
                    <td>${d['Mean Wage']}</td>
                    <td>${d['Mean Other Income']}</td>
                    <td>${d['Mean Age']}</td>
                `);
        });
    }
}).catch(error => {
    console.error("Error loading the CSV: ", error);
});
