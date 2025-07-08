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
    
    let isOpen = false;
    let widgetContainer = null;
    let elevenLabsWidget = null;
    
    // Create floating button
    function createFloatingButton() {
        const button = document.createElement('div');
        button.id = 'ai-widget-button';
        button.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 60px;
            height: 60px;
            background: linear-gradient(45deg, #667eea, #764ba2);
            border-radius: 50%;
            box-shadow: 0 4px 20px rgba(0,0,0,0.3);
            cursor: pointer;
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.3s ease;
            color: white;
            font-size: 24px;
            user-select: none;
        `;
        
        button.innerHTML = '💬';
        
        // Add hover effects
        button.addEventListener('mouseenter', function() {
            button.style.transform = 'scale(1.1)';
            button.style.boxShadow = '0 6px 25px rgba(0,0,0,0.4)';
        });
        
        button.addEventListener('mouseleave', function() {
            button.style.transform = 'scale(1)';
            button.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
        });
        
        // Click handler
        button.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            toggleWidget();
        });
        
        return button;
    }
    
    // Create widget container
    function createWidgetContainer() {
        const container = document.createElement('div');
        container.id = 'ai-widget-container';
        container.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 380px;
            height: 520px;
            background: white;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: 9998;
            transform: scale(0);
            opacity: 0;
            pointer-events: none;
            transform-origin: bottom right;
            transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
            overflow: hidden;
        `;
        
        // Add close button
        const closeButton = document.createElement('div');
        closeButton.style.cssText = `
            position: absolute;
            top: 15px;
            right: 15px;
            width: 30px;
            height: 30px;
            background: rgba(0,0,0,0.1);
            border-radius: 50%;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            transition: all 0.2s ease;
            color: #666;
            font-size: 18px;
            font-weight: bold;
        `;
        closeButton.innerHTML = '×';
        
        closeButton.addEventListener('mouseenter', function() {
            closeButton.style.background = 'rgba(0,0,0,0.2)';
            closeButton.style.color = '#333';
        });
        
        closeButton.addEventListener('mouseleave', function() {
            closeButton.style.background = 'rgba(0,0,0,0.1)';
            closeButton.style.color = '#666';
        });
        
        closeButton.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            closeWidget();
        });
        
        container.appendChild(closeButton);
        
        // Add loading indicator
        const loadingDiv = document.createElement('div');
        loadingDiv.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            color: #666;
            font-family: Arial, sans-serif;
            font-size: 16px;
            text-align: center;
        `;
        loadingDiv.innerHTML = `
            <div style="margin-bottom: 10px;">🤖</div>
            <div>Loading AI Assistant...</div>
        `;
        container.appendChild(loadingDiv);
        
        return container;
    }
    
    // Load ElevenLabs widget
    function loadElevenLabsWidget() {
        if (elevenLabsWidget) return;
        
        // Load ElevenLabs script if not already loaded
        if (!window.customElements || !window.customElements.get('elevenlabs-convai')) {
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
            script.async = true;
            script.onload = function() {
                setTimeout(initializeElevenLabsWidget, 500);
            };
            document.head.appendChild(script);
        } else {
            initializeElevenLabsWidget();
        }
    }
    
    // Initialize ElevenLabs widget
    function initializeElevenLabsWidget() {
        elevenLabsWidget = document.createElement('elevenlabs-convai');
        elevenLabsWidget.setAttribute('agent-id', agentId);
        
        // Style the widget to fill container
        elevenLabsWidget.style.cssText = `
            width: 100%;
            height: 100%;
            border: none;
            border-radius: 20px;
        `;
        
        // Remove loading indicator
        const loadingDiv = widgetContainer.querySelector('div[style*="Loading AI Assistant"]');
        if (loadingDiv) {
            loadingDiv.remove();
        }
        
        widgetContainer.appendChild(elevenLabsWidget);
        
        // Hide branding after widget loads
        setTimeout(hideBranding, 1000);
        setTimeout(hideBranding, 2000);
        setTimeout(hideBranding, 3000);
        
        // Set up branding monitor
        const brandingObserver = new MutationObserver(hideBranding);
        brandingObserver.observe(widgetContainer, {
            childList: true,
            subtree: true
        });
    }
    
    // Hide ElevenLabs branding
    function hideBranding() {
        if (!elevenLabsWidget) return;
        
        // Hide branding in main document
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
    
    // Open widget
    function openWidget() {
        if (isOpen) return;
        
        isOpen = true;
        const button = document.getElementById('ai-widget-button');
        
        // Hide button
        button.style.transform = 'scale(0)';
        button.style.opacity = '0';
        button.style.pointerEvents = 'none';
        
        // Show container
        widgetContainer.style.transform = 'scale(1)';
        widgetContainer.style.opacity = '1';
        widgetContainer.style.pointerEvents = 'auto';
        
        // Mobile responsive
        if (window.innerWidth <= 768) {
            widgetContainer.style.width = 'calc(100vw - 20px)';
            widgetContainer.style.height = '70vh';
            widgetContainer.style.maxWidth = '380px';
            widgetContainer.style.bottom = '10px';
            widgetContainer.style.right = '10px';
        }
        
        // Load widget if not already loaded
        if (!elevenLabsWidget) {
            loadElevenLabsWidget();
        }
    }
    
    // Close widget
    function closeWidget() {
        if (!isOpen) return;
        
        isOpen = false;
        const button = document.getElementById('ai-widget-button');
        
        // Show button
        button.style.transform = 'scale(1)';
        button.style.opacity = '1';
        button.style.pointerEvents = 'auto';
        
        // Hide container
        widgetContainer.style.transform = 'scale(0)';
        widgetContainer.style.opacity = '0';
        widgetContainer.style.pointerEvents = 'none';
        
        // Reset mobile styles
        widgetContainer.style.width = '380px';
        widgetContainer.style.height = '520px';
        widgetContainer.style.bottom = '20px';
        widgetContainer.style.right = '20px';
    }
    
    // Toggle widget
    function toggleWidget() {
        if (isOpen) {
            closeWidget();
        } else {
            openWidget();
        }
    }
    
    // Event listeners
    function setupEventListeners() {
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isOpen) {
                closeWidget();
            }
        });
        
        // Close on outside click
        document.addEventListener('click', function(e) {
            if (isOpen && 
                !widgetContainer.contains(e.target) && 
                !document.getElementById('ai-widget-button').contains(e.target)) {
                closeWidget();
            }
        });
        
        // Handle window resize
        window.addEventListener('resize', function() {
            if (isOpen) {
                openWidget(); // Reapply responsive styles
            }
        });
    }
    
    // Initialize widget
    function init() {
        // Create elements
        const button = createFloatingButton();
        widgetContainer = createWidgetContainer();
        
        // Add to DOM
        document.body.appendChild(button);
        document.body.appendChild(widgetContainer);
        
        // Setup event listeners
        setupEventListeners();
        
        // Expose global API
        window.aiWidget = {
            open: openWidget,
            close: closeWidget,
            toggle: toggleWidget,
            isOpen: () => isOpen
        };
        
        console.log('AI Widget loaded successfully!');
    }
    
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
