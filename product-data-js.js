// Product Data for Pippa of London
// Based on realistic color data from major beauty brands

// Helper function to generate UUID
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Foundation shade data based on real brand color analysis
const foundationShades = [
    // Light shades (Monk 1-3)
    { name: "Porcelain", code: "P01", hex: "#FDBCB4", lab: {L: 85.2, a: 8.5, b: 14.2}, undertone: "cool", monk: 1, fitz: 1 },
    { name: "Ivory", code: "I02", hex: "#FDD5B1", lab: {L: 86.8, a: 5.2, b: 18.5}, undertone: "neutral", monk: 1, fitz: 1 },
    { name: "Alabaster", code: "A03", hex: "#FDDAA3", lab: {L: 87.4, a: 4.8, b: 21.3}, undertone: "warm", monk: 1, fitz: 1 },
    { name: "Fair", code: "F04", hex: "#F5D5AE", lab: {L: 84.6, a: 6.1, b: 19.7}, undertone: "cool", monk: 2, fitz: 2 },
    { name: "Light", code: "L05", hex: "#F4C795", lab: {L: 81.3, a: 8.9, b: 23.4}, undertone: "neutral", monk: 2, fitz: 2 },
    { name: "Vanilla", code: "V06", hex: "#F3BD84", lab: {L: 78.5, a: 10.2, b: 26.8}, undertone: "warm", monk: 2, fitz: 2 },
    
    // Medium shades (Monk 4-6)
    { name: "Nude", code: "N07", hex: "#E5AA70", lab: {L: 72.4, a: 12.8, b: 29.5}, undertone: "cool", monk: 3, fitz: 3 },
    { name: "Beige", code: "B08", hex: "#D19C68", lab: {L: 68.2, a: 13.5, b: 28.7}, undertone: "neutral", monk: 4, fitz: 3 },
    { name: "Golden", code: "G09", hex: "#C4925F", lab: {L: 64.8, a: 14.2, b: 30.1}, undertone: "warm", monk: 4, fitz: 3 },
    { name: "Honey", code: "H10", hex: "#BA8756", lab: {L: 61.3, a: 15.8, b: 31.2}, undertone: "warm", monk: 5, fitz: 4 },
    { name: "Caramel", code: "C11", hex: "#A67A4A", lab: {L: 55.8, a: 16.9, b: 29.8}, undertone: "neutral", monk: 5, fitz: 4 },
    { name: "Amber", code: "A12", hex: "#9B6F42", lab: {L: 51.2, a: 17.3, b: 28.4}, undertone: "cool", monk: 6, fitz: 4 },
    
    // Deep shades (Monk 7-10)
    { name: "Chestnut", code: "C13", hex: "#8B5F3C", lab: {L: 44.8, a: 18.2, b: 25.9}, undertone: "warm", monk: 7, fitz: 5 },
    { name: "Mahogany", code: "M14", hex: "#7A4E32", lab: {L: 38.6, a: 19.1, b: 22.8}, undertone: "neutral", monk: 8, fitz: 5 },
    { name: "Espresso", code: "E15", hex: "#6B3E28", lab: {L: 32.4, a: 19.8, b: 19.6}, undertone: "cool", monk: 9, fitz: 6 },
    { name: "Cocoa", code: "C16", hex: "#5A2F1E", lab: {L: 26.8, a: 20.2, b: 16.4}, undertone: "neutral", monk: 10, fitz: 6 }
];

// Concealer shades (slightly lighter variations)
const concealerShades = foundationShades.slice(0, 12).map(shade => ({
    ...shade,
    lab: { L: shade.lab.L + 2, a: shade.lab.a - 0.5, b: shade.lab.b - 1 }
}));

