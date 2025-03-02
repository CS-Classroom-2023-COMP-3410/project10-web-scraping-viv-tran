// const axios = require('axios');
// const cheerio = require('cheerio');
// const fs = require('fs');
// const path = require('path');

// (async () => {
//     try {
//         const url = 'https://denverpioneers.com/index.aspx';
//         const { data } = await axios.get(url);
//         const $ = cheerio.load(data);
        
//         const events = [];
        
//         // Adjust the selectors below based on the actual DOM structure of the carousel.
//         $('div.carousel-top .carousel-item').each((i, element) => {
//             const duTeam = $(element).find('.du-team').text().trim();
//             const opponent = $(element).find('.opponent').text().trim();
//             const date = $(element).find('.event-date').text().trim();
            
//             if (duTeam && opponent && date) {
//                 events.push({
//                     duTeam,
//                     opponent,
//                     date
//                 });
//             }
//         });
        
//         // Fallback sample data in case the extraction returns no results
//         if (events.length === 0) {
//             events.push(
//                 {
//                     duTeam: "DU Men's Basketball",
//                     opponent: "Boise State Broncos",
//                     date: "November 15, 2023"
//                 },
//                 {
//                     duTeam: "DU Football",
//                     opponent: "Colorado State Rams",
//                     date: "November 18, 2023"
//                 },
//                 {
//                     duTeam: "DU Women's Soccer",
//                     opponent: "Air Force Falcons",
//                     date: "November 24, 2023"
//                 }
//             );
//         }
        
//         const result = { events };
        
//         // Ensure the results directory exists
//         const resultsDir = path.join(__dirname, 'results');
//         if (!fs.existsSync(resultsDir)) {
//             fs.mkdirSync(resultsDir);
//         }
        
//         // Save the results to a JSON file
//         fs.writeFileSync(path.join(resultsDir, 'athletic_events.json'), JSON.stringify(result, null, 4));
//         console.log("Extraction complete. Data saved to results/athletic_events.json");
//     } catch (error) {
//         console.error('Error occurred:', error);
//     }
// })();

const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const URL = 'https://denverpioneers.com/index.aspx';
const OUTPUT_FILE = path.join(__dirname, 'results/athletic_events.json');

async function scrapeAthletics() {
    try {
        const { data } = await axios.get(URL);
        const $ = cheerio.load(data);

        const scriptContent = $('section[aria-labelledby="h2_scoreboard"] script').html();
        const jsonString = scriptContent.match(/var obj = (\{.*\});/)[1];
        const eventData = JSON.parse(jsonString);

        const events = eventData.data.map(event => ({
            duTeam: event.sport?.title,  // DU Team Name
            opponent: event.opponent?.title,  // Opponent Team Name
            date: event.date  // Event Date
        }));

        fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
        
        // Write data to JSON file
        fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ events }, null, 4));
        console.log(`Scraped ${events.length} events and saved to ${OUTPUT_FILE}`);
    } catch (error) {
        console.error('Error scraping athletics:', error);
    }
}

scrapeAthletics();