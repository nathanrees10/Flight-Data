let Airports = [];
let Flights = [];
let MergedFlights = [];

window.onload = function () {
    try {
        fetchAirportsAndFlights(); // Fetch and merge the data
    } catch (error) {
        console.error('Error initialising page:', error);
        alert('Failed to initialise the page. Please try again.');
    }
};

// =========================
// Step 1: Loading Data Sources
// =========================

function fetchAirportsAndFlights() {
    fetch('A2_Airports.json') 
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch airports: ${response.statusText}`);
            }
            return response.json();
        })
        .then(airportData => {
            Airports = airportData;
            return fetch('A2_Flights.json');
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch flights: ${response.statusText}`);
            }
            return response.json();
        })
        .then(flightData => {
            Flights = flightData;
            MergedFlights = mergeFlightData(Flights, Airports);  // Merge flights and airports
            
            console.log("Event listener added for filter button.");  // Log to confirm listener is added
            
            // Set up event listeners
            document.getElementById('applyFiltersButton').addEventListener('click', filterFlights);
            document.getElementById('topFlightCountBtn').addEventListener('click', showTopFlightCounts);
            document.getElementById('topTimeDiffBtn').addEventListener('click', showTopTimeDifferences);
            document.getElementById('topDistanceBtn').addEventListener('click', showTopDistances);
            document.getElementById('filterCitySelect').addEventListener('change', filterAirports);
            document.getElementById('filterSearchTermInput').addEventListener('input', filterAirports);
            document.getElementById('applyFiltersButton').addEventListener('click', function() {
                const sourceAirport = document.getElementById('filterSourceAirportSelect').value;
                const destinationAirport = document.getElementById('filterDestinationAirportSelect').value;
                const airline = document.getElementById('filterAirlineSelect').value;
                const aircraft = document.getElementById('filterAircraftSelect').value;
            
                const filteredFlights = filterFlights(sourceAirport, destinationAirport, airline, aircraft);
                displayFilteredFlights(filteredFlights);
            });
            

            // Populate dropdowns
            displayAllSourceAirports();
            displayAllDestinationAirports();
            displayAllAirlines();
            displayAllAircrafts();

            // Populate the airport city dropdown
            displayAllCities();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
            alert('Failed to load data. Please try again later.');
        });
}


// Merge flight data with airports
function mergeFlightData(flights, airports) {
    return flights.map(flight => {
        const sourceAirport = airports.find(airport => airport.id === flight.source_airport_id);
        const destinationAirport = airports.find(airport => airport.id === flight.destination_airport_id);

        const distance = calculateFlightDistance(flight.source_airport_id, flight.destination_airport_id);

        return {
            source_airport: sourceAirport,
            destination_airport: destinationAirport,
            codeshare: flight.codeshare,
            aircraft: flight.aircraft,
            airline: {
                code: flight.airline,
                name: flight.airline_name,
                country: flight.airline_country
            },
            distance: distance 
        };
    });
}


// =========================
// Step 2: Create a mapping function + Add Timestamp
// =========================

// Step 1: Helper function to get the current timestamp
function getCurrentTimestamp() {
    return new Date().toISOString();
}

// Step 2: Mapping function to modify the dataset
function mapFlightsData(flightsData, operation) {
    return flightsData.map(flight => {
        // Make a copy of the flight object to avoid mutating the original data
        const modifiedFlight = { ...flight };

        // Apply the operation function passed as a parameter
        operation(modifiedFlight);

        // Update or add the timestamp for this operation
        modifiedFlight.timestamp = getCurrentTimestamp();

        return modifiedFlight;
    });
}

// Example of a simple operation function to modify each flight's aircraft type
function updateAircraft(flight) {
    if (flight.aircraft && flight.aircraft.length > 0) {
        flight.aircraft[0] = flight.aircraft[0].toUpperCase();  // Just an example operation
    }
}

// Step 3: Example usage
const updatedFlights = mapFlightsData(MergedFlights, updateAircraft);  // Use the correct variable



// Output the updated flights data with timestamps
console.log(JSON.stringify(updatedFlights, null, 2));

// Step 4: Here i would save the updated data to a new JSON file --> note I originally did this 'but The error ReferenceError: fs is not defined occurs when testing because the fs (file system) module, which is available in Node.js for reading and writing files, is being used without importing it into the script.
//fs.writeFileSync('updated_flights_with_timestamps.json', JSON.stringify(updatedFlights, null, 2), 'utf8');

// function filterFlights() {
//     clearFlightResults();  // Clear previous flight data
    
//     // Get values from the dropdowns
//     const sourceAirport = document.getElementById('filterSourceAirportSelect').value;
//     const destinationAirport = document.getElementById('filterDestinationAirportSelect').value;
//     const airline = document.getElementById('filterAirlineSelect').value;
//     const aircraft = document.getElementById('filterAircraftSelect').value;

