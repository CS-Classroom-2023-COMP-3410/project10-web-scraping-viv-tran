const axios = require('axios');
const cheerio = require('cheerio');
const fs = require('fs');
const path = require('path');

const URL = 'https://bulletin.du.edu/undergraduate/majorsminorscoursedescriptions/traditionalbachelorsprogrammajorandminors/computerscience/#coursedescriptionstext';

(async () => {
  try {
    const { data } = await axios.get(URL);
    const $ = cheerio.load(data);

    const courses = [];

    // Select each course block within the bulletin
    $('.sc_sccoursedescs .courseblock').each((_, element) => {
      const courseInfo = $(element).find('.courseblocktitle strong').text().trim();
      const courseDesc = $(element).find('.courseblockdesc').text().trim();

      // Regex to capture course code and title
      const match = courseInfo.match(/COMP\s(\d{4})\s(.+?)\s\(\d+\sCredits\)/);
      if (!match) return;

      const courseNumber = parseInt(match[1], 10);
      const courseCode = `COMP-${match[1]}`;
      const courseTitle = match[2];

      // Include courses starting with 3XXX or 4XXX that:
      // - Have no "Prerequisite" in the description OR
      // - Have an empty description
      if ((courseNumber >= 3000 && courseNumber < 5000) &&
          (!courseDesc.toLowerCase().includes('prerequisite') || courseDesc === '')) {
        courses.push({
          course: courseCode,
          title: courseTitle,
        });
      }
    });

    // Create the results directory if it doesn't exist
    const resultsDir = path.join(__dirname, 'results');
    if (!fs.existsSync(resultsDir)) {
      fs.mkdirSync(resultsDir);
    }

    // Save the data into a JSON file
    const outputPath = path.join(resultsDir, 'bulletin.json');
    fs.writeFileSync(outputPath, JSON.stringify({ courses }, null, 4));

    console.log(` Data successfully saved to ${outputPath}`);
  } catch (error) {
    console.error('Error:', error.message);
  }
})();
