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
    
    // Create floating button first
    const floatingButton = document.createElement('div');
    floatingButton.style.cssText = `
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
    `;
    
    floatingButton.innerHTML = '💬';
    
    // Add hover effect
    floatingButton.addEventListener('mouseenter', function() {
        floatingButton.style.transform = 'scale(1.1)';
        floatingButton.style.boxShadow = '0 6px 25px rgba(0,0,0,0.4)';
    });
    
    floatingButton.addEventListener('mouseleave', function() {
        floatingButton.style.transform = 'scale(1)';
        floatingButton.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
    });
    
    // Create iframe (hidden initially)
    const iframe = document.createElement('iframe');
    const widgetUrl = 'https://sam190291.github.io/omnihive.ai/?agent=' + encodeURIComponent(agentId);
    iframe.src = widgetUrl;
    iframe.frameBorder = '0';
    iframe.setAttribute('allow', 'microphone');
    
    iframe.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 380px;
        height: 520px;
        z-index: 9998;
        border: none;
        border-radius: 20px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
        transition: all 0.3s ease;
        transform: scale(0);
        opacity: 0;
        pointer-events: none;
        transform-origin: bottom right;
    `;
    
    let isOpen = false;
    
    // Toggle widget
    function toggleWidget() {
        if (isOpen) {
            closeWidget();
        } else {
            openWidget();
        }
    }
    
    function openWidget() {
        isOpen = true;
        floatingButton.style.display = 'none';
        iframe.style.transform = 'scale(1)';
        iframe.style.opacity = '1';
        iframe.style.pointerEvents = 'auto';
        
        // Mobile responsive
        if (window.innerWidth <= 768) {
            iframe.style.width = 'calc(100vw - 20px)';
            iframe.style.height = '70vh';
            iframe.style.maxWidth = '380px';
            iframe.style.bottom = '10px';
            iframe.style.right = '10px';
        }
    }
    
    function closeWidget() {
        isOpen = false;
        floatingButton.style.display = 'flex';
        iframe.style.transform = 'scale(0)';
        iframe.style.opacity = '0';
        iframe.style.pointerEvents = 'none';
        
        // Reset mobile styles
        iframe.style.width = '380px';
        iframe.style.height = '520px';
        iframe.style.bottom = '20px';
        iframe.style.right = '20px';
    }
    
    // Button click handler
    floatingButton.addEventListener('click', toggleWidget);
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && isOpen) {
            closeWidget();
        }
    });
    
    // Close on outside click
    document.addEventListener('click', function(e) {
        if (isOpen && !iframe.contains(e.target) && !floatingButton.contains(e.target)) {
            closeWidget();
        }
    });
    
    // Handle window resize
    window.addEventListener('resize', function() {
        if (isOpen) {
            openWidget(); // Reapply responsive styles
        }
    });
    
    // Initialize
    function init() {
        document.body.appendChild(floatingButton);
        document.body.appendChild(iframe);
        
        // Add status indicator
        const status = document.createElement('div');
        status.style.cssText = `
            position: fixed;
            top: 20px;
            left: 20px;
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 15px;
            border-radius: 10px;
            font-size: 14px;
            z-index: 1000;
            font-family: Arial, sans-serif;
        `;
        
        function updateStatus() {
            status.textContent = `Widget: ${isOpen ? 'Open' : 'Closed'} | Clicks: ${isOpen ? 'Blocked' : 'Allowed'}`;
        }
        
        updateStatus();
        setInterval(updateStatus, 500);
        
        document.body.appendChild(status);
    }
    
    // Wait for DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
