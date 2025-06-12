// Enhanced Technology detection content script
class TechDetector {
  constructor() {
    this.detectedTechs = new Map();
    this.pageData = {
      html: document.documentElement.outerHTML,
      url: window.location.href,
      title: document.title,
      meta: this.extractMeta(),
      scripts: this.extractScripts(),
      stylesheets: this.extractStylesheets(),
      globals: this.extractGlobals(),
      headers: this.extractHeaders(),
      cookies: this.extractCookies()
    };
  }

  extractMeta() {
    const meta = {};
    document.querySelectorAll('meta').forEach(tag => {
      const name = tag.getAttribute('name') || tag.getAttribute('property') || tag.getAttribute('http-equiv');
      const content = tag.getAttribute('content');
      if (name && content) {
        meta[name.toLowerCase()] = content;
      }
    });
    return meta;
  }

  extractScripts() {
    const scripts = [];
    document.querySelectorAll('script').forEach(script => {
      if (script.src) {
        scripts.push(script.src);
      }
      // Also check inline scripts for certain patterns
      if (script.textContent) {
        scripts.push(script.textContent);
      }
    });
    return scripts;
  }

  extractStylesheets() {
    const stylesheets = [];
    document.querySelectorAll('link[rel*="stylesheet"], style').forEach(element => {
      if (element.href) {
        stylesheets.push(element.href);
      }
      if (element.textContent) {
        stylesheets.push(element.textContent);
      }
    });
    return stylesheets;
  }

  extractGlobals() {
    const globals = [];
    const commonGlobals = [
      'React', 'Vue', 'angular', 'jQuery', '$', 'ga', 'gtag', 'fbq',
      'Shopify', 'wp', '__REACT_DEVTOOLS_GLOBAL_HOOK__', '__VUE__',
      'Polymer', 'goog', 'XRegExp', 'Hammer', 'lottie', 'bodymovin',
      'google_tag_manager', 'dataLayer', 'Stripe', 'paypal', 'PAYPAL',
      'moment', 'd3', 'Chart', '_', 'twttr', '__webpack_require__'
    ];
    
    commonGlobals.forEach(global => {
      try {
        if (window[global] !== undefined) {
          globals.push(global);
        }
      } catch (e) {
        // Some globals might throw errors when accessed
      }
    });
    
    return globals;
  }

  extractHeaders() {
    const headers = {};
    
    // Try to get headers from performance API
    try {
      const entries = performance.getEntriesByType('navigation');
      if (entries.length > 0) {
        const entry = entries[0];
        // Some header info might be available in timing data
      }
    } catch (e) {
      // Performance API might not be available
    }

    // Check for common header indicators in HTML
    if (document.querySelector('meta[http-equiv*="strict-transport-security"]')) {
      headers['strict-transport-security'] = 'detected';
    }

    if (document.querySelector('meta[http-equiv*="content-security-policy"]')) {
      headers['content-security-policy'] = 'detected';
    }

    return headers;
  }

  extractCookies() {
    const cookies = {};
    try {
      document.cookie.split(';').forEach(cookie => {
        const [name, value] = cookie.trim().split('=');
        if (name && value) {
          cookies[name] = value;
        }
      });
    } catch (e) {
      // Cookie access might be restricted
    }
    return cookies;
  }