// Lipstick shades
const lipstickShades = [
    { name: "Nude Blush", code: "NB01", hex: "#E8B4B8", lab: {L: 75.2, a: 18.5, b: 8.2}, undertone: "cool", monk: 2, fitz: 2 },
    { name: "Rose Petal", code: "RP02", hex: "#DC9FA6", lab: {L: 68.4, a: 22.8, b: 6.5}, undertone: "cool", monk: 3, fitz: 3 },
    { name: "Mauve Magic", code: "MM03", hex: "#C78B96", lab: {L: 62.1, a: 20.4, b: 3.8}, undertone: "cool", monk: 4, fitz: 3 },
    { name: "Berry Kiss", code: "BK04", hex: "#A66B7C", lab: {L: 52.3, a: 25.6, b: 1.2}, undertone: "cool", monk: 5, fitz: 4 },
    { name: "Classic Red", code: "CR05", hex: "#C73E3A", lab: {L: 48.5, a: 48.2, b: 28.4}, undertone: "neutral", monk: 0, fitz: 0 },
    { name: "Coral Reef", code: "CR06", hex: "#E47B75", lab: {L: 60.8, a: 34.5, b: 18.6}, undertone: "warm", monk: 3, fitz: 3 },
    { name: "Peach Perfect", code: "PP07", hex: "#F4A09C", lab: {L: 71.2, a: 24.8, b: 16.3}, undertone: "warm", monk: 2, fitz: 2 },
    { name: "Wine Night", code: "WN08", hex: "#8B2C47", lab: {L: 35.8, a: 38.4, b: 2.1}, undertone: "cool", monk: 7, fitz: 5 }
];

// Blush shades
const blushShades = [
    { name: "Baby Pink", code: "BP01", hex: "#FFC0CB", lab: {L: 81.2, a: 18.2, b: 8.5}, undertone: "cool", monk: 1, fitz: 1 },
    { name: "Peach Glow", code: "PG02", hex: "#FFAB91", lab: {L: 73.8, a: 24.5, b: 22.3}, undertone: "warm", monk: 2, fitz: 2 },
    { name: "Rose Gold", code: "RG03", hex: "#E8A898", lab: {L: 71.2, a: 20.8, b: 12.6}, undertone: "neutral", monk: 3, fitz: 3 },
    { name: "Berry Flush", code: "BF04", hex: "#D08B92", lab: {L: 63.4, a: 22.1, b: 6.8}, undertone: "cool", monk: 4, fitz: 3 },
    { name: "Coral Dream", code: "CD05", hex: "#E89383", lab: {L: 66.8, a: 28.4, b: 18.9}, undertone: "warm", monk: 4, fitz: 4 },
    { name: "Plum Pop", code: "PP06", hex: "#B57281", lab: {L: 54.2, a: 24.8, b: 2.4}, undertone: "cool", monk: 6, fitz: 5 }
];

// Bronzer shades
const bronzerShades = [
    { name: "Sun Kiss", code: "SK01", hex: "#D2A679", lab: {L: 70.2, a: 12.8, b: 28.5}, undertone: "warm", monk: 3, fitz: 3 },
    { name: "Golden Hour", code: "GH02", hex: "#C4925F", lab: {L: 64.8, a: 14.2, b: 30.1}, undertone: "warm", monk: 4, fitz: 3 },
    { name: "Beach Bronze", code: "BB03", hex: "#B07C52", lab: {L: 56.4, a: 16.8, b: 28.6}, undertone: "neutral", monk: 5, fitz: 4 },
    { name: "Deep Glow", code: "DG04", hex: "#9B6542", lab: {L: 47.8, a: 18.4, b: 25.2}, undertone: "warm", monk: 7, fitz: 5 }
];