//     console.log(sourceAirport, destinationAirport, airline, aircraft); // Log the values to debug

//     // Check if all values are 'any'
//     if (sourceAirport === "any" && destinationAirport === "any" && airline === "any" && aircraft === "any") {
//         console.log('All filters are set to "any"');
//         const userConfirmed = confirm("Are you sure you wish to output all data? This may cause significant web page errors.");
//         if (!userConfirmed) {
//             console.log('User canceled loading all data.');
//             return;  // Exit the function if the user chooses 'Cancel'
//         }
//     }

//     // Continue with filtering logic...
//     const filteredFlights = MergedFlights.filter(flight => {
//         const matchesSource = (sourceAirport === "any") || (flight.source_airport.iata === sourceAirport);
//         const matchesDestination = (destinationAirport === "any") || (flight.destination_airport.iata === destinationAirport);
//         const matchesAirline = (airline === "any") || (flight.airline.code === airline);
//         const matchesAircraft = (aircraft === "any") || (flight.aircraft.includes(aircraft));
//         return matchesSource && matchesDestination && matchesAirline && matchesAircraft;
//     });

//     displayFilteredFlights(filteredFlights);
// }

//I have had to modify my original function for better testability using Jest, we need to refactor it so that the function doesn't rely directly on DOM elements like document.getElementById. This can be achieved by passing in the filtering criteria as parameters, making the logic independent of the DOM and easy to test.

function filterFlights(sourceAirport = "any", destinationAirport = "any", airline = "any", aircraft = "any") {
    // Clear previous flight data (you'll still need to call this where the DOM is used)
    clearFlightResults(); 

    console.log(sourceAirport, destinationAirport, airline, aircraft); // Log the values to debug

    // Check if all values are 'any'
    if (sourceAirport === "any" && destinationAirport === "any" && airline === "any" && aircraft === "any") {
        console.log('All filters are set to "any"');
        const userConfirmed = confirm("Are you sure you wish to output all data? This may cause significant web page errors.");
        if (!userConfirmed) {
            console.log('User canceled loading all data.');
            return;  // Exit the function if the user chooses 'Cancel'
        }
    }

    // Filter logic, decoupled from the DOM
    const filteredFlights = MergedFlights.filter(flight => {
        const matchesSource = (sourceAirport === "any") || (flight.source_airport.iata === sourceAirport);
        const matchesDestination = (destinationAirport === "any") || (flight.destination_airport.iata === destinationAirport);
        const matchesAirline = (airline === "any") || (flight.airline.code === airline);
        const matchesAircraft = (aircraft === "any") || (flight.aircraft.includes(aircraft));
        return matchesSource && matchesDestination && matchesAirline && matchesAircraft;
    });

    return filteredFlights;
}


// =========================
// Step 3: Data Analysis
// =========================


function calculateFlightStatistics() {
    const flightStats = [];
    
    Flights.forEach(flight => {
        const sourceAirport = Airports.find(airport => airport.id === flight.source_airport_id);
        const destinationAirport = Airports.find(airport => airport.id === flight.destination_airport_id);

        if (!sourceAirport || !destinationAirport) return;

        const existingStat = flightStats.find(stat => 
            (stat.source === sourceAirport.iata && stat.destination === destinationAirport.iata) ||
            (stat.source === destinationAirport.iata && stat.destination === sourceAirport.iata)
        );

        if (existingStat) {
            existingStat.flightCount++;
        } else {
            flightStats.push({
                source: sourceAirport.iata,
                destination: destinationAirport.iata,
                flightCount: 1,
                timeDifference: Math.abs(sourceAirport.timezone - destinationAirport.timezone),
                distance: calculateFlightDistance(flight.source_airport_id, flight.destination_airport_id)
            });
        }
    });

    return { flightStats };
}


// =========================
// Step 4: Interactive Web Page
// =========================

// Populate the source airport dropdown
function displayAllSourceAirports() {
    const select = document.getElementById("filterSourceAirportSelect");
    select.innerHTML = '<option value="any">Any</option>';
    const sortedAirports = Airports.slice().sort((a, b) => a.name.localeCompare(b.name));
    sortedAirports.forEach(airport => {
        const option = document.createElement('option');
        option.value = airport.iata;
        option.textContent = `${airport.name} (${airport.iata})`;
        select.appendChild(option);
    });
}

// Populate the destination airport dropdown
function displayAllDestinationAirports() {
    const select = document.getElementById("filterDestinationAirportSelect");
    select.innerHTML = '<option value="any">Any</option>';
    const sortedAirports = Airports.slice().sort((a, b) => a.name.localeCompare(b.name));
    sortedAirports.forEach(airport => {
        const option = document.createElement('option');
        option.value = airport.iata;
        option.textContent = `${airport.name} (${airport.iata})`;
        select.appendChild(option);
    });
}

