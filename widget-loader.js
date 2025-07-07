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

    // Get agent ID from current script
    const agentId = getAgentIdFromScript();
    
    if (!agentId) {
        console.error('AI Widget: No agent ID provided. Please add data-agent-id attribute to the script tag.');
        return;
    }
    
    // Build widget URL with agent parameter
    const widgetUrl = 'https://yourusername.github.io/ai-voice-widget/?agent=' + encodeURIComponent(agentId);

    // Create iframe
    const iframe = document.createElement('iframe');
    iframe.src = widgetUrl;
    iframe.style.cssText = 'position: fixed; bottom: 20px; right: 20px; width: 380px; height: 520px; z-index: 9999; border: none; border-radius: 20px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);';
    iframe.frameBorder = '0';
    iframe.setAttribute('allow', 'microphone');
    
    // Add responsive behavior
    iframe.style.transition = 'all 0.3s ease';
    
    // Mobile responsive
    function makeResponsive() {
        if (window.innerWidth <= 768) {
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
    }

    // Apply responsive design
    makeResponsive();
    window.addEventListener('resize', makeResponsive);
    
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            document.body.appendChild(iframe);
        });
    } else {
        document.body.appendChild(iframe);
    }
})();
