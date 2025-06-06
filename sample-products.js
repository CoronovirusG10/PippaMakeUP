// sample-products.js - Mock product database for color analysis testing

// Generate realistic shade data for different skin tone ranges
function generateShadeData() {
    const shades = {
        foundation: [
            // Very Fair (Monk 1-2)
            { name: "Porcelain", code: "P01", hex: "#FDE7D9", lab: {L: 92, a: 5, b: 10}, undertone: "cool", monkScale: 1 },
            { name: "Ivory", code: "P02", hex: "#FAE5D3", lab: {L: 90, a: 6, b: 12}, undertone: "neutral", monkScale: 1 },
            { name: "Fair Pink", code: "P03", hex: "#FDDCCF", lab: {L: 88, a: 8, b: 11}, undertone: "cool", monkScale: 2 },
            { name: "Fair Beige", code: "P04", hex: "#F9DCC4", lab: {L: 87, a: 7, b: 15}, undertone: "warm", monkScale: 2 },
            
            // Light (Monk 3-4)
            { name: "Light Ivory", code: "L01", hex: "#F5D5B8", lab: {L: 82, a: 8, b: 18}, undertone: "neutral", monkScale: 3 },
            { name: "Light Beige", code: "L02", hex: "#EFCAA6", lab: {L: 78, a: 10, b: 22}, undertone: "warm", monkScale: 3 },
            { name: "Sand", code: "L03", hex: "#E8C39E", lab: {L: 76, a: 11, b: 20}, undertone: "neutral", monkScale: 4 },
            { name: "Natural Beige", code: "L04", hex: "#DDB896", lab: {L: 72, a: 12, b: 23}, undertone: "warm", monkScale: 4 },
            
            // Medium (Monk 5-6)
            { name: "Golden Beige", code: "M01", hex: "#D4A574", lab: {L: 68, a: 14, b: 28}, undertone: "warm", monkScale: 5 },
            { name: "Honey", code: "M02", hex: "#C8986B", lab: {L: 64, a: 15, b: 26}, undertone: "warm", monkScale: 5 },
            { name: "Caramel", code: "M03", hex: "#BD8B60", lab: {L: 60, a: 16, b: 25}, undertone: "neutral", monkScale: 6 },
            { name: "Toffee", code: "M04", hex: "#B17F58", lab: {L: 56, a: 17, b: 24}, undertone: "neutral", monkScale: 6 },
            
            // Tan (Monk 7-8)
            { name: "Almond", code: "T01", hex: "#A57257", lab: {L: 52, a: 18, b: 22}, undertone: "cool", monkScale: 7 },
            { name: "Bronze", code: "T02", hex: "#996650", lab: {L: 48, a: 17, b: 20}, undertone: "warm", monkScale: 7 },
            { name: "Chestnut", code: "T03", hex: "#8D5A44", lab: {L: 44, a: 16, b: 19}, undertone: "neutral", monkScale: 8 },
            { name: "Mahogany", code: "T04", hex: "#814E3C", lab: {L: 40, a: 15, b: 18}, undertone: "warm", monkScale: 8 },
            
            // Deep (Monk 9-10)
            { name: "Espresso", code: "D01", hex: "#6B3E2E", lab: {L: 32, a: 14, b: 16}, undertone: "cool", monkScale: 9 },
            { name: "Cocoa", code: "D02", hex: "#5C3425", lab: {L: 28, a: 12, b: 14}, undertone: "neutral", monkScale: 9 },
            { name: "Ebony", code: "D03", hex: "#4A2A1F", lab: {L: 24, a: 10, b: 12}, undertone: "warm", monkScale: 10 },
            { name: "Onyx", code: "D04", hex: "#3B1F17", lab: {L: 20, a: 8, b: 10}, undertone: "neutral", monkScale: 10 }
        ],
        concealer: [
            // Concealers are typically slightly lighter than foundations
            { name: "Fair Brightening", code: "C01", hex: "#FEF0E6", lab: {L: 94, a: 4, b: 8}, undertone: "cool", monkScale: 1 },
            { name: "Light Brightening", code: "C02", hex: "#FAE2D0", lab: {L: 88, a: 6, b: 14}, undertone: "neutral", monkScale: 2 },
            { name: "Medium Brightening", code: "C03", hex: "#E8C8A8", lab: {L: 80, a: 10, b: 20}, undertone: "warm", monkScale: 3 },
            { name: "Golden Brightening", code: "C04", hex: "#D9B38C", lab: {L: 72, a: 12, b: 24}, undertone: "warm", monkScale: 4 },
            { name: "Honey Brightening", code: "C05", hex: "#CCA579", lab: {L: 68, a: 14, b: 26}, undertone: "neutral", monkScale: 5 },
            { name: "Caramel Brightening", code: "C06", hex: "#C19770", lab: {L: 64, a: 15, b: 24}, undertone: "warm", monkScale: 6 },
            { name: "Bronze Brightening", code: "C07", hex: "#A77B5F", lab: {L: 56, a: 16, b: 21}, undertone: "cool", monkScale: 7 },
            { name: "Chestnut Brightening", code: "C08", hex: "#91654E", lab: {L: 48, a: 15, b: 19}, undertone: "neutral", monkScale: 8 },
            { name: "Espresso Brightening", code: "C09", hex: "#754939", lab: {L: 36, a: 13, b: 15}, undertone: "warm", monkScale: 9 },
            { name: "Ebony Brightening", code: "C10", hex: "#5E3A2C", lab: {L: 28, a: 11, b: 12}, undertone: "neutral", monkScale: 10 }
        ],
        lipstick: [
            // Complementary lip colors for different skin tones
            { name: "Pink Petal", code: "LP01", hex: "#FFB6C1", lab: {L: 80, a: 25, b: 5}, undertone: "cool", monkScale: 1 },
            { name: "Rose Nude", code: "LP02", hex: "#C08081", lab: {L: 60, a: 20, b: 10}, undertone: "neutral", monkScale: 3 },
            { name: "Mauve Magic", code: "LP03", hex: "#A06B70", lab: {L: 50, a: 18, b: 8}, undertone: "cool", monkScale: 5 },
            { name: "Berry Beautiful", code: "LP04", hex: "#8B4958", lab: {L: 40, a: 22, b: 6}, undertone: "cool", monkScale: 7 },
            { name: "Wine Divine", code: "LP05", hex: "#722F37", lab: {L: 30, a: 20, b: 10}, undertone: "neutral", monkScale: 9 },
            { name: "Coral Crush", code: "LP06", hex: "#FF7F50", lab: {L: 65, a: 35, b: 30}, undertone: "warm", monkScale: 2 },
            { name: "Peach Perfect", code: "LP07", hex: "#FFAB91", lab: {L: 75, a: 20, b: 20}, undertone: "warm", monkScale: 4 },
            { name: "Terracotta Dream", code: "LP08", hex: "#CC6A52", lab: {L: 55, a: 25, b: 22}, undertone: "warm", monkScale: 6 },
            { name: "Brick Beautiful", code: "LP09", hex: "#A0522D", lab: {L: 45, a: 22, b: 25}, undertone: "warm", monkScale: 8 },
            { name: "Chocolate Kiss", code: "LP10", hex: "#7B3F00", lab: {L: 35, a: 18, b: 28}, undertone: "neutral", monkScale: 10 }
        ],
        blush: [
            // Natural flush colors for different skin tones
            { name: "Baby Pink", code: "B01", hex: "#FFE0EC", lab: {L: 90, a: 15, b: 2}, undertone: "cool", monkScale: 1 },
            { name: "Soft Rose", code: "B02", hex: "#F5B7C5", lab: {L: 78, a: 20, b: 5}, undertone: "cool", monkScale: 3 },
            { name: "Dusty Pink", code: "B03", hex: "#D49BA2", lab: {L: 68, a: 18, b: 8}, undertone: "neutral", monkScale: 5 },
            { name: "Plum Pop", code: "B04", hex: "#A0677C", lab: {L: 50, a: 22, b: 4}, undertone: "cool", monkScale: 7 },
            { name: "Berry Flush", code: "B05", hex: "#7E4257", lab: {L: 35, a: 25, b: 2}, undertone: "cool", monkScale: 9 },
            { name: "Peach Glow", code: "B06", hex: "#FFCDB2", lab: {L: 85, a: 12, b: 15}, undertone: "warm", monkScale: 2 },
            { name: "Apricot Dream", code: "B07", hex: "#E5A385", lab: {L: 72, a: 18, b: 20}, undertone: "warm", monkScale: 4 },
            { name: "Coral Reef", code: "B08", hex: "#C07B68", lab: {L: 58, a: 22, b: 18}, undertone: "warm", monkScale: 6 }
        ],
        bronzer: [
            // Contouring shades 2-3 tones darker
            { name: "Sun-Kissed", code: "BR01", hex: "#E8C39E", lab: {L: 76, a: 11, b: 20}, undertone: "warm", monkScale: 3 },
            { name: "Golden Hour", code: "BR02", hex: "#D4A574", lab: {L: 68, a: 14, b: 28}, undertone: "warm", monkScale: 5 },
            { name: "Summer Bronze", code: "BR03", hex: "#BD8B60", lab: {L: 60, a: 16, b: 25}, undertone: "neutral", monkScale: 7 },
            { name: "Deep Bronze", code: "BR04", hex: "#996650", lab: {L: 48, a: 17, b: 20}, undertone: "warm", monkScale: 8 },
            { name: "Rich Cocoa", code: "BR05", hex: "#6B3E2E", lab: {L: 32, a: 14, b: 16}, undertone: "neutral", monkScale: 10 }
        ]
    };
    
    return shades;
}

