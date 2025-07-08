(function() {
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
    let isExpanded = false;
    let observer = null;
    
    // Create widget container
    function createWidgetContainer() {
        const container = document.createElement('div');
        container.id = 'ai-widget-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            transition: all 0.3s ease;
            border-radius: 50%;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        `;
        
        return container;
    }
    
    // Load ElevenLabs script
    function loadElevenLabsScript() {
        return new Promise((resolve, reject) => {
            if (window.customElements && window.customElements.get('elevenlabs-convai')) {
                resolve();
                return;
            }
            
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
            script.async = true;
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
                    resolve(); // Resolve anyway
                }, 10000);
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }
    
    // Create ElevenLabs widget
    function createElevenLabsWidget() {
        elevenLabsWidget = document.createElement('elevenlabs-convai');
        elevenLabsWidget.setAttribute('agent-id', agentId);
        
        // Initial small size styling
        elevenLabsWidget.style.cssText = `
            width: 80px;
            height: 80px;
            border-radius: 50%;
            transition: all 0.3s ease;
            transform-origin: bottom right;
        `;
        
        return elevenLabsWidget;
    }
    
    // Monitor widget state changes
    function monitorWidgetState() {
        if (!elevenLabsWidget) return;
        
        const container = document.getElementById('ai-widget-container');
        
        // Check widget dimensions and content
        function checkWidgetExpansion() {
            try {
                const rect = elevenLabsWidget.getBoundingClientRect();
                const shouldBeExpanded = rect.width > 100 || rect.height > 100;
                
                // Check for conversation elements in shadow DOM
                let hasConversationElements = false;
                if (elevenLabsWidget.shadowRoot) {
                    try {
                        const conversationElements = elevenLabsWidget.shadowRoot.querySelectorAll(
                            '[class*="conversation"], [class*="chat"], [class*="messages"], [class*="expanded"], [class*="open"]'
                        );
                        hasConversationElements = conversationElements.length > 0;
                    } catch (e) {
                        // Ignore shadow DOM access errors
                    }
                }
                
                const newExpandedState = shouldBeExpanded || hasConversationElements;
                
                if (newExpandedState !== isExpanded) {
                    isExpanded = newExpandedState;
                    updateWidgetSize();
                }
            } catch (e) {
                // Ignore errors
            }
        }
        
        // Check periodically
        setInterval(checkWidgetExpansion, 300);
        
        // Also check on DOM changes
        observer = new MutationObserver(() => {
            setTimeout(checkWidgetExpansion, 100);
        });
        
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
        
        // Check on clicks
        document.addEventListener('click', () => {
            setTimeout(checkWidgetExpansion, 200);
        });
    }
    
    // Update widget size based on state
    function updateWidgetSize() {
        if (!elevenLabsWidget) return;
        
        const container = document.getElementById('ai-widget-container');
        const isMobile = window.innerWidth <= 768;
        
        if (isExpanded) {
            // Expanded state
            if (isMobile) {
                elevenLabsWidget.style.width = 'calc(100vw - 40px)';
                elevenLabsWidget.style.height = '70vh';
                elevenLabsWidget.style.maxWidth = '380px';
                container.style.bottom = '10px';
                container.style.right = '10px';
            } else {
                elevenLabsWidget.style.width = '380px';
                elevenLabsWidget.style.height = '520px';
                container.style.bottom = '20px';
                container.style.right = '20px';
            }
            
            elevenLabsWidget.style.borderRadius = '20px';
            container.style.borderRadius = '20px';
            container.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
            
        } else {
            // Collapsed state
            elevenLabsWidget.style.width = '80px';
            elevenLabsWidget.style.height = '80px';
            elevenLabsWidget.style.borderRadius = '50%';
            container.style.borderRadius = '50%';
            container.style.bottom = '20px';
            container.style.right = '20px';
            container.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        }
    }
    
    // Hide ElevenLabs branding
    function hideBranding() {
        if (!elevenLabsWidget) return;
        
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
            'a[href*="conversational-ai"]'
        ];
        
        brandingSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.style.display = 'none';
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
                }
            }
        });
        
        // Hide branding in shadow DOM
        if (elevenLabsWidget.shadowRoot) {
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
                // Ignore cross-origin errors
            }
        }
    }
    
    // Handle window resize
    function handleResize() {
        if (isExpanded) {
            updateWidgetSize();
        }
    }
    
    // Initialize widget
    async function init() {
        try {
            // Load ElevenLabs script
            await loadElevenLabsScript();
            
            // Create container
            const container = createWidgetContainer();
            document.body.appendChild(container);
            
            // Create widget
            const widget = createElevenLabsWidget();
            container.appendChild(widget);
            
            // Start monitoring
            setTimeout(() => {
                monitorWidgetState();
                updateWidgetSize();
            }, 1000);
            
            // Hide branding periodically
            setTimeout(hideBranding, 1000);
            setTimeout(hideBranding, 2000);
            setTimeout(hideBranding, 3000);
            setTimeout(hideBranding, 5000);
            
            // Set up branding removal observer
            const brandingObserver = new MutationObserver(hideBranding);
            brandingObserver.observe(document.body, {
                childList: true,
                subtree: true
            });
            
            // Handle resize
            window.addEventListener('resize', handleResize);
            
            // Expose API
            window.aiWidget = {
                isExpanded: () => isExpanded,
                forceUpdate: updateWidgetSize,
                hideBranding: hideBranding
            };
            
            console.log('Direct ElevenLabs Widget loaded successfully!');
            
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
