(function() {
    const agentId = getAgentIdFromScript();
    
    if (!agentId) {
        console.error('AI Widget: No agent ID provided.');
        return;
    }
    
    function getAgentIdFromScript() {
        const scripts = document.getElementsByTagName('script');
        for (let script of scripts) {
            if (script.src && script.src.includes('widget-loader.js')) {
                return script.getAttribute('data-agent-id');
            }
        }
        return document.currentScript?.getAttribute('data-agent-id') || null;
    }
    
    // Your existing branding removal code
    function addBrandingHideStyles() {
        const style = document.createElement('style');
        style.textContent = `/* Your existing CSS */`;
        document.head.appendChild(style);
    }
    
    async function init() {
        // Load ElevenLabs script
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/@elevenlabs/convai-widget-embed';
        document.head.appendChild(script);
        
        await new Promise(resolve => {
            script.onload = resolve;
        });
        
        // Create widget
        const widget = document.createElement('elevenlabs-convai');
        widget.setAttribute('agent-id', agentId);
        
        // ONLY set compact for mobile
        if (window.innerWidth <= 768) {
            widget.setAttribute('variant', 'compact');
        }
        // For desktop: no variant = default full size
        
        document.body.appendChild(widget);
        
        // Your existing branding removal
        addBrandingHideStyles();
    }
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