// Generate product catalog
function generateProductCatalog() {
    const shadeData = generateShadeData();
    const products = [];
    
    // Foundation products
    const foundationBrands = [
        { name: "Pippa of London", prefix: "PL" },
        { name: "Luxury Beauty Co", prefix: "LB" },
        { name: "Natural Glow", prefix: "NG" }
    ];
    
    foundationBrands.forEach((brand, brandIndex) => {
        products.push({
            productId: `found-${brandIndex + 1}`,
            name: `${brand.prefix} Flawless Foundation`,
            brand: brand.name,
            category: "foundation",
            subcategory: "liquid",
            description: "Full coverage liquid foundation with 24-hour wear",
            price: 35.00 + (brandIndex * 10),
            currency: "GBP",
            shades: shadeData.foundation.map((shade, index) => ({
                shadeId: `found-${brandIndex + 1}-${index + 1}`,
                name: shade.name,
                code: shade.code,
                hexColor: shade.hex,
                undertone: shade.undertone,
                coverage: "full",
                deltaE: shade.lab,
                lab: shade.lab,
                fitzpatrickScale: Math.ceil(shade.monkScale / 2),
                monkScale: shade.monkScale,
                inStock: Math.random() > 0.1,
                popularity: Math.random() * 10
            })),
            features: ["long-wearing", "buildable", "non-comedogenic"],
            skinTypes: ["all", "dry", "oily", "combination"],
            ingredients: ["water", "dimethicone", "titanium dioxide"],
            images: {
                main: "foundation-main.jpg",
                swatch: "foundation-swatch.jpg",
                lifestyle: "foundation-lifestyle.jpg"
            },
            createdAt: new Date().toISOString(),
            isActive: true
        });
    });
    
    // Concealer products
    products.push({
        productId: "conc-001",
        name: "Perfect Coverage Concealer",
        brand: "Pippa of London",
        category: "concealer",
        subcategory: "liquid",
        description: "Brightening concealer for under-eye and blemishes",
        price: 25.00,
        currency: "GBP",
        shades: shadeData.concealer.map((shade, index) => ({
            shadeId: `conc-001-${index + 1}`,
            name: shade.name,
            code: shade.code,
            hexColor: shade.hex,
            undertone: shade.undertone,
            coverage: "full",
            deltaE: shade.lab,
            lab: shade.lab,
            fitzpatrickScale: Math.ceil(shade.monkScale / 2),
            monkScale: shade.monkScale,
            inStock: true,
            popularity: Math.random() * 10
        })),
        features: ["brightening", "long-wearing", "crease-resistant"],
        skinTypes: ["all"],
        ingredients: ["water", "cyclopentasiloxane", "vitamin E"],
        images: {
            main: "concealer-main.jpg",
            swatch: "concealer-swatch.jpg",
            lifestyle: "concealer-lifestyle.jpg"
        },
        createdAt: new Date().toISOString(),
        isActive: true
    });
    
    // Lipstick products
    products.push({
        productId: "lip-001",
        name: "Velvet Matte Lipstick",
        brand: "Pippa of London",
        category: "lipstick",
        subcategory: "matte",
        description: "Long-wearing matte lipstick with intense color payoff",
        price: 22.00,
        currency: "GBP",
        shades: shadeData.lipstick.map((shade, index) => ({
            shadeId: `lip-001-${index + 1}`,
            name: shade.name,
            code: shade.code,
            hexColor: shade.hex,
            undertone: shade.undertone,
            finish: "matte",
            deltaE: shade.lab,
            lab: shade.lab,
            monkScale: shade.monkScale,
            inStock: true,
            popularity: Math.random() * 10
        })),
        features: ["long-wearing", "non-drying", "intense color"],
        ingredients: ["isododecane", "dimethicone", "pigments"],
        images: {
            main: "lipstick-main.jpg",
            swatch: "lipstick-swatch.jpg",
            lifestyle: "lipstick-lifestyle.jpg"
        },
        createdAt: new Date().toISOString(),
        isActive: true
    });
    
    // Blush products
    products.push({
        productId: "blush-001",
        name: "Natural Glow Blush",
        brand: "Pippa of London",
        category: "blush",
        subcategory: "powder",
        description: "Silky powder blush for a natural flush of color",
        price: 18.00,
        currency: "GBP",
        shades: shadeData.blush.map((shade, index) => ({
            shadeId: `blush-001-${index + 1}`,
            name: shade.name,
            code: shade.code,
            hexColor: shade.hex,
            undertone: shade.undertone,
            finish: "satin",
            deltaE: shade.lab,
            lab: shade.lab,
            monkScale: shade.monkScale,
            inStock: true,
            popularity: Math.random() * 10
        })),
        features: ["buildable", "long-wearing", "natural finish"],
        ingredients: ["talc", "mica", "silica"],
        images: {
            main: "blush-main.jpg",
            swatch: "blush-swatch.jpg",
            lifestyle: "blush-lifestyle.jpg"
        },
        createdAt: new Date().toISOString(),
        isActive: true
    });
    
    // Bronzer products
    products.push({
        productId: "bronz-001",
        name: "Sun-Kissed Bronzer",
        brand: "Pippa of London",
        category: "bronzer",
        subcategory: "powder",
        description: "Matte bronzer for natural contouring and warmth",
        price: 20.00,
        currency: "GBP",
        shades: shadeData.bronzer.map((shade, index) => ({
            shadeId: `bronz-001-${index + 1}`,
            name: shade.name,
            code: shade.code,
            hexColor: shade.hex,
            undertone: shade.undertone,
            finish: "matte",
            deltaE: shade.lab,
            lab: shade.lab,
            monkScale: shade.monkScale,
            inStock: true,
            popularity: Math.random() * 10
        })),
        features: ["buildable", "natural finish", "no orange tones"],
        ingredients: ["talc", "mica", "iron oxides"],
        images: {
            main: "bronzer-main.jpg",
            swatch: "bronzer-swatch.jpg",
            lifestyle: "bronzer-lifestyle.jpg"
        },
        createdAt: new Date().toISOString(),
        isActive: true
    });
    
    return products;
}

// Initialize product catalog
const productCatalog = generateProductCatalog();

// Export function to get product catalog
window.getProductCatalog = function() {
    return productCatalog;
};

// Additional helper functions for testing
window.getProductById = function(productId) {
    return productCatalog.find(p => p.productId === productId);
};

window.getShadeById = function(shadeId) {
    for (const product of productCatalog) {
        const shade = product.shades.find(s => s.shadeId === shadeId);
        if (shade) {
            return {
                ...shade,
                productId: product.productId,
                productName: product.name,
                category: product.category
            };
        }
    }
    return null;
};

console.log(`Sample product database loaded: ${productCatalog.length} products, ${productCatalog.reduce((sum, p) => sum + p.shades.length, 0)} total shades`);