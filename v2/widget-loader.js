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
    
    // Hide branding styles
    function addBrandingHideStyles() {
        const style = document.createElement('style');
        style.id = 'ai-widget-branding-hide';
        style.textContent = `
            /* Hide ALL Branding */
            [data-testid*="branding"],
            [data-testid*="powered"],
            [class*="branding"],
            [class*="powered"],
            [class*="elevenlabs"],
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
            }

            elevenlabs-convai *[style*="font-size: 12px"],
            elevenlabs-convai *[style*="font-size: 10px"],
            elevenlabs-convai *[style*="font-size: 11px"] {
                display: none !important;
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
        
        // Use compact variant for mobile, expanded for desktop
        if (isMobile) {
            elevenLabsWidget.setAttribute('variant', 'compact');
        } else {
            elevenLabsWidget.setAttribute('variant', 'expanded');
        }
        
        // Let the widget use its default positioning and behavior
        // No forced styling - it will behave exactly like normal
        
        return elevenLabsWidget;
    }
    
    // Hide branding continuously
    function hideBranding() {
        // Hide text-based branding in main document
        const allElements = document.querySelectorAll('*');
        allElements.forEach(el => {
            if (el.textContent && (
                el.textContent.toLowerCase().includes('powered by elevenlabs') ||
                el.textContent.toLowerCase().includes('elevenlabs') ||
                el.textContent.toLowerCase().includes('conversational ai') ||
                el.textContent.toLowerCase().includes('powered by')
            )) {
                if (el.textContent.trim().length < 100 && !el.querySelector('elevenlabs-convai')) {
                    el.style.display = 'none';
                    el.style.visibility = 'hidden';
                    el.style.opacity = '0';
                    el.style.height = '0';
                    el.style.width = '0';
                    el.style.overflow = 'hidden';
                }
            }
        });

        // Hide branding in shadow DOM
        if (elevenLabsWidget && elevenLabsWidget.shadowRoot) {
            try {
                const shadowElements = elevenLabsWidget.shadowRoot.querySelectorAll('*');
                shadowElements.forEach(el => {
                    if (el.textContent && (
                        el.textContent.toLowerCase().includes('powered by') ||
                        el.textContent.toLowerCase().includes('elevenlabs')
                    )) {
                        el.style.display = 'none';
                    }
                });
            } catch (e) {
                // Ignore shadow DOM access errors
            }
        }
    }
    
    // Set up continuous branding removal
    function setupBrandingRemoval() {
        // Initial branding removal
        setTimeout(hideBranding, 500);
        setTimeout(hideBranding, 1000);
        setTimeout(hideBranding, 2000);
        setTimeout(hideBranding, 3000);
        setTimeout(hideBranding, 5000);
        
        // Continuous monitoring
        setInterval(hideBranding, 3000);
        
        // Monitor for DOM changes
        const observer = new MutationObserver(() => {
            setTimeout(hideBranding, 100);
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
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
                elevenLabsWidget.setAttribute('variant', 'expanded');
            }
        }
    }
    
    // Initialize widget
    async function init() {
        try {
            checkMobile();
            
            // Add branding hide styles
            addBrandingHideStyles();
            
            // Load ElevenLabs script
            await loadElevenLabsScript();
            
            // Create and add widget to page
            const widget = createElevenLabsWidget();
            document.body.appendChild(widget);
            
            // Setup branding removal
            setupBrandingRemoval();
            
            // Event listeners
            window.addEventListener('resize', handleResize);
            
            // Expose simple API
            window.aiWidget = {
                element: elevenLabsWidget,
                isMobile: () => isMobile,
                hideBranding: hideBranding
            };
            
            console.log(`ElevenLabs Widget loaded (${isMobile ? 'compact' : 'expanded'} variant)`);
            
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