// Populate the airline dropdown
function displayAllAirlines() {
    const select = document.getElementById("filterAirlineSelect");
    const uniqueAirlines = [...new Set(MergedFlights.map(flight => flight.airline.code))];
    select.innerHTML = '<option value="any">Any</option>';
    const sortedAirlines = uniqueAirlines.map(code => MergedFlights.find(flight => flight.airline.code === code).airline)
                                          .sort((a, b) => a.name.localeCompare(b.name));
    sortedAirlines.forEach(airline => {
        const option = document.createElement('option');
        option.value = airline.code;
        option.textContent = `${airline.name} (${airline.code})`;
        select.appendChild(option);
    });
}

// Populate the aircraft dropdown
function displayAllAircrafts() {
    const select = document.getElementById("filterAircraftSelect");
    const allAircrafts = MergedFlights.flatMap(flight => flight.aircraft);
    const uniqueAircrafts = [...new Set(allAircrafts)];
    select.innerHTML = '<option value="any">Any</option>';
    const sortedAircrafts = uniqueAircrafts.sort();
    sortedAircrafts.forEach(aircraft => {
        const option = document.createElement('option');
        option.value = aircraft;
        option.textContent = aircraft;
        select.appendChild(option);
    });
}



// Display the filtered flights
function displayFilteredFlights(filteredFlights) {
    const dataDiv = document.getElementById("flightResultsDisplayDiv");
    dataDiv.innerHTML = "";  // Clear previous results

    if (filteredFlights.length === 0) {
        dataDiv.textContent = "No flights match the selected criteria.";
        return;
    }

    filteredFlights.forEach(flight => {
        const flightInfo = `
            <p>
                <strong>Source Airport:</strong> ${flight.source_airport.name}, ${flight.source_airport.city}, ${flight.source_airport.country} <br/>
                <strong>Destination Airport:</strong> ${flight.destination_airport.name}, ${flight.destination_airport.city}, ${flight.destination_airport.country} <br/>
                <strong>Airline:</strong> ${flight.airline.name} (${flight.airline.code}), Country: ${flight.airline.country} <br/>
                <strong>Aircraft:</strong> ${flight.aircraft} <br/>
                <strong>Codeshare:</strong> ${flight.codeshare ? "Yes" : "No"} <br/>
                <strong>Distance:</strong> ${flight.distance.toFixed(2)} km <br/>
            </p>
            <hr/>
        `;
        dataDiv.innerHTML += flightInfo;
    });
}


// Display the top 10 busiest routes
function showTopFlightCounts() {
    clearStatistics();  // Clear the previous stats

    const flightStats = calculateFlightStatistics().flightStats;
    
    // Sort by flight count and take the top 10
    const sortedByFlightCount = flightStats.sort((a, b) => b.flightCount - a.flightCount).slice(0, 10);
    
    // Calculate the max, min, and average flight counts
    const flightCounts = flightStats.map(flight => flight.flightCount);
    const maxCount = Math.max(...flightCounts);
    const minCount = Math.min(...flightCounts);
    const avgCount = (flightCounts.reduce((sum, count) => sum + count, 0) / flightCounts.length).toFixed(2);
    
    // Prepare the flight frequency information
    const frequencyInfo = `
        <p><strong>Flight Frequency Information</strong><br/>
        <br>
        Maximum: ${maxCount}<br/>
        Minimum: ${minCount}<br/>
        Average: ${avgCount}</p>
    `;
    
    // Prepare the top 10 busiest routes
    const busiestRoutes = sortedByFlightCount.map(flight => 
        `<tr><td>${flight.source}</td><td>${flight.destination}</td><td>${flight.flightCount}</td></tr>`
    ).join('');
    
    const topRoutesTable = `
        <table>
            <tr>
                <th>Airport 1</th>
                <th>Airport 2</th>
                <th>Number of Flights</th>
            </tr>
            ${busiestRoutes}
        </table>
    `;
    
    // Display the results
    const statisticsDiv = document.getElementById('statisticsDisplayDiv');
    statisticsDiv.innerHTML = frequencyInfo + topRoutesTable;
}

// Display the top 10 routes with the greatest time difference
function showTopTimeDifferences() {
    clearStatistics();  // Clear previous results

    const flightStats = calculateFlightStatistics().flightStats;
    const sortedByTimeDifference = flightStats.sort((a, b) => b.timeDifference - a.timeDifference).slice(0, 10);

    const timeDifferenceTable = sortedByTimeDifference.map(flight =>
        `<tr><td>${flight.source}</td><td>${flight.destination}</td><td>${flight.timeDifference}</td></tr>`
    ).join('');

    const tableHTML = `
        <table>
            <tr>
                <th>Airport 1</th>
                <th>Airport 2</th>
                <th>Time Difference (hours)</th>
            </tr>
            ${timeDifferenceTable}
        </table>
    `;

    document.getElementById('statisticsDisplayDiv').innerHTML = tableHTML;
}

