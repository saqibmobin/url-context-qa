
import { toast } from "sonner";
import { ScrapedContent, WebsiteMetadata, LlmResponse } from "@/types";

/**
 * Processes a list of URLs and extracts content
 * This implementation uses fetch API to scrape the content
 */
export const processUrls = async (urls: string[]): Promise<{ success: boolean; content?: string; error?: string; metadata?: WebsiteMetadata[] }> => {
  // Remove empty URLs and trim whitespace
  const validUrls = urls.filter(url => url.trim() !== '').map(url => url.trim());
  
  if (validUrls.length === 0) {
    return { success: false, error: "Please enter at least one valid URL" };
  }

  try {
    // Validate URLs
    const urlValidationPromises = validUrls.map(async (url) => {
      try {
        // Check if the URL is valid
        new URL(url);
        return { url, valid: true };
      } catch (error) {
        return { url, valid: false };
      }
    });

    const validationResults = await Promise.all(urlValidationPromises);
    const invalidUrls = validationResults.filter(result => !result.valid);

    if (invalidUrls.length > 0) {
      const invalidUrlsList = invalidUrls.map(item => item.url).join(", ");
      return { 
        success: false, 
        error: `Invalid URL format: ${invalidUrlsList}` 
      };
    }

    // Scrape content from valid URLs
    const scrapingResults = await Promise.all(
      validUrls.map(url => scrapeWebsite(url))
    );

    // Check if all URLs failed to scrape
    if (scrapingResults.every(result => result.error)) {
      return {
        success: false,
        error: "Failed to scrape content from any of the provided URLs"
      };
    }

    // Collect the scraped content and metadata
    const scrapedContent = scrapingResults
      .filter(result => !result.error)
      .map(result => result.content)
      .join('\n\n');
    
    const metadata: WebsiteMetadata[] = scrapingResults
      .filter(result => !result.error)
      .map(result => ({
        url: result.url,
        title: result.title,
        description: result.description,
        lastScraped: new Date()
      }));

    return { 
      success: true, 
      content: scrapedContent,
      metadata 
    };
  } catch (error) {
    console.error("Error processing URLs:", error);
    return { 
      success: false, 
      error: "An error occurred while processing the URLs. Please try again." 
    };
  }
};

/**
 * Scrapes content from a given URL
 */
const scrapeWebsite = async (url: string): Promise<ScrapedContent> => {
  try {
    // Add protocol if missing
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Fetch the website content
    const response = await fetch(`https://corsproxy.io/?${encodeURIComponent(url)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch content: ${response.status} ${response.statusText}`);
    }

    const html = await response.text();
    
    // Parse HTML using DOMParser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    // Extract metadata
    const title = doc.querySelector('title')?.textContent || '';
    const description = doc.querySelector('meta[name="description"]')?.getAttribute('content') || '';
    
    // Extract main content
    // Remove script and style elements
    doc.querySelectorAll('script, style, nav, footer, header, aside').forEach(el => el.remove());
    
    // Get text from body
    const textContent = extractTextContent(doc.body);
    
    return {
      url,
      title,
      description,
      content: formatContentForLLM(url, title, description, textContent)
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return {
      url,
      content: '',
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

/**
 * Extracts text content from an HTML element, preserving paragraph structure
 */
const extractTextContent = (element: HTMLElement): string => {
  const paragraphs: string[] = [];
  
  // Get all text nodes and create structured content
  const extractFromNode = (node: Node) => {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text && text.length > 0) {
        paragraphs.push(text);
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const tagName = (node as Element).tagName.toLowerCase();
      
      // Add spacing for headings and paragraphs
      if (['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'div', 'section', 'article'].includes(tagName)) {
        const text = (node as Element).textContent?.trim();
        if (text && text.length > 0) {
          paragraphs.push(text);
        }
      } else {
        // Recursively extract from child nodes
        node.childNodes.forEach(child => extractFromNode(child));
      }
    }
  };
  
  extractFromNode(element);
  
  // Filter out duplicates and very short lines
  const filteredParagraphs = paragraphs.filter(text => text.length > 10);
  return filteredParagraphs.join('\n\n');
};

/**
 * Formats the scraped content for LLM processing
 */
const formatContentForLLM = (url: string, title: string, description: string, content: string): string => {
  return `
URL: ${url}
TITLE: ${title}
DESCRIPTION: ${description}
CONTENT:
${content}
`.trim();
};

/**
 * Generates an answer using the Gemini LLM
 */
export const generateAnswer = async (
  question: string, 
  context: string, 
  chatHistory: string = ""
): Promise<LlmResponse> => {
  if (!question.trim()) {
    return { answer: "", error: "Please enter a question" };
  }

  if (!context || context.trim() === "") {
    return { answer: "", error: "No context available. Please ingest at least one URL first." };
  }

  try {
    const response = await generateResponseWithGemini(question, context, chatHistory);
    return response;
  } catch (error) {
    console.error("Error generating answer:", error);
    return { 
      answer: "", 
      error: "An error occurred while generating the answer. Please try again." 
    };
  }
};

/**
 * Uses Gemini to generate a response based on the context
 */
const generateResponseWithGemini = async (
  question: string,
  context: string,
  chatHistory: string = ""
): Promise<LlmResponse> => {
  // In a real implementation, this would call the Gemini API
  // For now, we'll simulate the response with a delay
  await new Promise(resolve => setTimeout(resolve, 1200));
  
  // Create a simulated response that references the context and question
  const contextPreview = context.substring(0, 100) + '...';
  
  return {
    answer: `This is a simulated response to your question: "${question}". 
    
In a real implementation, this would be generated by Google's Gemini model based on the context extracted from your URLs.
    
The answer would be derived from the scraped content which begins with: "${contextPreview}"
    
When properly integrated with the Gemini API, this response will contain information specifically limited to what was found in your provided URLs.`
  };
};
