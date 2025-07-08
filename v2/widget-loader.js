(function() {
    // Extract agent ID from script tag
    function getAgentIdFromScript() {
        const scripts = document.getElementsByTagName('script');
        for (let script of scripts) {
            if (script.src && (script.src.includes('widget-loader-v2.js') || script.src.includes('widget-loader.js'))) {
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
        console.error('AI Widget V2.0: No agent ID provided.');
        return;
    }
    
    let iframe = null;
    let widgetState = 'loading';
    let isMobile = false;
    let isHidden = false;
    
    // Check if device is mobile
    function checkMobile() {
        isMobile = window.innerWidth <= 768;
        return isMobile;
    }
    
    // Create iframe
    function createWidget() {
        iframe = document.createElement('iframe');
        const widgetUrl = `https://sam190291.github.io/omnihive.ai/v2/?agent=${encodeURIComponent(agentId)}`;
        iframe.src = widgetUrl;
        iframe.frameBorder = '0';
        iframe.setAttribute('allow', 'microphone');
        iframe.setAttribute('title', 'AI Assistant V2.0');
        
        // Initial styling
        iframe.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 380px;
            height: 520px;
            z-index: 9999;
            border: none;
            border-radius: 20px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            overflow: hidden;
        `;
        
        // Mobile responsive
        if (checkMobile()) {
            iframe.style.width = 'calc(100vw - 30px)';
            iframe.style.height = '70vh';
            iframe.style.maxWidth = '380px';
            iframe.style.bottom = '15px';
            iframe.style.right = '15px';
        }
        
        return iframe;
    }
    
    // Update iframe based on widget state
    function updateWidgetDisplay(state, mobile, hidden) {
        if (!iframe) return;
        
        widgetState = state;
        isMobile = mobile;
        isHidden = hidden;
        
        if (state === 'loading') {
            // Show small loading indicator
            iframe.style.width = '60px';
            iframe.style.height = '60px';
            iframe.style.borderRadius = '50%';
        } else if (hidden) {
            // Widget is hidden, show small button
            iframe.style.width = mobile ? '50px' : '60px';
            iframe.style.height = mobile ? '50px' : '60px';
            iframe.style.borderRadius = '50%';
            iframe.style.bottom = mobile ? '15px' : '20px';
            iframe.style.right = mobile ? '15px' : '20px';
        } else {
            // Widget is open, show full size
            if (mobile) {
                iframe.style.width = 'calc(100vw - 30px)';
                iframe.style.height = '70vh';
                iframe.style.maxWidth = '380px';
                iframe.style.bottom = '15px';
                iframe.style.right = '15px';
            } else {
                iframe.style.width = '380px';
                iframe.style.height = '520px';
                iframe.style.bottom = '20px';
                iframe.style.right = '20px';
            }
            iframe.style.borderRadius = '20px';
        }
    }
    
    // Listen for messages from widget
    function setupMessageListener() {
        window.addEventListener('message', function(event) {
            // Verify origin for security
            if (event.origin !== 'https://sam190291.github.io') return;
            
            const data = event.data;
            
            if (data.type === 'widget-state-v2') {
                updateWidgetDisplay(data.state, data.isMobile, data.isHidden);
            }
        });
    }
    
    // Handle window resize
    function handleResize() {
        const wasMobile = isMobile;
        checkMobile();
        
        if (wasMobile !== isMobile) {
            updateWidgetDisplay(widgetState, isMobile, isHidden);
        }
    }
    
    // Add status indicator (optional)
    function addStatusIndicator() {
        const status = document.createElement('div');
        status.id = 'ai-widget-v2-status';
        status.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 8px 12px;
            border-radius: 8px;
            font-size: 12px;
            z-index: 1000;
            font-family: Arial, sans-serif;
            display: none;
        `;
        
        function updateStatus() {
            const stateText = isHidden ? 'Hidden' : 'Open';
            const deviceText = isMobile ? 'Mobile' : 'Desktop';
            status.textContent = `AI Widget V2.0: ${stateText} (${deviceText})`;
        }
        
        // Show status for development/testing
        if (window.location.hostname === 'localhost' || 
            window.location.hostname === '127.0.0.1' ||
            window.location.search.includes('debug=true')) {
            status.style.display = 'block';
            setInterval(updateStatus, 1000);
        }
        
        document.body.appendChild(status);
    }
    
    // Initialize widget
    function init() {
        checkMobile();
        
        // Create and add widget
        const widget = createWidget();
        document.body.appendChild(widget);
        
        // Setup message listener
        setupMessageListener();
        
        // Handle resize
        window.addEventListener('resize', handleResize);
        
        // Add status indicator (for debugging)
        addStatusIndicator();
        
        // Expose API
        window.aiWidgetV2 = {
            getState: () => ({ state: widgetState, isMobile, isHidden }),
            resize: handleResize
        };
        
        console.log('AI Widget V2.0 Loader initialized successfully!');
    }
    
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
