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
        
        // Fallback: look for the current script
        const currentScript = document.currentScript;
        if (currentScript) {
            const agentId = currentScript.getAttribute('data-agent-id');
            if (agentId) return agentId;
        }
        
        return null;
    }

    const agentId = getAgentIdFromScript();
    
    if (!agentId) {
        console.error('AI Widget: No agent ID provided. Please add data-agent-id attribute to the script tag.');
        return;
    }
    
    // Build widget URL with agent parameter
    const widgetUrl = 'https://sam190291.github.io/omnihive.ai/?agent=' + encodeURIComponent(agentId);
    
    // Create iframe with pointer-events: none initially
    const iframe = document.createElement('iframe');
    iframe.src = widgetUrl;
    iframe.frameBorder = '0';
    iframe.setAttribute('allow', 'microphone');
    
    // Start with small size and click-through enabled
    iframe.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 80px;
        height: 80px;
        z-index: 9999;
        border: none;
        border-radius: 50%;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
        pointer-events: auto;
        overflow: hidden;
    `;
    
    let isExpanded = false;
    let clickDetectionEnabled = true;
    
    // Function to detect if widget is visually expanded
    function checkIfWidgetExpanded() {
        if (!clickDetectionEnabled) return;
        
        try {
            // Check if iframe content suggests expansion
            const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
            if (iframeDoc) {
                // Look for expanded elements
                const hasExpandedElements = iframeDoc.querySelector('[class*="expanded"], [class*="open"], [class*="active"]');
                return !!hasExpandedElements;
            }
        } catch (e) {
            // Cross-origin restrictions - use alternative detection
        }
        
        // Alternative: detect clicks on the iframe itself
        return false;
    }
    
    // Handle iframe clicks
    iframe.addEventListener('load', function() {
        // Enable click detection on the iframe
        iframe.addEventListener('click', function(e) {
            if (!isExpanded) {
                // First click - expand the widget
                expandWidget();
                e.preventDefault();
            }
        });
        
        // Monitor for escape key or outside clicks to collapse
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && isExpanded) {
                collapseWidget();
            }
        });
        
        // Click outside to collapse
        document.addEventListener('click', function(e) {
            if (isExpanded && !iframe.contains(e.target)) {
                // Add small delay to allow widget interactions
                setTimeout(() => {
                    collapseWidget();
                }, 100);
            }
        });
    });
    
    // Expand widget function
    function expandWidget() {
        if (isExpanded) return;
        
        isExpanded = true;
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            iframe.style.width = 'calc(100vw - 20px)';
            iframe.style.height = '70vh';
            iframe.style.maxWidth = '380px';
            iframe.style.bottom = '10px';
            iframe.style.right = '10px';
        } else {
            iframe.style.width = '380px';
            iframe.style.height = '520px';
            iframe.style.bottom = '20px';
            iframe.style.right = '20px';
        }
        
        iframe.style.borderRadius = '20px';
        iframe.style.pointerEvents = 'auto';
        
        // Send expand message to widget
        try {
            iframe.contentWindow.postMessage({ type: 'expand' }, '*');
        } catch (e) {}
    }
    
    // Collapse widget function
    function collapseWidget() {
        if (!isExpanded) return;
        
        isExpanded = false;
        iframe.style.width = '80px';
        iframe.style.height = '80px';
        iframe.style.borderRadius = '50%';
        iframe.style.bottom = '20px';
        iframe.style.right = '20px';
        iframe.style.pointerEvents = 'auto';
        
        // Send collapse message to widget
        try {
            iframe.contentWindow.postMessage({ type: 'collapse' }, '*');
        } catch (e) {}
    }
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (isExpanded) {
            expandWidget();
        }
    });
    
    // Auto-collapse after period of inactivity
    let inactivityTimer;
    function resetInactivityTimer() {
        clearTimeout(inactivityTimer);
        if (isExpanded) {
            inactivityTimer = setTimeout(() => {
                collapseWidget();
            }, 30000); // 30 seconds of inactivity
        }
    }
    
    // Monitor mouse movement over iframe
    iframe.addEventListener('mouseenter', resetInactivityTimer);
    iframe.addEventListener('mouseleave', resetInactivityTimer);
    
    // Add hover effect for closed state
    iframe.addEventListener('mouseenter', function() {
        if (!isExpanded) {
            iframe.style.transform = 'scale(1.1)';
            iframe.style.boxShadow = '0 15px 40px rgba(0,0,0,0.3)';
        }
    });
    
    iframe.addEventListener('mouseleave', function() {
        if (!isExpanded) {
            iframe.style.transform = 'scale(1)';
            iframe.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
        }
    });
    
    // Initialize widget
    function initializeWidget() {
        document.body.appendChild(iframe);
        
        // Add widget controls
        addWidgetControls();
    }
    
    // Add manual controls for testing
    function addWidgetControls() {
        const controls = document.createElement('div');
        controls.style.cssText = `
            position: fixed;
            top: 60px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px;
            border-radius: 10px;
            z-index: 10000;
            font-size: 12px;
            font-family: Arial, sans-serif;
        `;
        
        controls.innerHTML = `
            <div>Widget Controls:</div>
            <button onclick="window.aiWidget.expand()" style="margin: 2px; padding: 5px 10px; font-size: 10px;">Expand</button>
            <button onclick="window.aiWidget.collapse()" style="margin: 2px; padding: 5px 10px; font-size: 10px;">Collapse</button>
            <div>Status: <span id="widget-status">Closed</span></div>
        `;
        
        document.body.appendChild(controls);
        
        // Expose global controls
        window.aiWidget = {
            expand: expandWidget,
            collapse: collapseWidget,
            isExpanded: () => isExpanded
        };
        
        // Update status
        const statusEl = document.getElementById('widget-status');
        setInterval(() => {
            if (statusEl) {
                statusEl.textContent = isExpanded ? 'Open' : 'Closed';
            }
        }, 500);
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWidget);
    } else {
        initializeWidget();
    }
})();
