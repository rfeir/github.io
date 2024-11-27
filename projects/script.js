// Load the CSV data
d3.csv('aggregated_data.csv').then(data => {
    console.log("Loaded Data: ", data);

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
        // Create a color scale based on `Underemployment Level`
        const underemploymentExtent = d3.extent(data, d => {
            const underemploymentLevel = +d.UNDEREMPLOYMENT_LEVEL;
            return isNaN(underemploymentLevel) ? 0 : underemploymentLevel; // default to 0 if NaN
        });
        const colorScale = d3.scaleLinear()
            .domain(underemploymentExtent)
            .range(['#ffffff', '#000000']);
    
        // Bind data and update paths
        const paths = svg.selectAll('path')
            .data(data, d => d.ID);
    
        // Enter and update paths
        paths.join(
            enter => enter.append('path')
                .attr('id', d => d.ID)
                .attr('fill', d => {
                    const underemploymentLevel = +d.UNDEREMPLOYMENT_LEVEL;
                    // Check if `UNDEREMPLOYMENT_LEVEL` is missing or invalid (NaN)
                    if (isNaN(underemploymentLevel) || underemploymentLevel === null) {
                        return '#cccccc'; // Gray for missing or invalid values
                    }
                    return colorScale(underemploymentLevel);
                })
                .attr('stroke', 'none')
                .on('click', function (event, d) {
                    // Reduce opacity for unselected regions
                    svg.selectAll('path')
                        .style('opacity', p => p.ID === d.ID ? 1 : 0.5);
                }),
            update => update
                .attr('fill', d => {
                    const underemploymentLevel = +d.UNDEREMPLOYMENT_LEVEL;
                    if (isNaN(underemploymentLevel) || underemploymentLevel === null) {
                        return '#cccccc'; // Gray for missing or invalid values
                    }
                    return colorScale(underemploymentLevel);
                })
                .attr('stroke', 'none'),
            exit => exit.remove()
        );
    }
    

    function renderTable(data) {
        // Clear previous table rows
        dataTable.html('');

        // Render new table rows with updated column names
        data.forEach(d => {
            dataTable.append('tr').html(`
                <td>${d.ID}</td>
                <td>${d.STATE}</td>
                <td>${d.COUNTIES}</td>
                <td>${d.MEAN_WAGE || 'N/A'}</td>  <!-- Handle missing data -->
                <td>${d.MEAN_OTHER_INCOME || 'N/A'}</td>  <!-- Handle missing data -->
                <td>${d.MEAN_AGE || 'N/A'}</td>  <!-- Handle missing data -->
                <td>${d.UNDEREMPLOYMENT_LEVEL || 'N/A'}</td>  <!-- Handle missing data -->
                <td>${d.EDUCATION_LEVEL || 'N/A'}</td>  <!-- Handle missing data -->
                <td>${d.REQUIRED_EDUCAITON || 'N/A'}</td>  <!-- Handle missing data -->
                <td>${d.NATIVITY_PERCENTAGE || 'N/A'}</td>  <!-- Handle missing data -->
                <td>${d.NATIVITY}</td>
            `);
        });
    }
}).catch(error => {
    console.error("Error loading the CSV: ", error);
});