  detectTechnologies() {
    for (const [techName, techData] of Object.entries(TECH_SIGNATURES)) {
      let confidence = 0;
      const matches = [];

      // Check HTML patterns
      if (techData.patterns.html) {
        techData.patterns.html.forEach(pattern => {
          if (pattern.test(this.pageData.html)) {
            confidence += 25;
            matches.push('HTML content');
          }
        });
      }

      // Check script sources and content
      if (techData.patterns.scripts) {
        techData.patterns.scripts.forEach(pattern => {
          this.pageData.scripts.forEach(script => {
            if (pattern.test(script)) {
              confidence += 30;
              matches.push('Script source/content');
            }
          });
        });
      }

      // Check CSS/stylesheets
      if (techData.patterns.css) {
        techData.patterns.css.forEach(pattern => {
          this.pageData.stylesheets.forEach(stylesheet => {
            if (pattern.test(stylesheet)) {
              confidence += 25;
              matches.push('Stylesheet');
            }
          });
        });
      }

      // Check global variables
      if (techData.patterns.globals) {
        techData.patterns.globals.forEach(global => {
          if (this.pageData.globals.includes(global)) {
            confidence += 35;
            matches.push('Global variable');
          }
        });
      }

      // Check DOM elements
      if (techData.patterns.dom) {
        techData.patterns.dom.forEach(selector => {
          try {
            if (document.querySelector(selector)) {
              confidence += 20;
              matches.push('DOM element');
            }
          } catch (e) {
            // Invalid selector, skip
          }
        });
      }

      // Check meta tags
      if (techData.patterns.meta) {
        techData.patterns.meta.forEach(pattern => {
          Object.entries(this.pageData.meta).forEach(([name, content]) => {
            if (pattern.test(content) || pattern.test(name)) {
              confidence += 30;
              matches.push('Meta tag');
            }
          });
        });
      }

      // Check headers (limited detection)
      if (techData.patterns.headers) {
        techData.patterns.headers.forEach(pattern => {
          Object.entries(this.pageData.headers).forEach(([name, value]) => {
            if (pattern.test(name) || pattern.test(value)) {
              confidence += 40;
              matches.push('HTTP header');
            }
          });
        });
      }

      // Special detection methods for specific technologies
      confidence += this.specialDetection(techName, techData);

      // If we have matches, add to detected technologies
      if (confidence > 0) {
        this.detectedTechs.set(techName, {
          ...techData,
          confidence: Math.min(confidence, 100),
          matches: [...new Set(matches)]
        });
      }
    }

    return this.detectedTechs;
  }

  specialDetection(techName, techData) {
    let bonus = 0;

    switch (techName) {
      case 'YouTube':
        if (window.location.hostname.includes('youtube.com') || 
            document.querySelector('ytd-app, #player, .html5-video-player')) {
          bonus += 50;
        }
        break;

      case 'Google Analytics':
        if (this.pageData.html.includes('gtag(') || 
            this.pageData.html.includes('ga(') ||
            this.pageData.scripts.some(script => script.includes('google-analytics'))) {
          bonus += 30;
        }
        break;

      case 'Google Tag Manager':
        if (this.pageData.html.includes('googletagmanager.com') ||
            window.dataLayer) {
          bonus += 30;
        }
        break;

      case 'PWA':
        if (document.querySelector('link[rel="manifest"]') && 
            'serviceWorker' in navigator) {
          bonus += 40;
        }
        break;

      case 'HTTP/3':
        // This would typically be detected via headers, but we'll check for indicators
        if (this.pageData.html.includes('h3-') || 
            this.pageData.html.includes('http3')) {
          bonus += 20;
        }
        break;

      case 'HSTS':
        if (window.location.protocol === 'https:') {
          bonus += 15; // Likely to have HSTS
        }
        break;

      case 'Open Graph':
        if (document.querySelector('meta[property^="og:"]')) {
          bonus += 40;
        }
        break;

      case 'Polymer':
        if (this.pageData.html.includes('polymer') || 
            document.querySelector('polymer-element')) {
          bonus += 30;
        }
        break;
    }

    return bonus;
  }

  getResults() {
    this.detectTechnologies();
    const results = Array.from(this.detectedTechs.entries()).map(([name, data]) => ({
      name,
      category: data.category,
      confidence: data.confidence,
      icon: data.icon,
      matches: data.matches || []
    }));

    return results.sort((a, b) => b.confidence - a.confidence);
  }
}

// Initialize detector and store results
let detector;
let detectionResults = [];

function runDetection() {
  try {
    detector = new TechDetector();
    detectionResults = detector.getResults();
    
    // Store results for popup
    chrome.storage.local.set({
      [window.location.hostname]: {
        results: detectionResults,
        timestamp: Date.now(),
        url: window.location.href
      }
    });

    console.log('TechDetector found:', detectionResults.length, 'technologies');
  } catch (error) {
    console.error('TechDetector error:', error);
  }
}

// Run detection when page loads
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', runDetection);
} else {
  runDetection();
}

// Listen for messages from popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getDetectionResults') {
    sendResponse({
      results: detectionResults,
      url: window.location.href
    });
  }
});

// Re-run detection on dynamic content changes (throttled)
let lastDetection = Date.now();
const observer = new MutationObserver(() => {
  const now = Date.now();
  if (now - lastDetection > 3000) { // Throttle to every 3 seconds
    runDetection();
    lastDetection = now;
  }
});

if (document.body) {
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}