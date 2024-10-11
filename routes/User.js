const express = require('express');
const { generateLetterboxdLink } = require('../utils/linkgenerator'); // Link generator
const { scrapeLinks } = require('../utils/scraper'); // Scraper logic

const router = express.Router();

router.get('/', (req, res) => {
    res.render('form', { title: 'Enter Usernames' });
});

router.post('/form', async (req, res) => {
    const { username1, username2 } = req.body;

    // Generate links for both usernames
    const link1 = generateLetterboxdLink(username1);
    const link2 = generateLetterboxdLink(username2);

    console.log(link1, link2); // For debugging purposes

    try {
        // Scrape data from the generated links
        const scrapedData = await scrapeLinks(link1, link2);

        // Pass the scraped data to the template (or handle it as needed)
        res.render('usernames-received', { username1, username2, scrapedData });
    } catch (error) {
        console.error('Error scraping data:', error);
        res.status(500).send('An error occurred while scraping data');
    }
});

module.exports = router;
