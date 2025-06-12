// Enhanced Popup script for displaying detection results
document.addEventListener('DOMContentLoaded', async () => {
  const loadingEl = document.getElementById('loading');
  const resultsEl = document.getElementById('results');
  const noResultsEl = document.getElementById('no-results');

  try {
    // Get current tab
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    
    if (!tab) {
      showError('Unable to access current tab');
      return;
    }

    // Check if it's a restricted page
    if (isRestrictedPage(tab.url)) {
      showError('Cannot analyze browser internal pages');
      return;
    }

    // Try to get cached results first
    const hostname = new URL(tab.url).hostname;
    const storage = await chrome.storage.local.get([hostname]);
    
    if (storage[hostname] && Date.now() - storage[hostname].timestamp < 30000) {
      // Use cached results if less than 30 seconds old
      displayResults(storage[hostname].results);
    } else {
      // Get fresh results from content script
      try {
        const response = await chrome.tabs.sendMessage(tab.id, { action: 'getDetectionResults' });
        if (response && response.results) {
          displayResults(response.results);
        } else {
          // Inject content script if not present
          await injectAndDetect(tab.id);
        }
      } catch (error) {
        // Content script not ready, inject it
        await injectAndDetect(tab.id);
      }
    }
  } catch (error) {
    console.error('Popup error:', error);
    showError('Failed to analyze page');
  }
});

function isRestrictedPage(url) {
  const restrictedPrefixes = [
    'chrome://', 
    'chrome-extension://', 
    'edge://', 
    'about:', 
    'moz-extension://',
    'chrome-search://',
    'chrome-untrusted://'
  ];
  
  return restrictedPrefixes.some(prefix => url.startsWith(prefix));
}

async function injectAndDetect(tabId) {
  try {
    // First inject the enhanced technology signatures
    await chrome.scripting.executeScript({
      target: { tabId },
      func: injectEnhancedTechSignatures
    });

    // Then inject the enhanced detection logic
    await chrome.scripting.executeScript({
      target: { tabId },
      func: injectEnhancedDetectionLogic
    });
    
    // Wait for detection to complete
    setTimeout(async () => {
      try {
        const results = await chrome.scripting.executeScript({
          target: { tabId },
          func: getDetectionResults
        });
        
        if (results && results[0] && results[0].result) {
          displayResults(results[0].result);
        } else {
          showNoResults();
        }
      } catch (error) {
        console.error('Failed to get results:', error);
        showError('Detection completed but failed to retrieve results');
      }
    }, 1500);
    
  } catch (error) {
    console.error('Script injection failed:', error);
    if (error.message.includes('Cannot access')) {
      showError('Cannot analyze this page type');
    } else {
      showError('Script injection failed - try refreshing the page');
    }
  }
}

