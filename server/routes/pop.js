const express = require("express");
const router = express.Router();
const axios = require("axios");

// Define the layout for the admin views
const adminLayout = '../views/layouts/admin';

// Define the route to fetch population data
router.get("/pop", async (req, res) => {
    let populationData;
    let error = null;

    try {
        // Make a request to the population API endpoint with the API key included in the headers
        const response = await axios.get('https://api.api-ninjas.com/v1/city', {
            params: {
                name: 'Istanbul'
            },
            headers: {
                'X-Api-Key': 'iQ7pPfaXcIpNTNAasd/+TQ==6NCW1SVoqnDbbaMM' // Your API key
            }
        });

        // Check if the response status code is 200 (OK)
        if (response.status === 200) {
            // Extract population data from the response
            populationData = response.data[0].population;
        } else {
            // If the response status code is not 200, handle the error
            throw new Error("Error fetching population data. Please try again.");
        }
    } catch (err) {
        // Handle any errors that occur during the request
        console.error("Error fetching population data:", err);
        error = "Error fetching population data. Please try again.";
    }

    // Render the 'admin/pop' view and pass the population data to it
    res.render('admin/pop', {
        locals: { populationData, error },
        layout: adminLayout
    });
});

module.exports = router;
