import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Interval } from '@nestjs/schedule';
import axios from 'axios';
import * as cheerio from 'cheerio';
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
    try {
      // Fetch HTML using axios (works on serverless environments like Vercel)
      const response = await axios.get(this.NEW_VISION_URL, {
        headers: {
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        timeout: 30000,
      });

      const html = response.data as string;
      const $ = cheerio.load(html);

      // Build a map of article IDs to their image URLs from embedded JS data
      // The page embeds article data with images in the body content
      const articleImageMap = this.extractArticleImageMap(html);

      const results: { title: string; url: string; imageUrl?: string }[] = [];

      // Find all article links
      $('a[href*="/category/"], a[href*="/article/"]').each((_, element) => {
        if (results.length >= 4) return false; // Stop after 4 headlines

        const $anchor = $(element);
        const href = $anchor.attr('href');

        if (!href) return;

        // Build full URL
        const fullUrl = href.startsWith('http')
          ? href
          : `https://www.newvision.co.ug${href}`;

        // Skip certain categories
        if (
          fullUrl.includes('/category/gaming') ||
          fullUrl.includes('/category/ITHUBA') ||
          fullUrl.includes('/supplements') ||
          fullUrl.match(/\/category\/\w+\?id=/) // Skip category index pages like /category/world?id=22
        ) {
          return;
        }

        // Get title from text content
        const title = $anchor.text().trim().replace(/\s+/g, ' ');

        // Skip if title is too short or contains unwanted patterns
        if (
          !title ||
          title.length < 15 ||
          title.includes('Read More') ||
          title.includes('LIVE TV') ||
          title.includes('EXCHANGE RATES') ||
          /^\d+\s+(hours?|minutes?|days?)\s+ago$/i.test(title)
        ) {
          return;
        }

        // Extract article ID from URL (e.g., NV_226586)
        const articleIdMatch = href.match(/(NV_\d+|SPONS_\d+)/);
        const articleId = articleIdMatch ? articleIdMatch[1] : null;

        // Try to get image URL from different sources
        let imageUrl: string | undefined;

        // Strategy 1: Get image from embedded JS data using article ID
        if (articleId && articleImageMap.has(articleId)) {
          imageUrl = articleImageMap.get(articleId);
        }

        // Strategy 2: Image inside the anchor (for server-rendered images)
        if (!imageUrl) {
          let $img = $anchor.find('img').first();

          // Try parent and sibling containers
          if (!$img.length) {
            $img = $anchor.parent().find('img').first();
          }
          if (!$img.length) {
            $img = $anchor.siblings().find('img').first();
          }
          if (!$img.length) {
            $img = $anchor.parent().parent().find('img').first();
          }

          if ($img.length) {
            const rawImageUrl =
              $img.attr('src') ||
              $img.attr('data-src') ||
              $img.attr('data-lazy-src') ||
              $img.attr('data-original');

            if (
              rawImageUrl &&
              rawImageUrl.startsWith('http') &&
              !rawImageUrl.startsWith('data:')
            ) {
              imageUrl = rawImageUrl;
            }
          }
        }

        // Check for duplicates
        const isDuplicate = results.some(
          (h) => h.title === title || h.url === fullUrl,
        );

        if (!isDuplicate) {
          results.push({
            title,
            url: fullUrl,
            imageUrl,
          });
        }
      });

      this.logger.log(
        `Scraped ${results.length} headlines, ${results.filter((h) => h.imageUrl).length} with images`,
      );

      return results.map((h) => ({
        ...h,
        source: 'New Vision Uganda',
      }));
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      const errorStack = error instanceof Error ? error.stack : undefined;
      this.logger.error(
        `Failed to scrape headlines: ${errorMessage}`,
        errorStack,
      );
      throw error;
    }
  }

  /**
   * Extract article ID to image URL mapping from embedded JavaScript data.
   * New Vision embeds article data in the page with images in the body content.
   */
  private extractArticleImageMap(html: string): Map<string, string> {
    const imageMap = new Map<string, string>();

    try {
      // Pattern to find article data: "NV_123456","Title","slug","summary","body with <img>"
      // The body contains escaped HTML with image tags
      const articlePattern =
        /"(NV_\d+|SPONS_\d+)","[^"]*","[^"]*","[^"]*","((?:[^"\\]|\\.)*)"/g;

      let match: RegExpExecArray | null;
      while ((match = articlePattern.exec(html)) !== null) {
        const articleId = match[1];
        const bodyContent = match[2];

        // Find image URL in the body content (escaped as \u003Cimg or just <img)
        // Look for S3 image URLs
        const imageMatch = bodyContent.match(
          /https:\/\/newvision-media\.s3\.amazonaws\.com\/cms\/[a-f0-9-]+\.(jpg|jpeg|png|webp|gif)/i,
        );

        if (imageMatch) {
          imageMap.set(articleId, imageMatch[0]);
        }
      }

      this.logger.debug(
        `Extracted ${imageMap.size} article images from embedded data`,
      );
    } catch (error) {
      this.logger.warn('Failed to extract article image map', error);
    }

    return imageMap;
  }

  private isCacheExpired(): boolean {
    if (!this.cache) return true;
    const now = Date.now();
    const cacheAge = now - this.cache.fetchedAt.getTime();
    return cacheAge >= this.CACHE_TTL_MS;
  }
}
