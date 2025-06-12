// Enhanced Technology detection signatures
const TECH_SIGNATURES = {
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

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TECH_SIGNATURES;
}