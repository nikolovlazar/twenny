import { browser } from 'k6/browser';
import { check } from 'k6';

export const options = {
  scenarios: {
    ui: {
      executor: 'constant-vus',
      vus: 1,
      duration: '15m',
      options: {
        browser: {
          type: 'chromium',
          headless: false, // Show the browser window
        },
      },
    },
  },
  thresholds: {
    checks: ['rate==1.0'], // All checks should pass
  },
};

// Configuration
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const STARTING_PAGE = 500;
const BYPASS_AUTH_SECRET = __ENV.BYPASS_AUTH_SECRET || 'k6-test-secret-123';

export default async function () {
  const context = await browser.newContext({
    extraHTTPHeaders: {
      'x-bypass-auth': BYPASS_AUTH_SECRET,
    },
  });

  const page = await context.newPage();

  try {
    // Navigate to the starting page
    const initialUrl = `${BASE_URL}/admin/tickets?page=${STARTING_PAGE}&jumpTo=true`;
    console.log(`Navigating to: ${initialUrl}`);

    await page.goto(initialUrl, {
      waitUntil: 'networkidle',
    });

    // Wait for the pagination buttons to be present
    await page.waitForSelector('#pagination-next-btn', { timeout: 10000 });
    await page.waitForSelector('#pagination-prev-btn', { timeout: 10000 });

    // Check that we're on the tickets page
    const bodyText = await page.locator('body').textContent();
    check(bodyText, {
      'tickets page loaded': (text) => text.includes('tickets'),
    });

    // Randomly navigate between next and previous for the duration
    const randomAction = Math.random() > 0.5;

    if (randomAction) {
      // Click Next button
      const nextBtn = page.locator('#pagination-next-btn');
      const isDisabled = await nextBtn.getAttribute('disabled');

      if (isDisabled === null) {
        console.log('Clicking Next button');
        await nextBtn.click();

        // Wait for navigation to complete
        await page.waitForLoadState('networkidle');

        const currentUrl = page.url();
        check(currentUrl, {
          'navigation after next click successful': (url) => url.includes('/admin/tickets'),
        });
      } else {
        console.log('Next button is disabled, skipping');
      }
    } else {
      // Click Previous button
      const prevBtn = page.locator('#pagination-prev-btn');
      const isDisabled = await prevBtn.getAttribute('disabled');

      if (isDisabled === null) {
        console.log('Clicking Previous button');
        await prevBtn.click();

        // Wait for navigation to complete
        await page.waitForLoadState('networkidle');

        const currentUrl = page.url();
        check(currentUrl, {
          'navigation after prev click successful': (url) => url.includes('/admin/tickets'),
        });
      } else {
        console.log('Previous button is disabled, skipping');
      }
    }

    // Small delay between actions (1-3 seconds)
    const sleepMs = (Math.random() * 2 + 1) * 1000;
    await page.waitForTimeout(sleepMs);

  } catch (error) {
    console.error('Error during test:', error);
    check(null, {
      'test completed without errors': () => false,
    });
  } finally {
    await page.close();
    await context.close();
  }
}

