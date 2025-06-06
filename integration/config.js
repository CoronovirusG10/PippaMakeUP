// integration/config.js - Application configuration

export const Config = {
    api: {
        baseUrl: window.location.origin,
        timeout: 30000,
        retryAttempts: 3
    },
    analysis: {
        maxImageSize: 10 * 1024 * 1024, // 10MB
        supportedFormats: ['image/jpeg', 'image/png'],
        confidenceThreshold: 0.7
    },
    ui: {
        animationDuration: 300,
        notificationTimeout: 5000,
        autoSaveInterval: 30000
    },
    features: {
        enableVideoAnalysis: false,
        enableSocialSharing: true,
        enablePushNotifications: false
    }
};
