(function() {
    // Configuration
    const MOBILE_BREAKPOINT = 768;
    const AUTO_HIDE_DELAY = 5000; // 5 seconds
    
    // Extract agent ID from script tag
    function getAgentId() {
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

    const agentId = getAgentId();
    
    if (!agentId) {
        console.error('AI Widget: No agent ID provided.');
        return;
    }
    
    // State management
    let widgetContainer = null;
    let chatButton = null;
    let elevenLabsWidget = null;
    let isWidgetVisible = false;
    let isMobile = false;
    let autoHideTimer = null;
    let isLoading = true;
    
    // Check if device is mobile
    function checkMobile() {
        isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
        return isMobile;
    }
    
    // Create chat button
    function createChatButton() {
        chatButton = document.createElement('button');
        chatButton.innerHTML = '💬';
        chatButton.setAttribute('aria-label', 'Open AI Chat');
        chatButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            border: none;
            border-radius: 50%;
            color: white;
            font-size: 24px;
            cursor: pointer;
            z-index: 9999;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            transition: all 0.3s ease;
            display: none;
            align-items: center;
            justify-content: center;
            outline: none;
            user-select: none;
        `;
        
        // Mobile specific styles
        if (isMobile) {
            chatButton.style.width = '50px';
            chatButton.style.height = '50px';
            chatButton.style.fontSize = '20px';
            chatButton.style.bottom = '15px';
            chatButton.style.right = '15px';
        }
        
        // Hover effects
        chatButton.addEventListener('mouseenter', () => {
            chatButton.style.transform = 'scale(1.1)';
            chatButton.style.boxShadow = '0 6px 25px rgba(0,0,0,0.4)';
        });
        
        chatButton.addEventListener('mouseleave', () => {
            chatButton.style.transform = 'scale(1)';
            chatButton.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        });
        
        // Click handler
        chatButton.addEventListener('click', showWidget);
        
        return chatButton;
    }
    
    // Create widget container
    function createWidgetContainer() {
        widgetContainer = document.createElement('div');
        widgetContainer.id = 'ai-widget-container';
        widgetContainer.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9998;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            overflow: hidden;
            background: white;
        `;
        
        // Set dimensions based on device
        updateWidgetSize();
        
        return widgetContainer;
    }
    
    // Create ElevenLabs widget
    function createElevenLabsWidget() {
        elevenLabsWidget = document.createElement('elevenlabs-convai');
        elevenLabsWidget.setAttribute('agent-id', agentId);
        
        // Hide branding styles
        elevenLabsWidget.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            background: transparent;
        `;
        
        // Remove branding when widget loads
        elevenLabsWidget.addEventListener('load', hideBranding);
        
        return elevenLabsWidget;
    }
    
    // Update widget size based on device
    function updateWidgetSize() {
        if (!widgetContainer) return;
        
        if (isMobile) {
            widgetContainer.style.width = 'calc(100vw - 30px)';
            widgetContainer.style.height = '70vh';
            widgetContainer.style.maxWidth = '380px';
            widgetContainer.style.bottom = '15px';
            widgetContainer.style.right = '15px';
        } else {
            widgetContainer.style.width = '380px';
            widgetContainer.style.height = '520px';
            widgetContainer.style.bottom = '20px';
            widgetContainer.style.right = '20px';
        }
    }
    
    // Show widget
    function showWidget() {
        if (!widgetContainer) return;
        
        widgetContainer.style.display = 'block';
        chatButton.style.display = 'none';
        isWidgetVisible = true;
        
        // Clear any existing timer
        clearTimeout(autoHideTimer);
        
        // Auto-hide on mobile
        if (isMobile) {
            autoHideTimer = setTimeout(() => {
                hideWidget();
            }, AUTO_HIDE_DELAY);
        }
        
        // Remove branding after showing
        setTimeout(hideBranding, 500);
        
        console.log('AI Widget: Widget shown');
    }
    
    // Hide widget
    function hideWidget() {
        if (!widgetContainer) return;
        
        widgetContainer.style.display = 'none';
        chatButton.style.display = 'flex';
        isWidgetVisible = false;
        
        // Add pulse animation to button
        chatButton.style.animation = 'pulse 2s infinite';
        
        // Clear timer
        clearTimeout(autoHideTimer);
        
        console.log('AI Widget: Widget hidden');
    }
    
    // Hide branding elements
    function hideBranding() {
        // Hide branding in main document
        const brandingSelectors = [
            '[data-testid*="branding"]',
            '[data-testid*="powered"]',
            '[class*="branding"]',
            '[class*="powered"]',
            '[class*="elevenlabs"]',
            '[aria-label*="ElevenLabs"]',
            '[aria-label*="Powered by"]',
            '[title*="ElevenLabs"]',
            '[title*="Powered by"]',
            'a[href*="elevenlabs"]',
            'a[href*="conversational-ai"]',
            '.elevenlabs-branding',
            '.powered-by-elevenlabs',
            '.branding-text',
            '.footer-branding',
            '.widget-branding',
            '.convai-branding'
        ];
        
        brandingSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.display = 'none';
                el.style.visibility = 'hidden';
                el.style.opacity = '0';
                el.style.height = '0';
                el.style.width = '0';
                el.style.overflow = 'hidden';
            });
        });
        
        // Hide text-based branding
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
    
    // Add pulse animation CSS
    function addPulseAnimation() {
        const style = document.createElement('style');
        style.textContent = `
            @keyframes pulse {
                0% {
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                }
                50% {
                    box-shadow: 0 4px 20px rgba(102, 126, 234, 0.6), 0 0 0 10px rgba(102, 126, 234, 0.1);
                }
                100% {
                    box-shadow: 0 4px 20px rgba(0,0,0,0.3);
                }
            }
            
            /* Additional branding hiding styles */
            elevenlabs-convai *[style*="font-size: 12px"],
            elevenlabs-convai *[style*="font-size: 10px"],
            elevenlabs-convai *[style*="font-size: 11px"] {
                display: none !important;
            }
            
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
                overflow: hidden !important;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Handle window resize
    function handleResize() {
        const wasMobile = isMobile;
        checkMobile();
        
        if (wasMobile !== isMobile) {
            updateWidgetSize();
            
            // Update button size
            if (isMobile) {
                chatButton.style.width = '50px';
                chatButton.style.height = '50px';
                chatButton.style.fontSize = '20px';
                chatButton.style.bottom = '15px';
                chatButton.style.right = '15px';
            } else {
                chatButton.style.width = '60px';
                chatButton.style.height = '60px';
                chatButton.style.fontSize = '24px';
                chatButton.style.bottom = '20px';
                chatButton.style.right = '20px';
            }
            
            // Restart auto-hide timer if widget is visible on mobile
            if (isWidgetVisible && isMobile) {
                clearTimeout(autoHideTimer);
                autoHideTimer = setTimeout(hideWidget, AUTO_HIDE_DELAY);
            }
        }
    }
    
    // Handle clicks outside widget (mobile only)
    function handleOutsideClick(event) {
        if (!isMobile || !isWidgetVisible) return;
        
        if (!widgetContainer.contains(event.target) && !chatButton.contains(event.target)) {
            hideWidget();
        }
    }
    
    // Handle escape key
    function handleEscapeKey(event) {
        if (event.key === 'Escape' && isWidgetVisible) {
            hideWidget();
        }
    }
    
    // Reset auto-hide timer (for user interaction)
    function resetAutoHideTimer() {
        if (!isMobile || !isWidgetVisible) return;
        
        clearTimeout(autoHideTimer);
        autoHideTimer = setTimeout(hideWidget, AUTO_HIDE_DELAY);
    }
    
    // Wait for ElevenLabs script to load
    function waitForElevenLabs() {
        return new Promise((resolve) => {
            let checkCount = 0;
            const checkInterval = setInterval(() => {
                if (window.customElements && window.customElements.get('elevenlabs-convai')) {
                    clearInterval(checkInterval);
                    resolve();
                } else if (checkCount++ > 50) { // 5 second timeout
                    clearInterval(checkInterval);
                    console.error('Failed to load ElevenLabs widget');
                    resolve();
                }
            }, 100);
        });
    }
    
    // Initialize widget
    async function init() {
        checkMobile();
        
        // Load ElevenLabs script if not already loaded
        if (!document.querySelector('script[src*="elevenlabs"]')) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
            script.type = 'text/javascript';
            script.async = true;
            document.head.appendChild(script);
        }
        
        // Wait for ElevenLabs to load
        await waitForElevenLabs();
        
        // Add pulse animation CSS
        addPulseAnimation();
        
        // Create elements
        const container = createWidgetContainer();
        const widget = createElevenLabsWidget();
        const button = createChatButton();
        
        // Assemble widget
        container.appendChild(widget);
        
        // Add to DOM
        document.body.appendChild(container);
        document.body.appendChild(button);
        
        // Event listeners
        window.addEventListener('resize', handleResize);
        document.addEventListener('click', handleOutsideClick);
        document.addEventListener('keydown', handleEscapeKey);
        
        // Add interaction listeners to reset timer
        container.addEventListener('click', resetAutoHideTimer);
        container.addEventListener('touchstart', resetAutoHideTimer);
        
        // Initial state
        isLoading = false;
        
        if (isMobile) {
            // Show widget initially for 5 seconds, then auto-hide
            showWidget();
        } else {
            // Show widget immediately on desktop
            showWidget();
        }
        
        // Start continuous branding cleanup
        setInterval(hideBranding, 2000);
        
        // Monitor for dynamic content changes
        const observer = new MutationObserver(() => {
            setTimeout(hideBranding, 100);
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Expose API
        window.aiWidget = {
            show: showWidget,
            hide: hideWidget,
            toggle: () => isWidgetVisible ? hideWidget() : showWidget(),
            isVisible: () => isWidgetVisible,
            isMobile: () => isMobile,
            isLoading: () => isLoading
        };
        
        console.log('AI Widget: Direct mobile loader initialized successfully!');
    }
    
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
