window.addEventListener('load', () => {
    navigator.serviceWorker.register('/static/sw.js', { scope: window.location.origin })
        .then(registration => {
            console.log('ServiceWorker registered:', registration);
        })
});
