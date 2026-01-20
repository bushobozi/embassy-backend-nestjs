import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import puppeteer, { Browser } from 'puppeteer';
import {
  NewsHeadlineDto,
  NewsHeadlinesResponseDto,
} from './dto/NewsHeadline.dto';

interface CachedHeadlines {
  headlines: NewsHeadlineDto[];
  fetchedAt: Date;
}

@Injectable()
export class NewsService implements OnModuleInit {
  private readonly logger = new Logger(NewsService.name);
  private readonly NEW_VISION_URL = 'https://www.newvision.co.ug/';
  private readonly CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
  private cache: CachedHeadlines | null = null;

  async onModuleInit() {
    // Fetch headlines on startup
    this.logger.log('Initializing news service, fetching initial headlines...');
    await this.refreshHeadlines();
  }

  @Interval(1800000) // 30 minutes in milliseconds
  async handleScheduledRefresh() {
    this.logger.log(
      'Scheduled refresh: Fetching latest headlines from New Vision Uganda',
    );
    await this.refreshHeadlines();
  }

  async getTopHeadlines(): Promise<NewsHeadlinesResponseDto> {
    // If cache is empty or expired, refresh
    if (!this.cache || this.isCacheExpired()) {
      await this.refreshHeadlines();
    }

    const nextRefreshAt = this.cache
      ? new Date(this.cache.fetchedAt.getTime() + this.CACHE_TTL_MS)
      : new Date(Date.now() + this.CACHE_TTL_MS);

    return {
      headlines: this.cache?.headlines || [],
      fetchedAt:
        this.cache?.fetchedAt.toISOString() || new Date().toISOString(),
      nextRefreshAt: nextRefreshAt.toISOString(),
    };
  }

  async refreshHeadlines(): Promise<NewsHeadlinesResponseDto> {
    try {
      const headlines = await this.scrapeNewVisionHeadlines();
      this.cache = {
        headlines,
        fetchedAt: new Date(),
      };
      this.logger.log(
        `Successfully fetched ${headlines.length} headlines from New Vision Uganda`,
      );
    } catch (error) {
      this.logger.error(
        'Failed to fetch headlines from New Vision Uganda',
        error,
      );
      // Keep stale cache if available (graceful degradation)
      if (!this.cache) {
        this.cache = {
          headlines: [],
          fetchedAt: new Date(),
        };
      }
    }

    const nextRefreshAt = new Date(
      this.cache.fetchedAt.getTime() + this.CACHE_TTL_MS,
    );

    return {
      headlines: this.cache.headlines,
      fetchedAt: this.cache.fetchedAt.toISOString(),
      nextRefreshAt: nextRefreshAt.toISOString(),
    };
  }

  private async scrapeNewVisionHeadlines(): Promise<NewsHeadlineDto[]> {
    let browser: Browser | undefined;
    try {
      // Enhanced Puppeteer configuration for production environments
      browser = await puppeteer.launch({
        headless: true,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage', // Overcome limited resource problems
          '--disable-accelerated-2d-canvas',
          '--disable-gpu',
          '--window-size=1920x1080',
          '--disable-features=VizDisplayCompositor',
        ],
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
      });

      const page = await browser.newPage();
      await page.setUserAgent(
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      );

      // More lenient timeout and wait condition for production
      await page.goto(this.NEW_VISION_URL, {
        waitUntil: 'domcontentloaded', // Less strict than networkidle2
        timeout: 60000, // 60 seconds for slower networks
      });

      // Wait for content to load with longer timeout
      await page.waitForSelector('a', { timeout: 15000 });

      const headlines = await page.evaluate(() => {
        const results: {
          title: string;
          url: string;
          imageUrl?: string;
        }[] = [];

        // More robust selectors with fallbacks
        const links = Array.from(
          document.querySelectorAll(
            'a[href*="/category/"], a[href*="/article/"], article a, .article-link',
          ),
        );

        for (const link of links) {
          if (results.length >= 4) break;

          const anchor = link as HTMLAnchorElement;
          const href = anchor.href;

          // Skip certain categories
          if (
            href.includes('/category/gaming') ||
            href.includes('/category/ITHUBA') ||
            href.includes('/supplements')
          ) {
            continue;
          }

          // Get text content, trying different elements
          let title =
            anchor.textContent?.trim() ||
            anchor.getAttribute('aria-label') ||
            '';

          // Clean up the title
          title = title.replace(/\s+/g, ' ').trim();

          // Skip if title is too short or contains unwanted patterns
          if (
            !title ||
            title.length < 15 ||
            title.includes('Read More') ||
            title.includes('LIVE TV') ||
            title.includes('EXCHANGE RATES') ||
            /^\d+\s+(hours?|minutes?|days?)\s+ago$/.test(title)
          ) {
            continue;
          }

          // Enhanced image extraction with multiple strategies
          let imageUrl: string | undefined;

          // Try multiple strategies to find images
          const img =
            anchor.querySelector('img') || // Image inside anchor
            anchor.closest('article')?.querySelector('img') || // Image in parent article
            anchor.parentElement?.querySelector('img') || // Image in parent element
            (anchor.nextElementSibling as HTMLElement)?.querySelector('img'); // Image in sibling

          if (img) {
            // Try multiple image source attributes
            const rawImageUrl =
              img.getAttribute('src') ||
              img.getAttribute('data-src') ||
              img.getAttribute('data-lazy-src') ||
              img.getAttribute('data-original') ||
              img.getAttribute('srcset')?.split(',')[0]?.trim()?.split(' ')[0] ||
              undefined;

            // Ensure it's a full URL
            if (rawImageUrl) {
              try {
                if (rawImageUrl.startsWith('http')) {
                  imageUrl = rawImageUrl;
                } else if (rawImageUrl.startsWith('//')) {
                  imageUrl = 'https:' + rawImageUrl;
                } else if (rawImageUrl.startsWith('/')) {
                  imageUrl = 'https://www.newvision.co.ug' + rawImageUrl;
                } else {
                  imageUrl = new URL(
                    rawImageUrl,
                    'https://www.newvision.co.ug/',
                  ).href;
                }
              } catch (e) {
                // Invalid URL, skip
                imageUrl = undefined;
              }
            }
          }

          // Check if we already have this headline
          const isDuplicate = results.some(
            (h) => h.title === title || h.url === href,
          );

          if (!isDuplicate && href) {
            results.push({
              title,
              url: href,
              imageUrl,
            });
          }
        }

        return results;
      });

      await browser.close();

      this.logger.log(
        `Scraped ${headlines.length} headlines, ${headlines.filter((h) => h.imageUrl).length} with images`,
      );

      return headlines.map((h) => ({
        ...h,
        source: 'New Vision Uganda',
      }));
    } catch (error) {
      if (browser) {
        await browser.close();
      }
      // Enhanced error logging for debugging production issues
      this.logger.error(
        `Failed to scrape headlines: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  private isCacheExpired(): boolean {
    if (!this.cache) return true;
    const now = Date.now();
    const cacheAge = now - this.cache.fetchedAt.getTime();
    return cacheAge >= this.CACHE_TTL_MS;
  }
}
