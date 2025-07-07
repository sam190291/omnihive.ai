(function() {
    console.log('🚀 Loading AI Widget V2 - Mobile Hide Version');
    
    // Extract agent ID from script tag
    function getAgentIdFromScript() {
        const scripts = document.getElementsByTagName('script');
        for (let script of scripts) {
            if (script.src && script.src.includes('v2/widget-loader.js')) {
                const agentId = script.getAttribute('data-agent-id');
                if (agentId) return agentId;
            }
        }
        
        // Fallback: look for the current script
        const currentScript = document.currentScript;
        if (currentScript) {
            const agentId = currentScript.getAttribute('data-agent-id');
            if (agentId) return agentId;
        }
        
        return null;
    }

    // Get agent ID from current script
    const agentId = getAgentIdFromScript();
    
    if (!agentId) {
        console.error('AI Widget V2: No agent ID provided. Please add data-agent-id attribute to the script tag.');
        return;
    }
    
    // Build widget URL with agent parameter (V2)
    const widgetUrl = 'https://sam190291.github.io/omnihive.ai/v2/?agent=' + encodeURIComponent(agentId);

    // Create widget container
    const widgetContainer = document.createElement('div');
    widgetContainer.id = 'ai-widget-v2-container';
    widgetContainer.style.cssText = 'position: fixed; bottom: 20px; right: 20px; z-index: 9999; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);';

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = widgetUrl;
    iframe.style.cssText = 'width: 380px; height: 520px; border: none; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);';
    iframe.frameBorder = '0';
    iframe.setAttribute('allow', 'microphone');

    // Create mobile toggle button (V2 - Enhanced)
    const toggleButton = document.createElement('button');
    toggleButton.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M20 2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h14l4 4V4c0-1.1-.9-2-2-2zm-2 12H6v-2h12v2zm0-3H6V9h12v2zm0-3H6V6h12v2z"/>
        </svg>
    `;
    toggleButton.style.cssText = `
        display: none;
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 60px;
        height: 60px;
        border-radius: 50%;
        border: none;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        cursor: pointer;
        box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
        z-index: 10000;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        align-items: center;
        justify-content: center;
    `;

    // Create close button for mobile (V2 - Enhanced)
    const closeButton = document.createElement('button');
    closeButton.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
        </svg>
    `;
    closeButton.style.cssText = `
        display: none;
        position: absolute;
        top: 8px;
        right: 8px;
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: none;
        background: rgba(0,0,0,0.7);
        color: white;
        cursor: pointer;
        z-index: 10001;
        transition: all 0.2s ease;
        align-items: center;
        justify-content: center;
        backdrop-filter: blur(10px);
    `;

    // Widget state management
    let isMobile = false;
    let isWidgetVisible = true;
    let inactivityTimer;

    // Check if mobile
    function checkMobile() {
        return window.innerWidth <= 768;
    }

    // Update mobile state (V2 - Enhanced)
    function updateMobileState() {
        isMobile = checkMobile();
        
        if (isMobile) {
            // V2 Mobile layout - Enhanced
            iframe.style.width = 'calc(100vw - 20px)';
            iframe.style.height = '75vh';
            iframe.style.maxWidth = '380px';
            iframe.style.maxHeight = '600px';
            widgetContainer.style.bottom = '10px';
            widgetContainer.style.right = '10px';
            widgetContainer.style.left = '10px';
            widgetContainer.style.width = 'auto';
            
            // Show mobile controls
            toggleButton.style.display = isWidgetVisible ? 'none' : 'flex';
            closeButton.style.display = isWidgetVisible ? 'flex' : 'none';
            
        } else {
            // Desktop layout
            iframe.style.width = '380px';
            iframe.style.height = '520px';
            iframe.style.maxWidth = 'none';
            iframe.style.maxHeight = 'none';
            widgetContainer.style.bottom = '20px';
            widgetContainer.style.right = '20px';
            widgetContainer.style.left = 'auto';
            widgetContainer.style.width = 'auto';
            
            // Hide mobile controls on desktop
            toggleButton.style.display = 'none';
            closeButton.style.display = 'none';
            
            // Always show widget on desktop
            if (!isWidgetVisible) {
                showWidget();
            }
        }
    }

    // Show widget (V2)
    function showWidget() {
        isWidgetVisible = true;
        widgetContainer.style.display = 'block';
        toggleButton.style.display = 'none';
        if (isMobile) {
            closeButton.style.display = 'flex';
            resetInactivityTimer();
        }
    }

    // Hide widget (V2)
    function hideWidget() {
        isWidgetVisible = false;
        widgetContainer.style.display = 'none';
        closeButton.style.display = 'none';
        clearTimeout(inactivityTimer);
        if (isMobile) {
            toggleButton.style.display = 'flex';
        }
    }

    // V2: Auto-hide after inactivity (mobile only)
    function resetInactivityTimer() {
        if (isMobile && isWidgetVisible) {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                if (isMobile && isWidgetVisible) {
                    hideWidget();
                }
            }, 45000); // 45 seconds for V2
        }
    }

    // Event listeners
    toggleButton.addEventListener('click', function() {
        showWidget();
    });

    closeButton.addEventListener('click', function() {
        hideWidget();
    });

    // V2: Enhanced hover effects
    toggleButton.addEventListener('mouseenter', function() {
        this.style.transform = 'scale(1.1)';
        this.style.boxShadow = '0 8px 25px rgba(102, 126, 234, 0.6)';
    });

    toggleButton.addEventListener('mouseleave', function() {
        this.style.transform = 'scale(1)';
        this.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
    });

    closeButton.addEventListener('mouseenter', function() {
        this.style.background = 'rgba(220, 38, 38, 0.9)';
        this.style.transform = 'scale(1.1)';
    });

    closeButton.addEventListener('mouseleave', function() {
        this.style.background = 'rgba(0,0,0,0.7)';
        this.style.transform = 'scale(1)';
    });

    // Assemble widget
    widgetContainer.appendChild(iframe);
    widgetContainer.appendChild(closeButton);

    // Apply responsive design
    updateMobileState();
    window.addEventListener('resize', updateMobileState);
    
    // V2: Track user interaction for auto-hide
    function setupInactivityTracking() {
        if (isMobile) {
            document.addEventListener('click', resetInactivityTimer);
            document.addEventListener('scroll', resetInactivityTimer);
            document.addEventListener('touchstart', resetInactivityTimer);
            document.addEventListener('keypress', resetInactivityTimer);
            window.addEventListener('focus', resetInactivityTimer);
        }
    }

    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            document.body.appendChild(widgetContainer);
            document.body.appendChild(toggleButton);
            setupInactivityTracking();
        });
    } else {
        document.body.appendChild(widgetContainer);
        document.body.appendChild(toggleButton);
        setupInactivityTracking();
    }

    console.log('✅ AI Widget V2 Loaded Successfully');
})();