function injectEnhancedTechSignatures() {
  window.TECH_SIGNATURES = {
    // JavaScript Frameworks
    'React': {
      category: 'JavaScript Framework',
      patterns: {
        html: [/_react/i, /react-/i, /__REACT_DEVTOOLS_GLOBAL_HOOK__/i],
        scripts: [/react/i],
        globals: ['React', '__REACT_DEVTOOLS_GLOBAL_HOOK__'],
        dom: ['[data-reactroot]', '[data-react-helmet]']
      },
      icon: 'R'
    },
    
    'Vue.js': {
      category: 'JavaScript Framework',
      patterns: {
        html: [/vue\.js/i, /__vue__/i],
        scripts: [/vue/i],
        globals: ['Vue', '__VUE__'],
        dom: ['[data-v-]', '[v-cloak]']
      },
      icon: 'V'
    },
    
    'Angular': {
      category: 'JavaScript Framework',
      patterns: {
        html: [/ng-/i, /angular/i],
        scripts: [/angular/i],
        globals: ['angular', 'ng'],
        dom: ['[ng-app]', '[ng-controller]', 'ng-container']
      },
      icon: 'A'
    },

    'Polymer': {
      category: 'JavaScript Framework',
      patterns: {
        html: [/polymer/i],
        scripts: [/polymer/i],
        globals: ['Polymer'],
        dom: ['polymer-element', '[is="polymer-element"]']
      },
      icon: 'P'
    },
    
    // JavaScript Libraries
    'jQuery': {
      category: 'JavaScript Library',
      patterns: {
        html: [/jquery/i],
        scripts: [/jquery/i],
        globals: ['jQuery', '$']
      },
      icon: 'jQ'
    },

    'Closure Library': {
      category: 'JavaScript Library',
      patterns: {
        html: [/closure/i, /goog\./],
        scripts: [/closure/i],
        globals: ['goog']
      },
      icon: 'CL'
    },

    'XRegExp': {
      category: 'JavaScript Library',
      patterns: {
        html: [/xregexp/i],
        scripts: [/xregexp/i],
        globals: ['XRegExp']
      },
      icon: 'XR'
    },

    'Hammer.js': {
      category: 'JavaScript Library',
      patterns: {
        html: [/hammer\.js/i, /hammerjs/i],
        scripts: [/hammer/i],
        globals: ['Hammer']
      },
      icon: 'HJ'
    },

    'LottieFiles': {
      category: 'Miscellaneous',
      patterns: {
        html: [/lottie/i, /bodymovin/i],
        scripts: [/lottie/i, /bodymovin/i],
        globals: ['lottie', 'bodymovin']
      },
      icon: 'LF'
    },
    
    // CSS Frameworks
    'Bootstrap': {
      category: 'CSS Framework',
      patterns: {
        html: [/bootstrap/i],
        css: [/bootstrap/i],
        dom: ['.container', '.row', '.col-', '.btn-']
      },
      icon: 'B'
    },
    
    'Tailwind CSS': {
      category: 'CSS Framework',
      patterns: {
        html: [/tailwind/i],
        css: [/tailwind/i],
        dom: ['.flex', '.grid', '.text-', '.bg-', '.p-', '.m-']
      },
      icon: 'TW'
    },
    
    // Content Management Systems
    'WordPress': {
      category: 'CMS',
      patterns: {
        html: [/wp-content/i, /wp-includes/i, /wordpress/i],
        meta: [/generator.*wordpress/i],
        globals: ['wp', 'wpdb']
      },
      icon: 'WP'
    },
    
    'Drupal': {
      category: 'CMS',
      patterns: {
        html: [/drupal/i, /sites\/default\/files/i],
        meta: [/generator.*drupal/i],
        dom: ['.drupal-', '#drupal-']
      },
      icon: 'D'
    },
    
    // Analytics & Tag Managers
    'Google Analytics': {
      category: 'Analytics',
      patterns: {
        html: [/google-analytics/i, /gtag/i, /ga\(/],
        scripts: [/googletagmanager/i, /google-analytics/i],
        globals: ['ga', 'gtag', '__gaTracker']
      },
      icon: 'GA'
    },

    'Google Tag Manager': {
      category: 'Tag Manager',
      patterns: {
        html: [/googletagmanager/i, /gtm\.js/i],
        scripts: [/googletagmanager/i],
        globals: ['google_tag_manager', 'dataLayer']
      },
      icon: 'GTM'
    },
    
    // Advertising
    'Google AdSense': {
      category: 'Advertising',
      patterns: {
        html: [/googlesyndication/i, /adsbygoogle/i],
        scripts: [/googlesyndication/i, /pagead/i],
        dom: ['.adsbygoogle', 'ins.adsbygoogle']
      },
      icon: 'AS'
    },

    // Video Players
    'YouTube': {
      category: 'Video Player',
      patterns: {
        html: [/youtube/i, /ytimg/i, /googlevideo/i],
        scripts: [/youtube/i, /ytimg/i],
        dom: ['#player', '.html5-video-player', 'ytd-app']
      },
      icon: 'YT'
    },

    'Vimeo': {
      category: 'Video Player',
      patterns: {
        html: [/vimeo/i, /vimeocdn/i],
        scripts: [/vimeo/i],
        dom: ['.vp-player', '[data-vimeo-id]']
      },
      icon: 'VM'
    },
    
    // Font Scripts
    'Google Font API': {
      category: 'Font Script',
      patterns: {
        html: [/fonts\.googleapis/i, /fonts\.gstatic/i],
        css: [/fonts\.googleapis/i, /fonts\.gstatic/i]
      },
      icon: 'GF'
    },

    'Font Awesome': {
      category: 'Font Script',
      patterns: {
        html: [/font-awesome/i, /fontawesome/i],
        css: [/font-awesome/i],
        dom: ['.fa-', '.fas', '.far', '.fab']
      },
      icon: 'FA'
    },

    'Typekit': {
      category: 'Font Script',
      patterns: {
        html: [/typekit/i, /use\.typekit/i],
        scripts: [/typekit/i]
      },
      icon: 'TK'
    },
    
    // Security
    'HSTS': {
      category: 'Security',
      patterns: {
        headers: [/strict-transport-security/i]
      },
      icon: 'HS'
    },

    'Content Security Policy': {
      category: 'Security',
      patterns: {
        headers: [/content-security-policy/i],
        meta: [/content-security-policy/i]
      },
      icon: 'CSP'
    },
    
    // Performance & Miscellaneous
    'HTTP/3': {
      category: 'Performance',
      patterns: {
        headers: [/alt-svc.*h3/i]
      },
      icon: 'H3'
    },

    'Priority Hints': {
      category: 'Performance',
      patterns: {
        html: [/fetchpriority/i],
        dom: ['[fetchpriority]']
      },
      icon: 'PH'
    },

    'PWA': {
      category: 'Miscellaneous',
      patterns: {
        html: [/manifest\.json/i, /service.*worker/i],
        dom: ['link[rel="manifest"]'],
        globals: ['serviceWorker']
      },
      icon: 'PWA'
    },

    'Open Graph': {
      category: 'Miscellaneous',
      patterns: {
        meta: [/og:/i],
        dom: ['meta[property^="og:"]']
      },
      icon: 'OG'
    },

    'Schema.org': {
      category: 'Miscellaneous',
      patterns: {
        html: [/schema\.org/i, /application\/ld\+json/i],
        dom: ['script[type="application/ld+json"]', '[itemscope]']
      },
      icon: 'SO'
    },
    
    // Web Servers
    'Apache': {
      category: 'Web Server',
      patterns: {
        headers: [/server.*apache/i]
      },
      icon: 'AP'
    },
    
    'Nginx': {
      category: 'Web Server',
      patterns: {
        headers: [/server.*nginx/i]
      },
      icon: 'NX'
    },
    
    // E-commerce
    'Shopify': {
      category: 'E-commerce',
      patterns: {
        html: [/shopify/i, /cdn\.shopify/i],
        globals: ['Shopify'],
        dom: ['[data-shopify-']
      },
      icon: 'S'
    },
    
    'WooCommerce': {
      category: 'E-commerce',
      patterns: {
        html: [/woocommerce/i, /wc-/i],
        dom: ['.woocommerce', '.wc-']
      },
      icon: 'WC'
    },

    'Magento': {
      category: 'E-commerce',
      patterns: {
        html: [/magento/i, /mage/i],
        dom: ['.magento', '#magento-']
      },
      icon: 'MG'
    },
    
    // CDNs
    'Cloudflare': {
      category: 'CDN',
      patterns: {
        headers: [/cf-ray/i, /server.*cloudflare/i]
      },
      icon: 'CF'
    },

    'Amazon CloudFront': {
      category: 'CDN',
      patterns: {
        headers: [/x-amz-cf-id/i, /cloudfront/i]
      },
      icon: 'ACF'
    },

    'jsDelivr': {
      category: 'CDN',
      patterns: {
        scripts: [/jsdelivr/i]
      },
      icon: 'JSD'
    },

    'cdnjs': {
      category: 'CDN',
      patterns: {
        scripts: [/cdnjs\.cloudflare/i]
      },
      icon: 'CDN'
    },

    // Additional Popular Libraries
    'Lodash': {
      category: 'JavaScript Library',
      patterns: {
        html: [/lodash/i],
        scripts: [/lodash/i],
        globals: ['_']
      },
      icon: 'LD'
    },

    'Moment.js': {
      category: 'JavaScript Library',
      patterns: {
        html: [/moment\.js/i],
        scripts: [/moment/i],
        globals: ['moment']
      },
      icon: 'MJ'
    },

    'D3.js': {
      category: 'JavaScript Library',
      patterns: {
        html: [/d3\.js/i, /d3\.min\.js/i],
        scripts: [/d3/i],
        globals: ['d3']
      },
      icon: 'D3'
    },

    'Chart.js': {
      category: 'JavaScript Library',
      patterns: {
        html: [/chart\.js/i],
        scripts: [/chart/i],
        globals: ['Chart']
      },
      icon: 'CJ'
    },

    // Social Media
    'Facebook Pixel': {
      category: 'Analytics',
      patterns: {
        html: [/facebook\.com\/tr/i, /fbq\(/],
        scripts: [/connect\.facebook/i],
        globals: ['fbq']
      },
      icon: 'FB'
    },

    'Twitter for Websites': {
      category: 'Social',
      patterns: {
        html: [/platform\.twitter/i],
        scripts: [/platform\.twitter/i],
        globals: ['twttr']
      },
      icon: 'TW'
    },

    // Payment Processing
    'Stripe': {
      category: 'Payment',
      patterns: {
        html: [/stripe/i],
        scripts: [/stripe/i],
        globals: ['Stripe']
      },
      icon: 'ST'
    },

    'PayPal': {
      category: 'Payment',
      patterns: {
        html: [/paypal/i],
        scripts: [/paypal/i],
        globals: ['paypal', 'PAYPAL']
      },
      icon: 'PP'
    },

    // Development Tools
    'Webpack': {
      category: 'Build Tool',
      patterns: {
        html: [/webpack/i, /__webpack/i],
        globals: ['__webpack_require__']
      },
      icon: 'WP'
    },

    'Babel': {
      category: 'Build Tool',
      patterns: {
        html: [/babel/i, /_babel/i]
      },
      icon: 'BB'
    }
  };
}

function injectEnhancedDetectionLogic() {
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
      for (const [techName, techData] of Object.entries(window.TECH_SIGNATURES)) {
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
          if (this.pageData.html.includes('h3-') || 
              this.pageData.html.includes('http3')) {
            bonus += 20;
          }
          break;

        case 'HSTS':
          if (window.location.protocol === 'https:') {
            bonus += 15;
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

  // Initialize detector and run detection
  window.techDetector = new TechDetector();
  window.detectionResults = window.techDetector.getResults();
}

function getDetectionResults() {
  return window.detectionResults || [];
}

function displayResults(results) {
  const loadingEl = document.getElementById('loading');
  const resultsEl = document.getElementById('results');
  const noResultsEl = document.getElementById('no-results');

  loadingEl.style.display = 'none';

  if (!results || results.length === 0) {
    noResultsEl.style.display = 'block';
    return;
  }

  resultsEl.style.display = 'block';
  
  // Group results by category
  const categories = {};
  results.forEach(tech => {
    if (!categories[tech.category]) {
      categories[tech.category] = [];
    }
    categories[tech.category].push(tech);
  });

  // Display results grouped by category
  Object.entries(categories).forEach(([category, techs]) => {
    const categoryEl = document.createElement('div');
    categoryEl.className = 'category';
    
    const categoryTitle = document.createElement('h3');
    categoryTitle.textContent = category;
    categoryTitle.className = 'category-title';
    categoryEl.appendChild(categoryTitle);

    techs.forEach(tech => {
      const techEl = document.createElement('div');
      techEl.className = 'tech-item';
      techEl.innerHTML = `
        <div class="tech-icon">${tech.icon}</div>
        <div class="tech-info">
          <div class="tech-name">${tech.name}</div>
          <div class="confidence">Confidence: ${tech.confidence}%</div>
          <div class="matches">Detected via: ${tech.matches.join(', ')}</div>
        </div>
      `;
      categoryEl.appendChild(techEl);
    });

    resultsEl.appendChild(categoryEl);
  });
}

function showNoResults() {
  const loadingEl = document.getElementById('loading');
  const noResultsEl = document.getElementById('no-results');
  
  loadingEl.style.display = 'none';
  noResultsEl.style.display = 'block';
}

function showError(message) {
  const loadingEl = document.getElementById('loading');
  const resultsEl = document.getElementById('results');
  
  loadingEl.style.display = 'none';
  resultsEl.style.display = 'block';
  resultsEl.innerHTML = `<div class="error">Error: ${message}</div>`;
}