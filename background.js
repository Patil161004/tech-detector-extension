// Enhanced Background service worker for TechDetector
chrome.runtime.onInstalled.addListener((details) => {
  console.log('TechDetector extension installed/updated', details.reason);
  
  // Initialize storage on install
  if (details.reason === 'install') {
    chrome.storage.local.clear();
    console.log('TechDetector: Storage cleared for fresh install');
  }
  
  // Set default badge properties
  chrome.action.setBadgeBackgroundColor({ color: '#4285f4' });
});

// Handle extension startup
chrome.runtime.onStartup.addListener(() => {
  console.log('TechDetector: Extension started');
  cleanupOldStorageData();
});

// Enhanced cleanup function
function cleanupOldStorageData() {
  chrome.storage.local.get(null, (items) => {
    const now = Date.now();
    const keysToRemove = [];
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours
    
    for (const [key, value] of Object.entries(items)) {
      // Remove old detection results
      if (value && value.timestamp && now - value.timestamp > maxAge) {
        keysToRemove.push(key);
      }
      // Remove invalid entries
      if (!value || typeof value !== 'object') {
        keysToRemove.push(key);
      }
    }
    
    if (keysToRemove.length > 0) {
      chrome.storage.local.remove(keysToRemove, () => {
        console.log(`TechDetector: Cleaned up ${keysToRemove.length} old storage entries`);
      });
    }
  });
}

// Update badge when tab changes or updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !isRestrictedPage(tab.url)) {
    // Get detection results and update badge
    updateBadgeForTab(tabId, tab.url);
  }
});

chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    if (tab && tab.url && !isRestrictedPage(tab.url)) {
      updateBadgeForTab(activeInfo.tabId, tab.url);
    } else {
      // Clear badge for restricted pages
      chrome.action.setBadgeText({ tabId: activeInfo.tabId, text: '' });
    }
  });
});

function updateBadgeForTab(tabId, url) {
  try {
    const hostname = new URL(url).hostname;
    
    chrome.storage.local.get([hostname], (result) => {
      if (result[hostname] && result[hostname].results) {
        const techCount = result[hostname].results.length;
        const badgeText = techCount > 99 ? '99+' : techCount.toString();
        
        chrome.action.setBadgeText({
          tabId: tabId,
          text: techCount > 0 ? badgeText : ''
        });
        
        // Set badge color based on number of technologies
        let color = '#4285f4'; // Default blue
        if (techCount > 10) {
          color = '#ea4335'; // Red for many technologies
        } else if (techCount > 5) {
          color = '#fbbc04'; // Yellow for moderate technologies
        } else if (techCount > 0) {
          color = '#34a853'; // Green for few technologies
        }
        
        chrome.action.setBadgeBackgroundColor({
          tabId: tabId,
          color: color
        });
      } else {
        // No results yet, clear badge
        chrome.action.setBadgeText({ tabId: tabId, text: '' });
      }
    });
  } catch (error) {
    console.error('TechDetector: Error updating badge:', error);
  }
}

function isRestrictedPage(url) {
  const restrictedPrefixes = [
    'chrome://', 
    'chrome-extension://', 
    'edge://', 
    'about:', 
    'moz-extension://',
    'chrome-search://',
    'chrome-untrusted://',
    'devtools://'
  ];
  
  return restrictedPrefixes.some(prefix => url.startsWith(prefix));
}

// Handle messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'updateDetectionResults':
      handleDetectionResults(request.data, sender.tab);
      sendResponse({ success: true });
      break;
      
    case 'getStoredResults':
      getStoredResults(request.hostname)
        .then(results => sendResponse({ success: true, results }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true; // Keep message channel open for async response
      
    case 'clearStorageForDomain':
      clearStorageForDomain(request.hostname)
        .then(() => sendResponse({ success: true }))
        .catch(error => sendResponse({ success: false, error: error.message }));
      return true;
      
    default:
      sendResponse({ success: false, error: 'Unknown action' });
  }
});

function handleDetectionResults(data, tab) {
  if (!tab || !tab.url) return;
  
  try {
    const hostname = new URL(tab.url).hostname;
    
    // Store results with enhanced metadata
    chrome.storage.local.set({
      [hostname]: {
        results: data.results || [],
        timestamp: Date.now(),
        url: tab.url,
        title: tab.title,
        detectionVersion: '2.0',
        userAgent: navigator.userAgent
      }
    });
    
    // Update badge immediately
    updateBadgeForTab(tab.id, tab.url);
    
  } catch (error) {
    console.error('TechDetector: Error handling detection results:', error);
  }
}

async function getStoredResults(hostname) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get([hostname], (result) => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve(result[hostname] || null);
      }
    });
  });
}

async function clearStorageForDomain(hostname) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove([hostname], () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

// Periodic cleanup - run every hour
setInterval(cleanupOldStorageData, 60 * 60 * 1000);

// Context menu for debugging (optional)
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'techdetector-debug',
    title: 'Debug TechDetector',
    contexts: ['page'],
    documentUrlPatterns: ['http://*/*', 'https://*/*']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'techdetector-debug' && tab) {
    // Send debug info to console
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      func: () => {
        console.log('TechDetector Debug Info:', {
          url: window.location.href,
          detectionResults: window.detectionResults || 'Not available',
          techSignatures: Object.keys(window.TECH_SIGNATURES || {}),
          globals: Object.keys(window).filter(key => 
            ['React', 'Vue', 'angular', 'jQuery', '$', 'ga', 'gtag'].includes(key)
          )
        });
      }
    });
  }
});