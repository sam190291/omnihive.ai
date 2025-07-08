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
    
    // Create iframe with initial small size (closed state)
    const iframe = document.createElement('iframe');
    iframe.src = widgetUrl;
    iframe.frameBorder = '0';
    iframe.setAttribute('allow', 'microphone');
    
    // Widget states
    let isOpen = false;
    
    // Closed state dimensions (just the floating button)
    const closedState = {
        width: '80px',
        height: '80px',
        borderRadius: '50%'
    };
    
    // Open state dimensions (full widget)
    const openState = {
        mobile: {
            width: 'calc(100vw - 20px)',
            height: '70vh',
            maxWidth: '380px',
            borderRadius: '20px'
        },
        desktop: {
            width: '380px',
            height: '520px',
            borderRadius: '20px'
        }
    };
    
    // Apply base styles
    function applyBaseStyles() {
        iframe.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 9999;
            border: none;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
            overflow: hidden;
        `;
    }
    
    // Set closed state (small circular button)
    function setClosedState() {
        isOpen = false;
        iframe.style.width = closedState.width;
        iframe.style.height = closedState.height;
        iframe.style.borderRadius = closedState.borderRadius;
        
        // Mobile positioning
        if (window.innerWidth <= 768) {
            iframe.style.bottom = '20px';
            iframe.style.right = '20px';
        }
    }
    
    // Set open state (full widget)
    function setOpenState() {
        isOpen = true;
        const isMobile = window.innerWidth <= 768;
        
        if (isMobile) {
            iframe.style.width = openState.mobile.width;
            iframe.style.height = openState.mobile.height;
            iframe.style.maxWidth = openState.mobile.maxWidth;
            iframe.style.borderRadius = openState.mobile.borderRadius;
            iframe.style.bottom = '10px';
            iframe.style.right = '10px';
        } else {
            iframe.style.width = openState.desktop.width;
            iframe.style.height = openState.desktop.height;
            iframe.style.borderRadius = openState.desktop.borderRadius;
            iframe.style.bottom = '20px';
            iframe.style.right = '20px';
        }
    }
    
    // Listen for messages from the widget iframe
    window.addEventListener('message', function(event) {
        // Verify origin for security
        if (event.origin !== 'https://sam190291.github.io') return;
        
        const data = event.data;
        
        if (data.type === 'widget-state') {
            if (data.state === 'open') {
                setOpenState();
            } else if (data.state === 'closed') {
                setClosedState();
            }
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (isOpen) {
            setOpenState();
        } else {
            setClosedState();
        }
    });
    
    // Initialize widget
    function initializeWidget() {
        applyBaseStyles();
        setClosedState(); // Start in closed state
        document.body.appendChild(iframe);
    }
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeWidget);
    } else {
        initializeWidget();
    }
})();