// Display the top 10 longest routes by distance
function showTopDistances() {
    clearStatistics();  // Clear previous results

    const flightStats = calculateFlightStatistics().flightStats;
    const sortedByDistance = flightStats.sort((a, b) => b.distance - a.distance).slice(0, 10);

    const distanceTable = sortedByDistance.map(flight =>
        `<tr><td>${flight.source}</td><td>${flight.destination}</td><td>${flight.distance.toFixed(2)} km</td></tr>`
    ).join('');

    const tableHTML = `
        <table>
            <tr>
                <th>Airport 1</th>
                <th>Airport 2</th>
                <th>Distance (km)</th>
            </tr>
            ${distanceTable}
        </table>
    `;

    document.getElementById('statisticsDisplayDiv').innerHTML = tableHTML;
}

// Clear previous flight results
function clearFlightResults() {
    const dataDiv = document.getElementById("flightResultsDisplayDiv");
    if (dataDiv) dataDiv.innerHTML = "";
}

// Clear previous statistics
function clearStatistics() {
    const statisticsDiv = document.getElementById('statisticsDisplayDiv');
    if (statisticsDiv) statisticsDiv.innerHTML = "";
}


// Calculate the distance between two airports using the Haversine formula
function calculateFlightDistance(sourceId, destinationId) {
    console.log("Airports Array: ", Airports);  // Log the global Airports array

    const sourceAirport = Airports.find(airport => airport.id === sourceId);
    const destinationAirport = Airports.find(airport => airport.id === destinationId);

    console.log("Source Airport: ", sourceAirport);  // Log the source airport found
    console.log("Destination Airport: ", destinationAirport);  // Log the destination airport found

    // Check if both airports are found
    if (!sourceAirport || !destinationAirport) {
        console.warn('One or both airports not found:', sourceId, destinationId);
        return 0;  // Return 0 or some default value when airport data is missing
    }

    const R = 6371;  // Radius of the Earth in kilometers
    const dLat = (destinationAirport.latitude - sourceAirport.latitude) * (Math.PI / 180);  // Latitude difference in radians
    const dLon = (destinationAirport.longitude - sourceAirport.longitude) * (Math.PI / 180);  // Longitude difference in radians

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(sourceAirport.latitude * (Math.PI / 180)) * Math.cos(destinationAirport.latitude * (Math.PI / 180)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;  // Distance in kilometers

    return distance;
}



function displayAllCities() {
    const citySelect = document.getElementById("filterCitySelect");
    citySelect.innerHTML = '<option value="any">Any</option>';
    
    const uniqueCities = [...new Set(Airports.map(airport => airport.city))]; // Get unique cities
    uniqueCities.sort().forEach(city => {
        const option = document.createElement('option');
        option.value = city;
        option.textContent = city;
        citySelect.appendChild(option);
    });
}

function filterAirports() {
    const city = document.getElementById("filterCitySelect").value;
    const searchTerm = document.getElementById("filterSearchTermInput").value.toLowerCase();
    
    const filteredAirports = Airports.filter(airport => {
        const matchesCity = (city === "any") || (airport.city === city);
        const matchesSearchTerm = airport.name.toLowerCase().includes(searchTerm);
        return matchesCity && matchesSearchTerm;
    });
    
    displayFilteredAirports(filteredAirports);
}

function displayFilteredAirports(filteredAirports) {
    const dataDiv = document.getElementById("airportFilterDisplayDiv");
    dataDiv.innerHTML = ""; // Clear previous results

    if (filteredAirports.length === 0) {
        dataDiv.textContent = "No airports match the selected criteria.";
        return;
    }

    filteredAirports.forEach(airport => {
        const altitude = airport.altitude ? `${airport.altitude} feet` : 'N/A'; // Check if altitude exists, otherwise show 'N/A'
        const airportInfo = `
            <p>
                <strong>${airport.name}</strong> (${airport.iata ? airport.iata : 'N/A'}), ${airport.city}, ${airport.country} <br/>
                Latitude: ${airport.latitude}, Longitude: ${airport.longitude}, Timezone: GMT${airport.timezone}, <br/>
               Altitude: ${altitude}
            </p>
            <hr/>
        `;
        dataDiv.innerHTML += airportInfo;
    });
}


module.exports = {
    fetchAirportsAndFlights,
    mergeFlightData,
    mapFlightsData,  // Corrected name --> i originally put this wrong which failed my tests
    filterFlights,
    calculateFlightDistance,
    calculateFlightStatistics
};
