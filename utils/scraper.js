const { Cluster } = require('puppeteer-cluster');

const scrapeLinks = async (link1, link2) => {
  // Create a cluster with 2 workers
  const cluster = await Cluster.launch({
    concurrency: Cluster.CONCURRENCY_PAGE, // Each worker gets its own page
    maxConcurrency: 2, // 2 workers, one for each link
    puppeteerOptions: {
      headless: true, // You can change this to false if you want to see the browser open
      defaultViewport: null, 
      userDataDir: './tmp'
    },
    monitor: true, // Enable monitoring
  });

  // Function to scrape a page with retries
  const scrapePage = async ({ page, data: url }) => {
    const maxRetries = 3; // Maximum number of retries for scraping
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 120000 });

        let movies = [];
        while (true) {
          try {
            await page.waitForSelector('div.film-poster', { timeout: 120000 });
            await page.waitForSelector('p.poster-viewingdata', { timeout: 120000 });
          } catch (error) {
            console.error(`Timeout waiting for films on ${url}: ${error.message}`);
            return; // Exit early if selector doesn't load
          }

          const filmsHandles = await page.$$('div.film-poster');
          const ratingHandles = await page.$$('p.poster-viewingdata');

          for (let i = 0; i < filmsHandles.length; i++) {
            let film = 0;
            let rating = 0;

            try {
              film = await page.evaluate(el => el.querySelector('img').getAttribute('alt'), filmsHandles[i]) || 0;
            } catch (error) {
              console.error('Error fetching film:', error);
            }

            try {
              rating = await page.evaluate(el => {
                const ratingElement = el.querySelector('.rating');
                return ratingElement ? ratingElement.className.match(/rated-(\d+)/)[1] : 0;
              }, ratingHandles[i]);
            } catch (error) {
              console.error('Error fetching rating:', error);
            }

            movies.push({ film, rating });
          }

          const nextButton = await page.$('a.next');
          if (nextButton) {
            try {
              await nextButton.click();
              await page.waitForNavigation({ waitUntil: 'load', timeout: 60000 });
            } catch (error) {
              console.error(`Error navigating to next page: ${error.message}`);
              break;
            }
          } else {
            break;
          }
        }

        console.log(`Movies from ${url}:`, movies);
        return movies; // Return the results after scraping successfully

      } catch (error) {
        console.error(`Attempt ${attempt + 1} failed for ${url}: ${error.message}`);
        if (attempt === maxRetries - 1) {
          console.error(`Max retries reached for ${url}`);
          return []; // Return an empty array if all retries fail
        }
        await new Promise(resolve => setTimeout(resolve, 5000)); // Delay before retrying
      }
    }
  };

  // Queue both URLs to be scraped
  const results = await Promise.all([
    cluster.execute(link1, scrapePage),
    cluster.execute(link2, scrapePage)
  ]);

  await cluster.idle();
  await cluster.close();

  return results; // Return scraped data
};

module.exports = { scrapeLinks };
