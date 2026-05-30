/**
 * Kelane Recipe Importer — background service worker (MV3)
 *
 * Minimal: just handles the OPEN_TAB message so the popup can open
 * the Kelane import page in a new tab (popups can't call chrome.tabs.create
 * directly in all MV3 scenarios; routing through the service worker is reliable).
 */

"use strict";

chrome.runtime.onMessage.addListener((message) => {
  if (message?.type === "OPEN_TAB" && message.url) {
    chrome.tabs.create({ url: message.url, active: true });
  }
});