// Generate complete product database
const generateProducts = () => {
    const products = [];
    
    // Foundations
    for (let i = 1; i <= 25; i++) {
        const product = {
            productId: `found-${i.toString().padStart(3, '0')}`,
            name: `${['Flawless', 'Perfect', 'Natural', 'Radiant', 'Matte'][i % 5]} Foundation ${['Pro', 'Plus', 'HD', 'Elite', '24H'][Math.floor(i/5) % 5]}`,
            brand: "Pippa of London",
            category: "foundation",
            subcategory: i % 3 === 0 ? "powder" : "liquid",
            description: `${i % 3 === 0 ? 'Powder' : 'Liquid'} foundation with ${['buildable coverage', 'full coverage', 'natural finish'][i % 3]} and ${['24-hour wear', 'hydrating formula', 'oil-control technology'][Math.floor(i/3) % 3]}.`,
            price: 28 + (i % 3) * 7,
            currency: "GBP",
            shades: foundationShades.map((shade, idx) => ({
                shadeId: `found-${i.toString().padStart(3, '0')}-${(idx + 1).toString().padStart(2, '0')}`,
                ...shade,
                coverage: i % 3 === 0 ? "medium" : "full",
                inStock: Math.random() > 0.1,
                popularity: Math.random() * 10
            })),
            features: [
                ["long-wearing", "buildable", "non-comedogenic"],
                ["hydrating", "lightweight", "SPF 15"],
                ["oil-free", "matte finish", "pore-minimizing"]
            ][i % 3],
            skinTypes: [
                ["all", "dry", "normal"],
                ["all", "oily", "combination"],
                ["all", "sensitive", "dry"]
            ][i % 3],
            ingredients: ["water", "dimethicone", "titanium dioxide", "iron oxides", "glycerin"],
            images: {
                main: `https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400`,
                swatch: `https://images.unsplash.com/photo-1583241800078-61947dd38745?w=400`,
                lifestyle: `https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400`
            },
            createdAt: new Date().toISOString(),
            isActive: true
        };
        products.push(product);
    }
    
    // Concealers
    for (let i = 1; i <= 20; i++) {
        const product = {
            productId: `conc-${i.toString().padStart(3, '0')}`,
            name: `${['Flawless', 'Perfect', 'Bright', 'Cover', 'Smooth'][i % 5]} Concealer ${['Pro', 'Plus', 'HD', 'Max', '24H'][Math.floor(i/5) % 5]}`,
            brand: "Pippa of London",
            category: "concealer",
            subcategory: i % 2 === 0 ? "stick" : "liquid",
            description: `High-coverage concealer that ${['brightens', 'corrects', 'perfects'][i % 3]} and ${['hydrates', 'sets perfectly', 'lasts all day'][Math.floor(i/3) % 3]}.`,
            price: 18 + (i % 3) * 4,
            currency: "GBP",
            shades: concealerShades.map((shade, idx) => ({
                shadeId: `conc-${i.toString().padStart(3, '0')}-${(idx + 1).toString().padStart(2, '0')}`,
                ...shade,
                coverage: "full",
                inStock: Math.random() > 0.15,
                popularity: Math.random() * 10
            })),
            features: [
                ["brightening", "hydrating", "crease-proof"],
                ["full coverage", "lightweight", "long-wearing"],
                ["color-correcting", "buildable", "natural finish"]
            ][i % 3],
            skinTypes: ["all", "dry", "normal", "combination"],
            ingredients: ["water", "cyclopentasiloxane", "titanium dioxide", "iron oxides"],
            images: {
                main: `https://images.unsplash.com/photo-1557205465-f3762edea6d3?w=400`,
                swatch: `https://images.unsplash.com/photo-1583241800078-61947dd38745?w=400`,
                lifestyle: `https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400`
            },
            createdAt: new Date().toISOString(),
            isActive: true
        };
        products.push(product);
    }
    
    // Lipsticks
    for (let i = 1; i <= 15; i++) {
        const product = {
            productId: `lips-${i.toString().padStart(3, '0')}`,
            name: `${['Velvet', 'Satin', 'Matte', 'Gloss', 'Cream'][i % 5]} Lip Color ${['Luxe', 'Pro', 'HD', 'Elite', 'Plus'][Math.floor(i/5) % 5]}`,
            brand: "Pippa of London",
            category: "lipstick",
            subcategory: ["matte", "satin", "gloss", "liquid", "cream"][i % 5],
            description: `${['Matte', 'Satin', 'Glossy', 'Creamy', 'Velvet'][i % 5]} finish lipstick with ${['intense color', 'hydrating formula', 'long-lasting wear'][Math.floor(i/3) % 3]}.`,
            price: 22 + (i % 3) * 3,
            currency: "GBP",
            shades: lipstickShades.map((shade, idx) => ({
                shadeId: `lips-${i.toString().padStart(3, '0')}-${(idx + 1).toString().padStart(2, '0')}`,
                ...shade,
                coverage: ["full", "medium", "buildable"][i % 3],
                inStock: Math.random() > 0.1,
                popularity: Math.random() * 10
            })),
            features: [
                ["moisturizing", "long-wearing", "fade-resistant"],
                ["high-pigment", "comfortable", "non-drying"],
                ["buildable color", "smooth application", "vitamin E"]
            ][i % 3],
            skinTypes: ["all"],
            ingredients: ["castor oil", "beeswax", "vitamin E", "shea butter"],
            images: {
                main: `https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400`,
                swatch: `https://images.unsplash.com/photo-1583241800078-61947dd38745?w=400`,
                lifestyle: `https://images.unsplash.com/photo-1560421683-6856ea585c78?w=400`
            },
            createdAt: new Date().toISOString(),
            isActive: true
        };
        products.push(product);
    }
    
    // Blushes
    for (let i = 1; i <= 10; i++) {
        const product = {
            productId: `blush-${i.toString().padStart(3, '0')}`,
            name: `${['Glow', 'Radiant', 'Natural', 'Velvet', 'Silk'][i % 5]} Blush ${['Pro', 'Plus', 'HD', 'Elite', 'Luxe'][Math.floor(i/5) % 5]}`,
            brand: "Pippa of London",
            category: "blush",
            subcategory: i % 2 === 0 ? "powder" : "cream",
            description: `${i % 2 === 0 ? 'Powder' : 'Cream'} blush that delivers ${['natural flush', 'radiant glow', 'buildable color'][i % 3]}.`,
            price: 20 + (i % 2) * 5,
            currency: "GBP",
            shades: blushShades.map((shade, idx) => ({
                shadeId: `blush-${i.toString().padStart(3, '0')}-${(idx + 1).toString().padStart(2, '0')}`,
                ...shade,
                coverage: "buildable",
                inStock: Math.random() > 0.05,
                popularity: Math.random() * 10
            })),
            features: [
                ["buildable", "blendable", "long-wearing"],
                ["natural finish", "lightweight", "radiant"],
                ["silky texture", "fade-resistant", "luminous"]
            ][i % 3],
            skinTypes: ["all"],
            ingredients: ["talc", "mica", "iron oxides", "titanium dioxide"],
            images: {
                main: `https://images.unsplash.com/photo-1590156206657-0c28f5ee09a6?w=400`,
                swatch: `https://images.unsplash.com/photo-1583241800078-61947dd38745?w=400`,
                lifestyle: `https://images.unsplash.com/photo-1560421683-6856ea585c78?w=400`
            },
            createdAt: new Date().toISOString(),
            isActive: true
        };
        products.push(product);
    }
    
    // Bronzers
    for (let i = 1; i <= 5; i++) {
        const product = {
            productId: `bronz-${i.toString().padStart(3, '0')}`,
            name: `${['Sun', 'Glow', 'Bronze', 'Radiant', 'Natural'][i % 5]} Bronzer ${['Pro', 'Plus', 'HD', 'Elite', 'Luxe'][i % 5]}`,
            brand: "Pippa of London",
            category: "bronzer",
            subcategory: "powder",
            description: `Bronzing powder that creates a ${['sun-kissed', 'natural', 'radiant'][i % 3]} glow with ${['buildable coverage', 'smooth blend', 'long-lasting formula'][Math.floor(i/2) % 3]}.`,
            price: 25 + (i % 2) * 5,
            currency: "GBP",
            shades: bronzerShades.map((shade, idx) => ({
                shadeId: `bronz-${i.toString().padStart(3, '0')}-${(idx + 1).toString().padStart(2, '0')}`,
                ...shade,
                coverage: "buildable",
                inStock: Math.random() > 0.1,
                popularity: Math.random() * 10
            })),
            features: [
                ["buildable", "matte finish", "natural-looking"],
                ["luminous", "blendable", "long-wearing"],
                ["smooth texture", "fade-resistant", "universal"]
            ][i % 3],
            skinTypes: ["all"],
            ingredients: ["talc", "mica", "iron oxides", "titanium dioxide"],
            images: {
                main: `https://images.unsplash.com/photo-1571290274554-5e6c4c02734c?w=400`,
                swatch: `https://images.unsplash.com/photo-1583241800078-61947dd38745?w=400`,
                lifestyle: `https://images.unsplash.com/photo-1560421683-6856ea585c78?w=400`
            },
            createdAt: new Date().toISOString(),
            isActive: true
        };
        products.push(product);
    }
    
    return products;
};

// Initialize product database
const PRODUCT_DATABASE = generateProducts();

// Save to localStorage
if (typeof window !== 'undefined') {
    localStorage.setItem('pippa_products', JSON.stringify(PRODUCT_DATABASE));
    console.log(`Initialized ${PRODUCT_DATABASE.length} products with ${PRODUCT_DATABASE.reduce((sum, p) => sum + p.shades.length, 0)} total shades`);
}