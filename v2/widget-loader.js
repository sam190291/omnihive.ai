(function() {
    // Configuration
    const MOBILE_BREAKPOINT = 768;
    
    // Extract agent ID from script tag
    function getAgentIdFromScript() {
        const scripts = document.getElementsByTagName('script');
        for (let script of scripts) {
            if (script.src && script.src.includes('widget-loader.js')) {
                const agentId = script.getAttribute('data-agent-id');
                if (agentId) return agentId;
            }
        }
        
        const currentScript = document.currentScript;
        if (currentScript) {
            const agentId = currentScript.getAttribute('data-agent-id');
            if (agentId) return agentId;
        }
        
        return null;
    }

    const agentId = getAgentIdFromScript();
    
    if (!agentId) {
        console.error('AI Widget: No agent ID provided.');
        return;
    }
    
    let elevenLabsWidget = null;
    let isMobile = false;
    
    // Check if device is mobile
    function checkMobile() {
        isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
        return isMobile;
    }
    
    // SUPER AGGRESSIVE branding removal
    function addBrandingHideStyles() {
        const style = document.createElement('style');
        style.id = 'ai-widget-branding-hide';
        style.textContent = `
            /* Hide ALL possible branding elements */
            [data-testid*="branding"],
            [data-testid*="powered"],
            [class*="branding"],
            [class*="powered"],
            [class*="elevenlabs"],
            [class*="attribution"],
            [aria-label*="ElevenLabs"],
            [aria-label*="Powered by"],
            [title*="ElevenLabs"],
            [title*="Powered by"],
            a[href*="elevenlabs"],
            a[href*="conversational-ai"],
            .elevenlabs-branding,
            .powered-by-elevenlabs,
            .branding-text,
            .footer-branding,
            .widget-branding,
            .convai-branding,
            [data-branding],
            [data-powered-by],
            [data-elevenlabs] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
                overflow: hidden !important;
                position: absolute !important;
                left: -9999px !important;
                font-size: 0 !important;
                line-height: 0 !important;
            }

            /* Hide small font elements commonly used for branding */
            elevenlabs-convai *[style*="font-size: 12px"],
            elevenlabs-convai *[style*="font-size: 10px"],
            elevenlabs-convai *[style*="font-size: 11px"],
            elevenlabs-convai *[style*="font-size: 13px"],
            elevenlabs-convai *[style*="font-size: 14px"],
            elevenlabs-convai div[style*="opacity: 0.6"],
            elevenlabs-convai span[style*="opacity: 0.6"],
            elevenlabs-convai div[style*="color: rgb(156, 163, 175)"],
            elevenlabs-convai span[style*="color: rgb(156, 163, 175)"],
            elevenlabs-convai div[style*="color: rgb(107, 114, 128)"],
            elevenlabs-convai span[style*="color: rgb(107, 114, 128)"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
                font-size: 0 !important;
            }

            /* Hide footer-like elements */
            elevenlabs-convai footer,
            elevenlabs-convai .footer,
            elevenlabs-convai [class*="footer"],
            elevenlabs-convai > div:last-child,
            elevenlabs-convai [class*="bottom"],
            elevenlabs-convai [class*="attribution"] {
                display: none !important;
                visibility: hidden !important;
                opacity: 0 !important;
                height: 0 !important;
                width: 0 !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Load ElevenLabs script
    function loadElevenLabsScript() {
        return new Promise((resolve) => {
            if (window.customElements && window.customElements.get('elevenlabs-convai')) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
            script.async = true;
            script.type = 'text/javascript';
            
            script.onload = () => {
                // Wait for custom element to be registered
                const checkRegistration = setInterval(() => {
                    if (window.customElements && window.customElements.get('elevenlabs-convai')) {
                        clearInterval(checkRegistration);
                        resolve();
                    }
                }, 100);
                
                // Timeout after 10 seconds
                setTimeout(() => {
                    clearInterval(checkRegistration);
                    resolve();
                }, 10000);
            };
            
            script.onerror = () => resolve();
            document.head.appendChild(script);
        });
    }
    
    // Create ElevenLabs widget
    function createElevenLabsWidget() {
        elevenLabsWidget = document.createElement('elevenlabs-convai');
        elevenLabsWidget.setAttribute('agent-id', agentId);
        
        // Use compact variant for mobile, no variant for desktop
        if (isMobile) {
            elevenLabsWidget.setAttribute('variant', 'compact');
        }
        
        return elevenLabsWidget;
    }
    
    // SUPER AGGRESSIVE branding removal function
    function hideBranding() {
        // Method 1: Remove by text content
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
            if (el.textContent && el.textContent.trim()) {
                const text = el.textContent.toLowerCase().trim();
                if (text.includes('powered by elevenlabs') || 
                    text.includes('elevenlabs') || 
                    text.includes('conversational ai') ||
                    text.includes('powered by') ||
                    text.match(/^[a-z]+labs$/i)) {
                    
                    // Only target small text elements (likely branding)
                    if (el.textContent.trim().length < 200 && !el.querySelector('elevenlabs-convai')) {
                        el.style.display = 'none';
                        el.style.visibility = 'hidden';
                        el.style.opacity = '0';
                        el.style.height = '0';
                        el.style.width = '0';
                        el.style.overflow = 'hidden';
                        el.style.position = 'absolute';
                        el.style.left = '-9999px';
                        el.style.fontSize = '0';
                        el.style.lineHeight = '0';
                        
                        // Try to remove the element completely
                        try {
                            el.remove();
                        } catch(e) {
                            // If removal fails, empty the content
                            el.textContent = '';
                            el.innerHTML = '';
                        }
                    }
                }
            }
        });
        
        // Method 2: Remove by common selectors
        const brandingSelectors = [
            '[class*="branding"]',
            '[class*="powered"]',
            '[class*="elevenlabs"]',
            '[class*="attribution"]',
            '[data-testid*="branding"]',
            '[data-testid*="powered"]',
            'a[href*="elevenlabs"]',
            'a[href*="conversational-ai"]',
            'div[style*="font-size: 12px"]',
            'span[style*="font-size: 12px"]',
            'div[style*="opacity: 0.6"]',
            'span[style*="opacity: 0.6"]',
            'div[style*="color: rgb(156, 163, 175)"]',
            'span[style*="color: rgb(156, 163, 175)"]'
        ];
        
        brandingSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.display = 'none';
                el.style.visibility = 'hidden';
                el.style.opacity = '0';
                el.style.height = '0';
                el.style.width = '0';
                el.style.position = 'absolute';
                el.style.left = '-9999px';
                try {
                    el.remove();
                } catch(e) {}
            });
        });

        // Method 3: Target shadow DOM if accessible
        if (elevenLabsWidget && elevenLabsWidget.shadowRoot) {
            try {
                const shadowElements = elevenLabsWidget.shadowRoot.querySelectorAll('*');
                shadowElements.forEach(el => {
                    if (el.textContent) {
                        const text = el.textContent.toLowerCase().trim();
                        if (text.includes('powered by') || 
                            text.includes('elevenlabs') || 
                            text.includes('conversational ai')) {
                            el.style.display = 'none';
                            el.style.visibility = 'hidden';
                            el.style.opacity = '0';
                            try {
                                el.remove();
                            } catch(e) {
                                el.textContent = '';
                                el.innerHTML = '';
                            }
                        }
                    }
                });
            } catch (e) {
                // Ignore shadow DOM access errors
            }
        }
    }
    
    // Set up SUPER AGGRESSIVE branding removal
    function setupBrandingRemoval() {
        // Start IMMEDIATELY when widget is created
        hideBranding();
        
        // Run at very fast intervals initially
        setTimeout(hideBranding, 50);
        setTimeout(hideBranding, 100);
        setTimeout(hideBranding, 200);
        setTimeout(hideBranding, 300);
        setTimeout(hideBranding, 500);
        setTimeout(hideBranding, 800);
        setTimeout(hideBranding, 1000);
        setTimeout(hideBranding, 1500);
        setTimeout(hideBranding, 2000);
        setTimeout(hideBranding, 3000);
        setTimeout(hideBranding, 5000);
        setTimeout(hideBranding, 8000);
        setTimeout(hideBranding, 10000);
        
        // Continuous monitoring every 500ms (more frequent)
        setInterval(hideBranding, 500);
        
        // Monitor for DOM changes and react instantly
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    // Run immediately when new elements are added
                    hideBranding();
                    // Run again after a small delay
                    setTimeout(hideBranding, 10);
                    setTimeout(hideBranding, 50);
                }
            });
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Also monitor the widget itself for changes
        if (elevenLabsWidget) {
            const widgetObserver = new MutationObserver(() => {
                hideBranding();
                setTimeout(hideBranding, 10);
            });
            
            widgetObserver.observe(elevenLabsWidget, {
                childList: true,
                subtree: true
            });
        }
    }
    
    // Handle window resize
    function handleResize() {
        const wasMobile = isMobile;
        checkMobile();
        
        if (wasMobile !== isMobile && elevenLabsWidget) {
            // Device type changed - update variant
            if (isMobile) {
                elevenLabsWidget.setAttribute('variant', 'compact');
            } else {
                elevenLabsWidget.removeAttribute('variant');
            }
        }
    }
    
    // Initialize widget
    async function init() {
        try {
            checkMobile();
            
            // Add branding hide styles FIRST
            addBrandingHideStyles();
            
            // Load ElevenLabs script
            await loadElevenLabsScript();
            
            // Create widget
            const widget = createElevenLabsWidget();
            
            // Setup branding removal BEFORE adding widget to DOM
            setupBrandingRemoval();
            
            // Add widget to page
            document.body.appendChild(widget);
            
            // Run branding removal immediately after adding to DOM
            hideBranding();
            setTimeout(hideBranding, 10);
            setTimeout(hideBranding, 50);
            setTimeout(hideBranding, 100);
            
            // Event listeners
            window.addEventListener('resize', handleResize);
            
            // Expose simple API
            window.aiWidget = {
                element: elevenLabsWidget,
                isMobile: () => isMobile,
                hideBranding: hideBranding
            };
            
            console.log(`ElevenLabs Widget loaded (${isMobile ? 'compact' : 'default'} variant)`);
            
        } catch (error) {
            console.error('Failed to load AI Widget:', error);
        }
    }
    
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
