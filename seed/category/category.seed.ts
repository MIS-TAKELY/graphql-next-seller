// prisma/seed/categories.ts

import { prisma } from "@/lib/db/prisma";

async function seedCategories() {
  console.log('🌱 Seeding categories...');

  // 1. ELECTRONICS
  const electronics = await prisma.category.create({
    data: {
      name: 'Electronics',
      slug: 'electronics',
      description: 'Electronic devices, gadgets, and accessories',
      isActive: true,
      categorySpecification: {
        create: [
          { key: 'brand', label: 'Brand', placeholder: 'e.g., Samsung, Apple, Sony' },
          { key: 'model', label: 'Model', placeholder: 'e.g., Model XYZ-123' },
          { key: 'warranty_period', label: 'Warranty Period', placeholder: 'e.g., 1 Year' },
          { key: 'color', label: 'Color', placeholder: 'e.g., Black, Silver, White' },
          { key: 'power_consumption', label: 'Power Consumption', placeholder: 'e.g., 100W' },
        ]
      },
      children: {
        create: [
          // 1.1 Mobile Phones & Accessories
          {
            name: 'Mobile Phones & Accessories',
            slug: 'mobile-phones-accessories',
            description: 'Smartphones, feature phones and mobile accessories',
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Apple, Samsung, OnePlus, Xiaomi' },
                { key: 'model', label: 'Model', placeholder: 'e.g., iPhone 15 Pro, Galaxy S24' },
                { key: 'operating_system', label: 'Operating System', placeholder: 'e.g., Android 14, iOS 17' },
                { key: 'ram', label: 'RAM', placeholder: 'e.g., 6GB, 8GB, 12GB' },
                { key: 'storage', label: 'Internal Storage', placeholder: 'e.g., 128GB, 256GB, 512GB' },
                { key: 'display_size', label: 'Display Size', placeholder: 'e.g., 6.1 inches, 6.7 inches' },
                { key: 'display_type', label: 'Display Type', placeholder: 'e.g., AMOLED, LCD, OLED' },
                { key: 'resolution', label: 'Resolution', placeholder: 'e.g., 1080x2400, 1170x2532' },
                { key: 'refresh_rate', label: 'Refresh Rate', placeholder: 'e.g., 60Hz, 90Hz, 120Hz' },
                { key: 'processor', label: 'Processor', placeholder: 'e.g., Snapdragon 8 Gen 3, A17 Pro' },
                { key: 'rear_camera', label: 'Rear Camera', placeholder: 'e.g., 50MP + 12MP + 8MP' },
                { key: 'front_camera', label: 'Front Camera', placeholder: 'e.g., 12MP, 32MP' },
                { key: 'battery_capacity', label: 'Battery Capacity', placeholder: 'e.g., 5000mAh, 4500mAh' },
                { key: 'fast_charging', label: 'Fast Charging', placeholder: 'e.g., 65W, 30W, 20W' },
                { key: 'sim_type', label: 'SIM Type', placeholder: 'e.g., Dual SIM, eSIM' },
                { key: 'network', label: 'Network', placeholder: 'e.g., 4G, 5G' },
                { key: 'color', label: 'Color', placeholder: 'e.g., Black, White, Blue, Gold' },
                { key: 'weight', label: 'Weight', placeholder: 'e.g., 195g, 210g' },
                { key: 'warranty', label: 'Warranty', placeholder: 'e.g., 1 Year Manufacturer Warranty' },
              ]
            },
            children: {
              create: [
                { name: 'Smartphones', slug: 'smartphones', isActive: true },
                { name: 'Feature Phones', slug: 'feature-phones', isActive: true },
                { name: 'Mobile Cases & Covers', slug: 'mobile-cases-covers', isActive: true },
                { name: 'Screen Protectors', slug: 'screen-protectors', isActive: true },
                { name: 'Power Banks', slug: 'power-banks', isActive: true },
                { name: 'Chargers & Cables', slug: 'chargers-cables', isActive: true },
                { name: 'Mobile Holders & Stands', slug: 'mobile-holders-stands', isActive: true },
                { name: 'Bluetooth Headsets', slug: 'bluetooth-headsets', isActive: true },
                { name: 'Smartwatches & Wearables', slug: 'smartwatches-wearables', isActive: true },
              ]
            }
          },
          
          // 1.2 Computers & Laptops
          {
            name: 'Computers & Laptops',
            slug: 'computers-laptops',
            description: 'Laptops, desktops, and computer accessories',
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Dell, HP, Lenovo, Apple, Asus' },
                { key: 'model', label: 'Model', placeholder: 'e.g., MacBook Pro M3, ThinkPad X1' },
                { key: 'processor', label: 'Processor', placeholder: 'e.g., Intel Core i7 13th Gen, M3 Pro, AMD Ryzen 7' },
                { key: 'processor_generation', label: 'Processor Generation', placeholder: 'e.g., 13th Gen, 12th Gen' },
                { key: 'ram', label: 'RAM', placeholder: 'e.g., 8GB, 16GB, 32GB' },
                { key: 'ram_type', label: 'RAM Type', placeholder: 'e.g., DDR4, DDR5' },
                { key: 'storage', label: 'Storage', placeholder: 'e.g., 512GB SSD, 1TB SSD' },
                { key: 'storage_type', label: 'Storage Type', placeholder: 'e.g., SSD, HDD, NVMe SSD' },
                { key: 'graphics_card', label: 'Graphics Card', placeholder: 'e.g., NVIDIA RTX 4060, Intel Iris Xe, AMD Radeon' },
                { key: 'display_size', label: 'Display Size', placeholder: 'e.g., 13.3", 14", 15.6", 17"' },
                { key: 'resolution', label: 'Screen Resolution', placeholder: 'e.g., 1920x1080 FHD, 2560x1600 QHD' },
                { key: 'display_type', label: 'Display Type', placeholder: 'e.g., IPS, OLED, LED' },
                { key: 'operating_system', label: 'Operating System', placeholder: 'e.g., Windows 11, macOS, Ubuntu' },
                { key: 'touchscreen', label: 'Touchscreen', placeholder: 'Yes/No' },
                { key: 'backlit_keyboard', label: 'Backlit Keyboard', placeholder: 'Yes/No' },
                { key: 'battery_backup', label: 'Battery Backup', placeholder: 'e.g., Up to 10 hours, 15 hours' },
                { key: 'ports', label: 'Ports', placeholder: 'e.g., USB-C, HDMI, Thunderbolt 4' },
                { key: 'weight', label: 'Weight', placeholder: 'e.g., 1.5kg, 2.2kg' },
                { key: 'color', label: 'Color', placeholder: 'e.g., Silver, Black, Space Grey' },
                { key: 'warranty', label: 'Warranty', placeholder: 'e.g., 1 Year, 3 Years' },
              ]
            },
            children: {
              create: [
                { name: 'Laptops', slug: 'laptops', isActive: true },
                { name: 'Desktops', slug: 'desktops', isActive: true },
                { name: 'Monitors', slug: 'monitors', isActive: true },
                { name: 'Keyboards & Mice', slug: 'keyboards-mice', isActive: true },
                { name: 'Printers & Scanners', slug: 'printers-scanners', isActive: true },
                { name: 'Storage Devices', slug: 'storage-devices', description: 'HDD, SSD, USB drives', isActive: true },
                { name: 'Networking', slug: 'networking', description: 'Routers, Modems', isActive: true },
                { name: 'Laptop Bags & Sleeves', slug: 'laptop-bags-sleeves', isActive: true },
              ]
            }
          },
          
          // 1.3 TVs & Home Entertainment
          {
            name: 'TVs & Home Entertainment',
            slug: 'tvs-home-entertainment',
            description: 'Televisions and home entertainment systems',
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Samsung, LG, Sony, Mi' },
                { key: 'model', label: 'Model', placeholder: 'e.g., QLED Q80C, OLED C3' },
                { key: 'screen_size', label: 'Screen Size', placeholder: 'e.g., 32", 43", 55", 65", 75"' },
                { key: 'display_type', label: 'Display Type', placeholder: 'e.g., QLED, OLED, LED, LCD' },
                { key: 'resolution', label: 'Resolution', placeholder: 'e.g., 4K Ultra HD, Full HD, 8K' },
                { key: 'refresh_rate', label: 'Refresh Rate', placeholder: 'e.g., 60Hz, 120Hz, 144Hz' },
                { key: 'hdr', label: 'HDR Support', placeholder: 'e.g., HDR10, Dolby Vision, HDR10+' },
                { key: 'smart_tv', label: 'Smart TV', placeholder: 'Yes/No' },
                { key: 'operating_system', label: 'OS', placeholder: 'e.g., Android TV, webOS, Tizen' },
                { key: 'sound_output', label: 'Sound Output', placeholder: 'e.g., 20W, 40W, 60W' },
                { key: 'audio_technology', label: 'Audio Technology', placeholder: 'e.g., Dolby Atmos, DTS:X' },
                { key: 'hdmi_ports', label: 'HDMI Ports', placeholder: 'e.g., 3 HDMI, 4 HDMI' },
                { key: 'usb_ports', label: 'USB Ports', placeholder: 'e.g., 2 USB' },
                { key: 'wifi', label: 'WiFi', placeholder: 'e.g., Yes (Built-in), No' },
                { key: 'bluetooth', label: 'Bluetooth', placeholder: 'e.g., Yes, No' },
                { key: 'voice_assistant', label: 'Voice Assistant', placeholder: 'e.g., Google Assistant, Alexa, Bixby' },
                { key: 'warranty', label: 'Warranty', placeholder: 'e.g., 1 Year Comprehensive' },
              ]
            },
            children: {
              create: [
                { name: 'Smart TVs', slug: 'smart-tvs', isActive: true },
                { name: 'LED/LCD TVs', slug: 'led-lcd-tvs', isActive: true },
                { name: 'Home Theater Systems', slug: 'home-theater-systems', isActive: true },
                { name: 'Soundbars', slug: 'soundbars', isActive: true },
                { name: 'Streaming Devices', slug: 'streaming-devices', description: 'Fire Stick, Roku', isActive: true },
                { name: 'TV Mounts & Stands', slug: 'tv-mounts-stands', isActive: true },
              ]
            }
          },
          
          // 1.4 Cameras & Photography
          {
            name: 'Cameras & Photography',
            slug: 'cameras-photography',
            description: 'Cameras and photography equipment',
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Canon, Nikon, Sony, GoPro' },
                { key: 'model', label: 'Model', placeholder: 'e.g., EOS R6 Mark II, A7 IV' },
                { key: 'camera_type', label: 'Camera Type', placeholder: 'e.g., DSLR, Mirrorless, Action Camera' },
                { key: 'megapixels', label: 'Megapixels', placeholder: 'e.g., 24MP, 45MP, 61MP' },
                { key: 'sensor_type', label: 'Sensor Type', placeholder: 'e.g., Full Frame, APS-C, Micro Four Thirds' },
                { key: 'sensor_size', label: 'Sensor Size', placeholder: 'e.g., 35.9 x 24.0mm' },
                { key: 'iso_range', label: 'ISO Range', placeholder: 'e.g., 100-51200' },
                { key: 'video_resolution', label: 'Video Resolution', placeholder: 'e.g., 4K 60fps, 8K 30fps' },
                { key: 'autofocus_points', label: 'Autofocus Points', placeholder: 'e.g., 693 Phase Detection' },
                { key: 'continuous_shooting', label: 'Continuous Shooting', placeholder: 'e.g., 12 fps, 20 fps' },
                { key: 'viewfinder', label: 'Viewfinder', placeholder: 'e.g., Electronic, Optical' },
                { key: 'screen_size', label: 'LCD Screen Size', placeholder: 'e.g., 3.0", 3.2"' },
                { key: 'battery_life', label: 'Battery Life', placeholder: 'e.g., 380 shots, 520 shots' },
                { key: 'connectivity', label: 'Connectivity', placeholder: 'e.g., WiFi, Bluetooth, NFC' },
                { key: 'waterproof', label: 'Waterproof', placeholder: 'e.g., Yes (10m), No' },
                { key: 'warranty', label: 'Warranty', placeholder: 'e.g., 1 Year International' },
              ]
            },
            children: {
              create: [
                { name: 'DSLR & Mirrorless Cameras', slug: 'dslr-mirrorless-cameras', isActive: true },
                { name: 'Action Cameras', slug: 'action-cameras', isActive: true },
                { name: 'Camera Lenses', slug: 'camera-lenses', isActive: true },
                { name: 'Tripods & Stands', slug: 'tripods-stands', isActive: true },
                { name: 'Memory Cards', slug: 'memory-cards', isActive: true },
                { name: 'Camera Bags', slug: 'camera-bags', isActive: true },
              ]
            }
          },
          
          // 1.5 Audio & Headphones
          {
            name: 'Audio & Headphones',
            slug: 'audio-headphones',
            description: 'Audio devices and headphones',
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Sony, Bose, JBL, Sennheiser' },
                { key: 'model', label: 'Model', placeholder: 'e.g., WH-1000XM5, QuietComfort 45' },
                { key: 'headphone_type', label: 'Type', placeholder: 'e.g., Over-Ear, In-Ear, On-Ear' },
                { key: 'connectivity', label: 'Connectivity', placeholder: 'e.g., Bluetooth 5.3, Wired, Wireless' },
                { key: 'driver_size', label: 'Driver Size', placeholder: 'e.g., 40mm, 10mm' },
                { key: 'frequency_response', label: 'Frequency Response', placeholder: 'e.g., 20Hz-20kHz' },
                { key: 'impedance', label: 'Impedance', placeholder: 'e.g., 32 Ohms' },
                { key: 'anc', label: 'Active Noise Cancellation', placeholder: 'Yes/No' },
                { key: 'battery_life', label: 'Battery Life', placeholder: 'e.g., 30 hours, 40 hours' },
                { key: 'charging_time', label: 'Charging Time', placeholder: 'e.g., 2 hours, 3 hours' },
                { key: 'quick_charge', label: 'Quick Charge', placeholder: 'e.g., 10 min = 5 hours' },
                { key: 'water_resistance', label: 'Water Resistance', placeholder: 'e.g., IPX4, IPX7' },
                { key: 'microphone', label: 'Built-in Microphone', placeholder: 'Yes/No' },
                { key: 'voice_assistant', label: 'Voice Assistant', placeholder: 'e.g., Alexa, Google Assistant' },
                { key: 'color', label: 'Color', placeholder: 'e.g., Black, White, Silver' },
                { key: 'warranty', label: 'Warranty', placeholder: 'e.g., 1 Year' },
              ]
            },
            children: {
              create: [
                { name: 'Wireless Earbuds', slug: 'wireless-earbuds', isActive: true },
                { name: 'Over-Ear Headphones', slug: 'over-ear-headphones', isActive: true },
                { name: 'Earphones', slug: 'earphones', isActive: true },
                { name: 'Speakers', slug: 'speakers', description: 'Bluetooth, Smart speakers', isActive: true },
                { name: 'Sound Systems', slug: 'sound-systems', isActive: true },
              ]
            }
          },
          
          // 1.6 Gaming
          {
            name: 'Gaming',
            slug: 'gaming',
            description: 'Gaming consoles, PCs, and accessories',
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Sony, Microsoft, Nintendo, Razer' },
                { key: 'model', label: 'Model', placeholder: 'e.g., PlayStation 5, Xbox Series X' },
                { key: 'console_type', label: 'Console Type', placeholder: 'e.g., Home Console, Handheld' },
                { key: 'storage', label: 'Storage', placeholder: 'e.g., 512GB, 1TB' },
                { key: 'resolution', label: 'Max Resolution', placeholder: 'e.g., 4K, 8K' },
                { key: 'frame_rate', label: 'Max Frame Rate', placeholder: 'e.g., 60fps, 120fps' },
                { key: 'ray_tracing', label: 'Ray Tracing', placeholder: 'Yes/No' },
                { key: 'backward_compatible', label: 'Backward Compatible', placeholder: 'Yes/No' },
                { key: 'vr_support', label: 'VR Support', placeholder: 'Yes/No' },
                { key: 'online_service', label: 'Online Service', placeholder: 'e.g., PlayStation Plus, Xbox Live' },
                { key: 'included_accessories', label: 'Included Accessories', placeholder: 'e.g., 1 Controller, HDMI Cable' },
                { key: 'warranty', label: 'Warranty', placeholder: 'e.g., 1 Year' },
              ]
            },
            children: {
              create: [
                { name: 'Gaming Consoles', slug: 'gaming-consoles', description: 'PS5, Xbox, Nintendo', isActive: true },
                { name: 'Gaming Laptops & PCs', slug: 'gaming-laptops-pcs', isActive: true },
                { name: 'Gaming Accessories', slug: 'gaming-accessories', description: 'Controllers, Keyboards', isActive: true },
                { name: 'VR Headsets', slug: 'vr-headsets', isActive: true },
                { name: 'Game CDs & Digital Codes', slug: 'game-cds-digital-codes', isActive: true },
              ]
            }
          },
        ]
      }
    }
  });

  // 2. FASHION & APPAREL
  const fashion = await prisma.category.create({
    data: {
      name: 'Fashion & Apparel',
      slug: 'fashion-apparel',
      description: 'Clothing, footwear, watches, and accessories',
      isActive: true,
      categorySpecification: {
        create: [
          { key: 'brand', label: 'Brand', placeholder: 'e.g., Nike, Adidas, Zara' },
          { key: 'size', label: 'Size', placeholder: 'e.g., S, M, L, XL' },
          { key: 'color', label: 'Color', placeholder: 'e.g., Black, Blue, Red' },
          { key: 'material', label: 'Material', placeholder: 'e.g., Cotton, Polyester' },
        ]
      },
      children: {
        create: [
          // 2.1 Men's Fashion
          {
            name: "Men's Fashion",
            slug: 'mens-fashion',
            description: "Men's clothing and accessories",
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Nike, Adidas, H&M, Levi\'s' },
                { key: 'size', label: 'Size', placeholder: 'e.g., S, M, L, XL, XXL, 3XL' },
                { key: 'fit', label: 'Fit', placeholder: 'e.g., Slim Fit, Regular Fit, Relaxed Fit' },
                { key: 'color', label: 'Color', placeholder: 'e.g., Black, Navy, White, Grey' },
                { key: 'material', label: 'Material', placeholder: 'e.g., 100% Cotton, Cotton Blend, Denim' },
                { key: 'pattern', label: 'Pattern', placeholder: 'e.g., Solid, Striped, Checked, Printed' },
                { key: 'sleeve_length', label: 'Sleeve Length', placeholder: 'e.g., Full Sleeve, Half Sleeve, Sleeveless' },
                { key: 'neck_type', label: 'Neck Type', placeholder: 'e.g., Round Neck, V-Neck, Collar, Polo' },
                { key: 'occasion', label: 'Occasion', placeholder: 'e.g., Casual, Formal, Party, Sports' },
                { key: 'season', label: 'Season', placeholder: 'e.g., Summer, Winter, All Season' },
                { key: 'waist_size', label: 'Waist Size (Pants)', placeholder: 'e.g., 30, 32, 34, 36 inches' },
                { key: 'length', label: 'Length (Pants)', placeholder: 'e.g., 30, 32, 34 inches' },
                { key: 'care_instructions', label: 'Care Instructions', placeholder: 'e.g., Machine Wash Cold' },
                { key: 'country_of_origin', label: 'Country of Origin', placeholder: 'e.g., India, Bangladesh' },
              ]
            },
            children: {
              create: [
                { name: 'T-Shirts & Polos', slug: 'mens-tshirts-polos', isActive: true },
                { name: 'Shirts', slug: 'mens-shirts', isActive: true },
                { name: 'Jeans & Trousers', slug: 'mens-jeans-trousers', isActive: true },
                { name: 'Ethnic Wear', slug: 'mens-ethnic-wear', description: 'Kurta, Sherwani', isActive: true },
                { name: 'Suits & Blazers', slug: 'mens-suits-blazers', isActive: true },
                { name: 'Innerwear & Sleepwear', slug: 'mens-innerwear-sleepwear', isActive: true },
                { name: 'Watches & Accessories', slug: 'mens-watches-accessories', isActive: true },
              ]
            }
          },
          
          // 2.2 Women's Fashion
          {
            name: "Women's Fashion",
            slug: 'womens-fashion',
            description: "Women's clothing and accessories",
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Zara, H&M, Forever 21, Max' },
                { key: 'size', label: 'Size', placeholder: 'e.g., XS, S, M, L, XL, XXL' },
                { key: 'fit', label: 'Fit', placeholder: 'e.g., Regular Fit, Slim Fit, Loose Fit, A-Line' },
                { key: 'color', label: 'Color', placeholder: 'e.g., Black, Pink, Red, White, Floral' },
                { key: 'material', label: 'Material', placeholder: 'e.g., Cotton, Silk, Chiffon, Polyester' },
                { key: 'pattern', label: 'Pattern', placeholder: 'e.g., Solid, Printed, Embroidered, Floral' },
                { key: 'sleeve_length', label: 'Sleeve Length', placeholder: 'e.g., Full, 3/4th, Short, Sleeveless' },
                { key: 'neck_type', label: 'Neck Type', placeholder: 'e.g., Round, V-Neck, Boat, Square' },
                { key: 'dress_length', label: 'Dress Length', placeholder: 'e.g., Mini, Midi, Maxi, Knee Length' },
                { key: 'occasion', label: 'Occasion', placeholder: 'e.g., Casual, Formal, Party, Wedding' },
                { key: 'season', label: 'Season', placeholder: 'e.g., Summer, Winter, Monsoon, All Season' },
                { key: 'closure', label: 'Closure', placeholder: 'e.g., Button, Zipper, Pull-on, Drawstring' },
                { key: 'dupatta_included', label: 'Dupatta Included', placeholder: 'Yes/No (for ethnic wear)' },
                { key: 'care_instructions', label: 'Care Instructions', placeholder: 'e.g., Dry Clean Only, Hand Wash' },
                { key: 'country_of_origin', label: 'Country of Origin', placeholder: 'e.g., India' },
              ]
            },
            children: {
              create: [
                { name: 'Tops & Tees', slug: 'womens-tops-tees', isActive: true },
                { name: 'Dresses & Gowns', slug: 'womens-dresses-gowns', isActive: true },
                { name: 'Sarees & Ethnic Wear', slug: 'womens-sarees-ethnic-wear', isActive: true },
                { name: 'Jeans & Leggings', slug: 'womens-jeans-leggings', isActive: true },
                { name: 'Lingerie & Sleepwear', slug: 'womens-lingerie-sleepwear', isActive: true },
                { name: 'Handbags & Clutches', slug: 'womens-handbags-clutches', isActive: true },
                { name: 'Jewelry & Accessories', slug: 'womens-jewelry-accessories', isActive: true },
              ]
            }
          },
          
          // 2.3 Kids & Infant Wear
          {
            name: 'Kids & Infant Wear',
            slug: 'kids-infant-wear',
            description: "Children's clothing and accessories",
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Hopscotch, FirstCry, Carter\'s' },
                { key: 'age_group', label: 'Age Group', placeholder: 'e.g., 0-6 months, 1-2 years, 3-5 years' },
                { key: 'size', label: 'Size', placeholder: 'e.g., 0-3M, 6M, 12M, 2T, 4T, 6Y, 8Y' },
                { key: 'gender', label: 'Gender', placeholder: 'e.g., Boys, Girls, Unisex' },
                { key: 'color', label: 'Color', placeholder: 'e.g., Pink, Blue, Yellow, Multicolor' },
                { key: 'material', label: 'Material', placeholder: 'e.g., 100% Cotton, Organic Cotton' },
                { key: 'pattern', label: 'Pattern', placeholder: 'e.g., Cartoon, Animal Print, Solid' },
                { key: 'sleeve_length', label: 'Sleeve Length', placeholder: 'e.g., Full, Half, Sleeveless' },
                { key: 'closure', label: 'Closure', placeholder: 'e.g., Snap Buttons, Zipper, Elastic' },
                { key: 'safety_certified', label: 'Safety Certified', placeholder: 'Yes/No' },
                { key: 'care_instructions', label: 'Care Instructions', placeholder: 'e.g., Machine Wash Gentle' },
              ]
            },
            children: {
              create: [
                { name: 'Boys Clothing', slug: 'boys-clothing', isActive: true },
                { name: "Girls' Clothing", slug: 'girls-clothing', isActive: true },
                { name: 'Baby Care', slug: 'baby-care', description: 'Diapers, Wipes', isActive: true },
                { name: "Kids' Footwear", slug: 'kids-footwear', isActive: true },
              ]
            }
          },
          
          // 2.4 Footwear
          {
            name: 'Footwear',
            slug: 'footwear',
            description: 'Shoes, sandals, and footwear accessories',
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Nike, Adidas, Puma, Bata' },
                { key: 'size', label: 'Size', placeholder: 'e.g., UK 6, UK 7, UK 8, UK 9, UK 10' },
                { key: 'gender', label: 'Gender', placeholder: 'e.g., Men, Women, Unisex' },
                { key: 'color', label: 'Color', placeholder: 'e.g., Black, White, Brown, Blue' },
                { key: 'material', label: 'Material', placeholder: 'e.g., Leather, Synthetic, Mesh, Canvas' },
                { key: 'sole_material', label: 'Sole Material', placeholder: 'e.g., Rubber, EVA, PU' },
                { key: 'closure', label: 'Closure', placeholder: 'e.g., Lace-up, Velcro, Slip-on, Buckle' },
                { key: 'toe_style', label: 'Toe Style', placeholder: 'e.g., Round Toe, Pointed, Open Toe' },
                { key: 'heel_height', label: 'Heel Height', placeholder: 'e.g., Flat, 1", 2", 3"' },
                { key: 'occasion', label: 'Occasion', placeholder: 'e.g., Casual, Sports, Formal, Party' },
                { key: 'waterproof', label: 'Waterproof', placeholder: 'Yes/No' },
                { key: 'cushioning', label: 'Cushioning', placeholder: 'e.g., Memory Foam, Air Cushion' },
                { key: 'care_instructions', label: 'Care Instructions', placeholder: 'e.g., Wipe with dry cloth' },
              ]
            },
            children: {
              create: [
                { name: 'Sports Shoes', slug: 'sports-shoes', isActive: true },
                { name: 'Casual Shoes', slug: 'casual-shoes', isActive: true },
                { name: 'Sandals & Flip-Flops', slug: 'sandals-flip-flops', isActive: true },
                { name: 'Formal Shoes', slug: 'formal-shoes', isActive: true },
                { name: 'Sneakers', slug: 'sneakers', isActive: true },
              ]
            }
          },
          
          // 2.5 Watches & Jewelry
          {
            name: 'Watches & Jewelry',
            slug: 'watches-jewelry',
            description: 'Watches and jewelry items',
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Rolex, Titan, Fossil, Tanishq' },
                { key: 'type', label: 'Type', placeholder: 'e.g., Analog, Digital, Smartwatch, Ring, Necklace' },
                { key: 'gender', label: 'Gender', placeholder: 'e.g., Men, Women, Unisex' },
                { key: 'material', label: 'Material', placeholder: 'e.g., Gold, Silver, Platinum, Stainless Steel' },
                { key: 'strap_material', label: 'Strap Material (Watch)', placeholder: 'e.g., Leather, Metal, Silicone' },
                { key: 'dial_color', label: 'Dial Color (Watch)', placeholder: 'e.g., Black, White, Blue' },
                { key: 'movement', label: 'Movement (Watch)', placeholder: 'e.g., Quartz, Automatic, Manual' },
                { key: 'water_resistance', label: 'Water Resistance', placeholder: 'e.g., 30m, 50m, 100m' },
                { key: 'gemstone', label: 'Gemstone', placeholder: 'e.g., Diamond, Ruby, Emerald, None' },
                { key: 'purity', label: 'Purity (Jewelry)', placeholder: 'e.g., 18K, 22K, 24K, 925 Silver' },
                { key: 'weight', label: 'Weight', placeholder: 'e.g., 5 grams, 10 grams' },
                { key: 'warranty', label: 'Warranty', placeholder: 'e.g., 1 Year, Lifetime' },
              ]
            },
            children: {
              create: [
                { name: "Men's Watches", slug: 'mens-watches', isActive: true },
                { name: "Women's Watches", slug: 'womens-watches', isActive: true },
                { name: 'Rings, Necklaces, Earrings', slug: 'rings-necklaces-earrings', isActive: true },
                { name: 'Luxury & Designer Jewelry', slug: 'luxury-designer-jewelry', isActive: true },
              ]
            }
          },
        ]
      }
    }
  });

  // 3. HOME & KITCHEN
  const homeKitchen = await prisma.category.create({
    data: {
      name: 'Home & Kitchen',
      slug: 'home-kitchen',
      description: 'Furniture, kitchen appliances, home decor, and more',
      isActive: true,
      categorySpecification: {
        create: [
          { key: 'brand', label: 'Brand', placeholder: 'e.g., Philips, Prestige, Bosch' },
          { key: 'material', label: 'Material', placeholder: 'e.g., Wood, Metal, Plastic' },
          { key: 'color', label: 'Color', placeholder: 'e.g., Brown, White, Black' },
          { key: 'warranty', label: 'Warranty', placeholder: 'e.g., 1 Year, 2 Years' },
        ]
      },
      children: {
        create: [
          // 3.1 Furniture
          {
            name: 'Furniture',
            slug: 'furniture',
            description: 'Home and office furniture',
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., IKEA, Urban Ladder, Godrej' },
                { key: 'material', label: 'Material', placeholder: 'e.g., Solid Wood, Engineered Wood, Metal' },
                { key: 'finish', label: 'Finish', placeholder: 'e.g., Matte, Glossy, Natural' },
                { key: 'color', label: 'Color', placeholder: 'e.g., Brown, Walnut, White, Black' },
                { key: 'dimensions', label: 'Dimensions (LxWxH)', placeholder: 'e.g., 200x100x75 cm' },
                { key: 'weight', label: 'Weight', placeholder: 'e.g., 50 kg' },
                { key: 'weight_capacity', label: 'Weight Capacity', placeholder: 'e.g., 150 kg' },
                { key: 'seating_capacity', label: 'Seating Capacity', placeholder: 'e.g., 3 Seater, 5 Seater' },
                { key: 'assembly_required', label: 'Assembly Required', placeholder: 'Yes/No' },
                { key: 'storage', label: 'Storage', placeholder: 'e.g., With Drawer, No Storage' },
                { key: 'style', label: 'Style', placeholder: 'e.g., Modern, Contemporary, Traditional' },
                { key: 'room_type', label: 'Room Type', placeholder: 'e.g., Living Room, Bedroom, Office' },
                { key: 'care_instructions', label: 'Care Instructions', placeholder: 'e.g., Wipe with dry cloth' },
                { key: 'warranty', label: 'Warranty', placeholder: 'e.g., 1 Year, 5 Years' },
              ]
            },
            children: {
              create: [
                { name: 'Sofas & Couches', slug: 'sofas-couches', isActive: true },
                { name: 'Beds & Mattresses', slug: 'beds-mattresses', isActive: true },
                { name: 'Dining Tables & Chairs', slug: 'dining-tables-chairs', isActive: true },
                { name: 'Wardrobes & Storage', slug: 'wardrobes-storage', isActive: true },
              ]
            }
          },
          
          // 3.2 Kitchen Appliances
          {
            name: 'Kitchen Appliances',
            slug: 'kitchen-appliances',
            description: 'Small and large kitchen appliances',
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Philips, Prestige, Bajaj, LG' },
                { key: 'model', label: 'Model', placeholder: 'e.g., HD9252/90' },
                { key: 'power', label: 'Power Consumption', placeholder: 'e.g., 1200W, 1500W' },
                { key: 'voltage', label: 'Voltage', placeholder: 'e.g., 220-240V' },
                { key: 'capacity', label: 'Capacity', placeholder: 'e.g., 5 Liters, 200 Liters, 1.5 Liters' },
                { key: 'speed_settings', label: 'Speed Settings', placeholder: 'e.g., 3 Speed, Variable Speed' },
                { key: 'material', label: 'Material', placeholder: 'e.g., Stainless Steel, Plastic, Glass' },
                { key: 'color', label: 'Color', placeholder: 'e.g., Black, Silver, White' },
                { key: 'special_features', label: 'Special Features', placeholder: 'e.g., Auto-off, Timer, Non-stick' },
                { key: 'energy_rating', label: 'Energy Rating', placeholder: 'e.g., 3 Star, 5 Star' },
                { key: 'dimensions', label: 'Dimensions', placeholder: 'e.g., 30x25x40 cm' },
                { key: 'weight', label: 'Weight', placeholder: 'e.g., 5 kg' },
                { key: 'warranty', label: 'Warranty', placeholder: 'e.g., 2 Years on Product' },
              ]
            },
            children: {
              create: [
                { name: 'Mixer Grinders', slug: 'mixer-grinders', isActive: true },
                { name: 'Air Fryers', slug: 'air-fryers', isActive: true },
                { name: 'Microwave Ovens', slug: 'microwave-ovens', isActive: true },
                { name: 'Refrigerators', slug: 'refrigerators', isActive: true },
                { name: 'Coffee Makers', slug: 'coffee-makers', isActive: true },
              ]
            }
          },
          
          // 3.3 Home Decor
          {
            name: 'Home Decor',
            slug: 'home-decor',
            description: 'Decorative items for home',
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Home Centre, Chumbak' },
                { key: 'material', label: 'Material', placeholder: 'e.g., Wood, Metal, Canvas, Glass, Ceramic' },
                { key: 'color', label: 'Color', placeholder: 'e.g., Gold, Silver, Multicolor' },
                { key: 'dimensions', label: 'Dimensions', placeholder: 'e.g., 30x40 cm' },
                { key: 'style', label: 'Style', placeholder: 'e.g., Modern, Vintage, Abstract, Traditional' },
                { key: 'theme', label: 'Theme', placeholder: 'e.g., Nature, Floral, Geometric' },
                { key: 'room_placement', label: 'Room Placement', placeholder: 'e.g., Living Room, Bedroom, Hallway' },
                { key: 'mounting', label: 'Mounting', placeholder: 'e.g., Wall Mount, Tabletop, Floor Standing' },
                { key: 'fragrance', label: 'Fragrance (Candles)', placeholder: 'e.g., Lavender, Vanilla, Rose' },
                { key: 'care_instructions', label: 'Care Instructions', placeholder: 'e.g., Wipe with soft cloth' },
              ]
            },
            children: {
              create: [
                { name: 'Wall Art & Paintings', slug: 'wall-art-paintings', isActive: true },
                { name: 'Clocks', slug: 'clocks', isActive: true },
                { name: 'Candles & Fragrances', slug: 'candles-fragrances', isActive: true },
                { name: 'Flower Vases', slug: 'flower-vases', isActive: true },
              ]
            }
          },
          
          // 3.4 Cookware & Dining
          {
            name: 'Cookware & Dining',
            slug: 'cookware-dining',
            description: 'Cooking and dining essentials',
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Prestige, Hawkins, Pigeon, Corelle' },
                { key: 'material', label: 'Material', placeholder: 'e.g., Stainless Steel, Non-stick, Aluminum, Ceramic' },
                { key: 'capacity', label: 'Capacity', placeholder: 'e.g., 2 Liters, 3 Liters, 5 Liters' },
                { key: 'pieces', label: 'Number of Pieces', placeholder: 'e.g., 3-Piece Set, 24-Piece Set' },
                { key: 'base_type', label: 'Base Type', placeholder: 'e.g., Induction Base, Gas Stove Compatible' },
                { key: 'coating', label: 'Coating', placeholder: 'e.g., Non-stick, Ceramic, Teflon' },
                { key: 'lid_included', label: 'Lid Included', placeholder: 'Yes/No' },
                { key: 'dishwasher_safe', label: 'Dishwasher Safe', placeholder: 'Yes/No' },
                { key: 'color', label: 'Color', placeholder: 'e.g., Black, Red, Silver' },
                { key: 'warranty', label: 'Warranty', placeholder: 'e.g., 1 Year, 5 Years' },
              ]
            },
            children: {
              create: [
                { name: 'Non-Stick Pans', slug: 'non-stick-pans', isActive: true },
                { name: 'Pressure Cookers', slug: 'pressure-cookers', isActive: true },
                { name: 'Cutlery Sets', slug: 'cutlery-sets', isActive: true },
                { name: 'Dinner Sets', slug: 'dinner-sets', isActive: true },
              ]
            }
          },
          
          // 3.5 Lighting
          {
            name: 'Lighting',
            slug: 'lighting',
            description: 'Indoor and outdoor lighting solutions',
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Philips, Syska, Wipro' },
                { key: 'light_type', label: 'Light Type', placeholder: 'e.g., LED, CFL, Halogen, Incandescent' },
                { key: 'wattage', label: 'Wattage', placeholder: 'e.g., 9W, 12W, 18W' },
                { key: 'color_temperature', label: 'Color Temperature', placeholder: 'e.g., Warm White (3000K), Cool White (6500K)' },
                { key: 'lumens', label: 'Lumens', placeholder: 'e.g., 800 lm, 1200 lm' },
                { key: 'base_type', label: 'Base Type', placeholder: 'e.g., B22, E27, GU10' },
                { key: 'dimmable', label: 'Dimmable', placeholder: 'Yes/No' },
                { key: 'smart_enabled', label: 'Smart Enabled', placeholder: 'e.g., WiFi, Bluetooth, No' },
                { key: 'material', label: 'Material', placeholder: 'e.g., Metal, Plastic, Glass' },
                { key: 'usage', label: 'Usage', placeholder: 'e.g., Indoor, Outdoor, Both' },
                { key: 'lifespan', label: 'Lifespan', placeholder: 'e.g., 15,000 hours, 25,000 hours' },
                { key: 'warranty', label: 'Warranty', placeholder: 'e.g., 1 Year, 2 Years' },
              ]
            },
            children: {
              create: [
                { name: 'LED Bulbs', slug: 'led-bulbs', isActive: true },
                { name: 'Table Lamps', slug: 'table-lamps', isActive: true },
                { name: 'Decorative Lights', slug: 'decorative-lights', isActive: true },
              ]
            }
          },
        ]
      }
    }
  });

  // 4. GROCERY & GOURMET
  const grocery = await prisma.category.create({
    data: {
      name: 'Grocery & Gourmet',
      slug: 'grocery-gourmet',
      description: 'Food, beverages, and gourmet products',
      isActive: true,
      categorySpecification: {
        create: [
          { key: 'brand', label: 'Brand', placeholder: 'e.g., Nestle, Amul, Britannia' },
          { key: 'weight', label: 'Weight/Volume', placeholder: 'e.g., 500g, 1L' },
          { key: 'vegetarian', label: 'Vegetarian', placeholder: 'Veg/Non-Veg' },
          { key: 'expiry_date', label: 'Best Before', placeholder: 'e.g., 6 months' },
        ]
      },
      children: {
        create: [
          { 
            name: 'Snacks & Beverages', 
            slug: 'snacks-beverages', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Lays, Pepsi, Coca-Cola' },
                { key: 'weight', label: 'Weight/Volume', placeholder: 'e.g., 200g, 500ml, 1L' },
                { key: 'flavor', label: 'Flavor', placeholder: 'e.g., Classic Salted, Masala, Cola' },
                { key: 'pack_type', label: 'Pack Type', placeholder: 'e.g., Bottle, Can, Pouch, Packet' },
                { key: 'vegetarian', label: 'Vegetarian', placeholder: 'Yes/No' },
                { key: 'sugar_content', label: 'Sugar Content', placeholder: 'e.g., Low Sugar, Zero Sugar, Regular' },
                { key: 'calories', label: 'Calories (per serving)', placeholder: 'e.g., 150 kcal' },
                { key: 'ingredients', label: 'Main Ingredients', placeholder: 'e.g., Potato, Salt, Oil' },
                { key: 'allergen_info', label: 'Allergen Info', placeholder: 'e.g., Contains nuts, gluten free' },
                { key: 'shelf_life', label: 'Shelf Life', placeholder: 'e.g., 6 months, 1 year' },
                { key: 'country_of_origin', label: 'Country of Origin', placeholder: 'e.g., India, USA' },
              ]
            }
          },
          { 
            name: 'Dairy Products', 
            slug: 'dairy-products', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Amul, Mother Dairy, Nestle' },
                { key: 'quantity', label: 'Quantity', placeholder: 'e.g., 500ml, 1L, 200g' },
                { key: 'fat_content', label: 'Fat Content', placeholder: 'e.g., Full Cream, Toned, Skimmed, Low Fat' },
                { key: 'type', label: 'Type', placeholder: 'e.g., Pasteurized, UHT, Organic' },
                { key: 'expiry', label: 'Best Before', placeholder: 'e.g., 3 days, 1 week' },
                { key: 'storage', label: 'Storage', placeholder: 'e.g., Refrigerate below 4°C' },
              ]
            }
          },
          { 
            name: 'Breakfast Cereals', 
            slug: 'breakfast-cereals', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Kellogg\'s, Quaker Oats' },
                { key: 'weight', label: 'Weight', placeholder: 'e.g., 500g, 1kg' },
                { key: 'flavor', label: 'Flavor', placeholder: 'e.g., Honey, Chocolate, Original' },
                { key: 'whole_grain', label: 'Whole Grain', placeholder: 'Yes/No' },
                { key: 'added_sugar', label: 'Added Sugar', placeholder: 'Yes/No' },
              ]
            }
          },
          { 
            name: 'Organic & Healthy Foods', 
            slug: 'organic-healthy-foods', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Organic India, 24 Mantra' },
                { key: 'certified_organic', label: 'Certified Organic', placeholder: 'Yes/No' },
                { key: 'certification', label: 'Certification', placeholder: 'e.g., USDA, India Organic' },
                { key: 'gmo_free', label: 'GMO Free', placeholder: 'Yes/No' },
                { key: 'gluten_free', label: 'Gluten Free', placeholder: 'Yes/No' },
              ]
            }
          },
          { 
            name: 'Tea & Coffee', 
            slug: 'tea-coffee', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Tata Tea, Nescafe, Starbucks' },
                { key: 'type', label: 'Type', placeholder: 'e.g., Black Tea, Green Tea, Instant Coffee' },
                { key: 'weight', label: 'Weight', placeholder: 'e.g., 250g, 500g, 1kg' },
                { key: 'caffeine', label: 'Caffeine', placeholder: 'e.g., Regular, Decaf' },
                { key: 'flavor', label: 'Flavor', placeholder: 'e.g., Masala, Cardamom, Vanilla' },
              ]
            }
          },
        ]
      }
    }
  });

  // 5. BEAUTY & PERSONAL CARE
  const beauty = await prisma.category.create({
    data: {
      name: 'Beauty & Personal Care',
      slug: 'beauty-personal-care',
      description: 'Skincare, haircare, makeup, and personal care products',
      isActive: true,
      categorySpecification: {
        create: [
          { key: 'brand', label: 'Brand', placeholder: 'e.g., Lakme, Maybelline, Dove' },
          { key: 'product_type', label: 'Product Type', placeholder: 'e.g., Cream, Lotion' },
          { key: 'skin_type', label: 'Skin Type', placeholder: 'e.g., Oily, Dry, All' },
        ]
      },
      children: {
        create: [
          { 
            name: 'Skincare', 
            slug: 'skincare', 
            description: 'Face Wash, Creams', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Cetaphil, Neutrogena, Plum' },
                { key: 'product_type', label: 'Product Type', placeholder: 'e.g., Face Wash, Serum, Moisturizer, Toner' },
                { key: 'skin_type', label: 'Skin Type', placeholder: 'e.g., Oily, Dry, Combination, Sensitive, All' },
                { key: 'concern', label: 'Skin Concern', placeholder: 'e.g., Acne, Anti-aging, Dark Spots, Hydration' },
                { key: 'key_ingredients', label: 'Key Ingredients', placeholder: 'e.g., Vitamin C, Retinol, Hyaluronic Acid' },
                { key: 'volume', label: 'Volume', placeholder: 'e.g., 50ml, 100ml, 200ml' },
                { key: 'spf', label: 'SPF', placeholder: 'e.g., SPF 30, SPF 50, No SPF' },
                { key: 'fragrance_free', label: 'Fragrance Free', placeholder: 'Yes/No' },
                { key: 'dermatologically_tested', label: 'Dermatologically Tested', placeholder: 'Yes/No' },
                { key: 'cruelty_free', label: 'Cruelty Free', placeholder: 'Yes/No' },
                { key: 'paraben_free', label: 'Paraben Free', placeholder: 'Yes/No' },
              ]
            }
          },
          { 
            name: 'Haircare', 
            slug: 'haircare', 
            description: 'Shampoo, Conditioners', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Pantene, Dove, L\'Oreal' },
                { key: 'product_type', label: 'Product Type', placeholder: 'e.g., Shampoo, Conditioner, Hair Oil, Serum' },
                { key: 'hair_type', label: 'Hair Type', placeholder: 'e.g., Dry, Oily, Normal, Colored' },
                { key: 'concern', label: 'Hair Concern', placeholder: 'e.g., Hair Fall, Dandruff, Damage Repair' },
                { key: 'key_ingredients', label: 'Key Ingredients', placeholder: 'e.g., Keratin, Argan Oil, Biotin' },
                { key: 'volume', label: 'Volume', placeholder: 'e.g., 200ml, 400ml, 1L' },
                { key: 'sulfate_free', label: 'Sulfate Free', placeholder: 'Yes/No' },
                { key: 'paraben_free', label: 'Paraben Free', placeholder: 'Yes/No' },
              ]
            }
          },
          { 
            name: 'Makeup', 
            slug: 'makeup', 
            description: 'Lipstick, Foundation', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Maybelline, MAC, Lakme' },
                { key: 'product_type', label: 'Product Type', placeholder: 'e.g., Lipstick, Foundation, Mascara, Eyeliner' },
                { key: 'shade', label: 'Shade/Color', placeholder: 'e.g., Ruby Red, Nude, Fair Beige' },
                { key: 'finish', label: 'Finish', placeholder: 'e.g., Matte, Glossy, Satin, Shimmer' },
                { key: 'coverage', label: 'Coverage', placeholder: 'e.g., Full, Medium, Light, Sheer' },
                { key: 'skin_tone', label: 'Skin Tone', placeholder: 'e.g., Fair, Medium, Olive, Dark' },
                { key: 'long_lasting', label: 'Long Lasting', placeholder: 'e.g., 12 hours, 24 hours' },
                { key: 'waterproof', label: 'Waterproof', placeholder: 'Yes/No' },
                { key: 'quantity', label: 'Quantity', placeholder: 'e.g., 4.5g, 30ml' },
              ]
            }
          },
          { 
            name: 'Perfumes & Deodorants', 
            slug: 'perfumes-deodorants', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Axe, Fogg, Bella Vita' },
                { key: 'type', label: 'Type', placeholder: 'e.g., Deodorant, Perfume, Body Spray' },
                { key: 'fragrance', label: 'Fragrance', placeholder: 'e.g., Floral, Woody, Citrus, Fresh' },
                { key: 'gender', label: 'Gender', placeholder: 'e.g., Men, Women, Unisex' },
                { key: 'volume', label: 'Volume', placeholder: 'e.g., 150ml, 100ml, 50ml' },
                { key: 'lasting', label: 'Lasting', placeholder: 'e.g., 6 hours, 8 hours, All Day' },
              ]
            }
          },
          { 
            name: "Men's Grooming", 
            slug: 'mens-grooming', 
            description: 'Razors, Beard Care', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Gillette, Philips, Beardo' },
                { key: 'product_type', label: 'Product Type', placeholder: 'e.g., Razor, Trimmer, Beard Oil, Shaving Cream' },
                { key: 'power_source', label: 'Power Source', placeholder: 'e.g., Battery, Rechargeable, Manual' },
                { key: 'blade_type', label: 'Blade Type', placeholder: 'e.g., Steel, Titanium' },
                { key: 'skin_type', label: 'Skin Type', placeholder: 'e.g., Sensitive, Normal, All' },
                { key: 'waterproof', label: 'Waterproof', placeholder: 'Yes/No' },
              ]
            }
          },
        ]
      }
    }
  });

  // 6. HEALTH & WELLNESS
  const health = await prisma.category.create({
    data: {
      name: 'Health & Wellness',
      slug: 'health-wellness',
      description: 'Health supplements, fitness equipment, and medical supplies',
      isActive: true,
      categorySpecification: {
        create: [
          { key: 'brand', label: 'Brand', placeholder: 'e.g., Himalaya, Dabur' },
          { key: 'type', label: 'Type', placeholder: 'e.g., Tablets, Capsules' },
        ]
      },
      children: {
        create: [
          { 
            name: 'Vitamins & Supplements', 
            slug: 'vitamins-supplements', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Himalaya, GNC, HealthKart' },
                { key: 'form', label: 'Form', placeholder: 'e.g., Tablets, Capsules, Gummies, Powder' },
                { key: 'quantity', label: 'Quantity', placeholder: 'e.g., 60 Tablets, 500g' },
                { key: 'dosage', label: 'Recommended Dosage', placeholder: 'e.g., 1 tablet daily' },
                { key: 'active_ingredients', label: 'Active Ingredients', placeholder: 'e.g., Vitamin D3, Omega-3, Calcium' },
                { key: 'health_benefit', label: 'Health Benefit', placeholder: 'e.g., Immunity, Bone Health, Energy' },
                { key: 'age_group', label: 'Age Group', placeholder: 'e.g., Adults, Children, Seniors' },
                { key: 'vegetarian', label: 'Vegetarian', placeholder: 'Yes/No' },
                { key: 'certification', label: 'Certification', placeholder: 'e.g., FSSAI, FDA, GMP' },
              ]
            }
          },
          { 
            name: 'Fitness Equipment', 
            slug: 'fitness-equipment', 
            description: 'Yoga Mats, Dumbbells', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Nivia, Strauss, Boldfit' },
                { key: 'equipment_type', label: 'Equipment Type', placeholder: 'e.g., Yoga Mat, Dumbbells, Resistance Band' },
                { key: 'weight', label: 'Weight', placeholder: 'e.g., 5kg, 10kg, Adjustable' },
                { key: 'material', label: 'Material', placeholder: 'e.g., PVC, Rubber, Steel, Foam' },
                { key: 'dimensions', label: 'Dimensions', placeholder: 'e.g., 180x60x0.6 cm' },
                { key: 'max_capacity', label: 'Max Weight Capacity', placeholder: 'e.g., 150kg' },
                { key: 'foldable', label: 'Foldable', placeholder: 'Yes/No' },
              ]
            }
          },
          { 
            name: 'Medical Supplies', 
            slug: 'medical-supplies', 
            description: 'BP Monitors, Thermometers', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Omron, Dr. Trust, Accu-Chek' },
                { key: 'device_type', label: 'Device Type', placeholder: 'e.g., BP Monitor, Thermometer, Glucometer' },
                { key: 'measurement_type', label: 'Measurement Type', placeholder: 'e.g., Digital, Manual' },
                { key: 'accuracy', label: 'Accuracy', placeholder: 'e.g., ±3 mmHg, ±0.1°C' },
                { key: 'power_source', label: 'Power Source', placeholder: 'e.g., Battery, AC Adapter' },
                { key: 'memory', label: 'Memory', placeholder: 'e.g., 60 readings, 100 readings' },
                { key: 'warranty', label: 'Warranty', placeholder: 'e.g., 1 Year, 5 Years' },
              ]
            }
          },
        ]
      }
    }
  });

  // 7. BOOKS & STATIONERY
  const books = await prisma.category.create({
    data: {
      name: 'Books & Stationery',
      slug: 'books-stationery',
      description: 'Books, office supplies, and stationery items',
      isActive: true,
      categorySpecification: {
        create: [
          { key: 'author', label: 'Author', placeholder: 'e.g., J.K. Rowling' },
          { key: 'publisher', label: 'Publisher', placeholder: 'e.g., Penguin' },
          { key: 'language', label: 'Language', placeholder: 'e.g., English, Hindi' },
        ]
      },
      children: {
        create: [
          { 
            name: 'Fiction & Non-Fiction Books', 
            slug: 'fiction-non-fiction-books', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'author', label: 'Author', placeholder: 'e.g., J.K. Rowling, Chetan Bhagat' },
                { key: 'publisher', label: 'Publisher', placeholder: 'e.g., Penguin, HarperCollins' },
                { key: 'isbn', label: 'ISBN', placeholder: 'e.g., 978-0-123456-78-9' },
                { key: 'language', label: 'Language', placeholder: 'e.g., English, Hindi, Marathi' },
                { key: 'pages', label: 'Number of Pages', placeholder: 'e.g., 350' },
                { key: 'binding', label: 'Binding', placeholder: 'e.g., Paperback, Hardcover, Kindle' },
                { key: 'genre', label: 'Genre', placeholder: 'e.g., Fiction, Mystery, Romance, Biography' },
                { key: 'publication_year', label: 'Publication Year', placeholder: 'e.g., 2024' },
              ]
            }
          },
          { 
            name: 'Educational Textbooks', 
            slug: 'educational-textbooks', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'subject', label: 'Subject', placeholder: 'e.g., Mathematics, Physics, History' },
                { key: 'class_level', label: 'Class/Level', placeholder: 'e.g., Class 10, Graduation, Competitive' },
                { key: 'board', label: 'Board', placeholder: 'e.g., CBSE, ICSE, State Board' },
                { key: 'publisher', label: 'Publisher', placeholder: 'e.g., NCERT, Arihant' },
                { key: 'edition', label: 'Edition', placeholder: 'e.g., 2024 Edition, Latest' },
              ]
            }
          },
          { 
            name: 'Office Stationery', 
            slug: 'office-stationery', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Classmate, Reynolds, Faber-Castell' },
                { key: 'type', label: 'Type', placeholder: 'e.g., Notebook, File, Binder, Stapler' },
                { key: 'pages', label: 'Pages/Sheets', placeholder: 'e.g., 100 Pages, 200 Sheets' },
                { key: 'size', label: 'Size', placeholder: 'e.g., A4, A5, Legal' },
                { key: 'ruling', label: 'Ruling', placeholder: 'e.g., Ruled, Blank, Grid' },
                { key: 'material', label: 'Material', placeholder: 'e.g., Paper, Plastic, Metal' },
              ]
            }
          },
          { 
            name: 'Pens & Notebooks', 
            slug: 'pens-notebooks', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Reynolds, Parker, Cello' },
                { key: 'type', label: 'Type', placeholder: 'e.g., Ballpoint, Gel, Fountain' },
                { key: 'color', label: 'Ink Color', placeholder: 'e.g., Blue, Black, Red' },
                { key: 'tip_size', label: 'Tip Size', placeholder: 'e.g., 0.5mm, 0.7mm, 1.0mm' },
                { key: 'refillable', label: 'Refillable', placeholder: 'Yes/No' },
              ]
            }
          },
        ]
      }
    }
  });

  // 8. TOYS & GAMES
  const toys = await prisma.category.create({
    data: {
      name: 'Toys & Games',
      slug: 'toys-games',
      description: 'Toys, games, and entertainment for all ages',
      isActive: true,
      categorySpecification: {
        create: [
          { key: 'brand', label: 'Brand', placeholder: 'e.g., LEGO, Mattel' },
          { key: 'age_range', label: 'Age Range', placeholder: 'e.g., 3-5 years' },
          { key: 'material', label: 'Material', placeholder: 'e.g., Plastic, Wood' },
        ]
      },
      children: {
        create: [
          { 
            name: 'Action Figures', 
            slug: 'action-figures', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Hasbro, Mattel, Funskool' },
                { key: 'character', label: 'Character', placeholder: 'e.g., Spider-Man, Batman, Iron Man' },
                { key: 'age_range', label: 'Age Range', placeholder: 'e.g., 4-6 years, 7-10 years' },
                { key: 'material', label: 'Material', placeholder: 'e.g., Plastic, PVC' },
                { key: 'height', label: 'Figure Height', placeholder: 'e.g., 6 inches, 12 inches' },
                { key: 'articulation', label: 'Articulation Points', placeholder: 'e.g., 20 points' },
                { key: 'battery_required', label: 'Battery Required', placeholder: 'Yes/No' },
              ]
            }
          },
          { 
            name: 'Board Games', 
            slug: 'board-games', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Hasbro, Mattel, Funskool' },
                { key: 'game_name', label: 'Game Name', placeholder: 'e.g., Monopoly, Scrabble, Chess' },
                { key: 'players', label: 'Number of Players', placeholder: 'e.g., 2-4, 2-6' },
                { key: 'age_range', label: 'Age Range', placeholder: 'e.g., 8+ years' },
                { key: 'playtime', label: 'Average Playtime', placeholder: 'e.g., 30 min, 1 hour' },
                { key: 'category', label: 'Category', placeholder: 'e.g., Strategy, Family, Educational' },
              ]
            }
          },
          { 
            name: 'Remote Control Toys', 
            slug: 'remote-control-toys', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Hot Wheels, Syma' },
                { key: 'toy_type', label: 'Toy Type', placeholder: 'e.g., Car, Drone, Helicopter, Boat' },
                { key: 'age_range', label: 'Age Range', placeholder: 'e.g., 6-10 years' },
                { key: 'remote_type', label: 'Remote Type', placeholder: 'e.g., Radio Control, Infrared' },
                { key: 'battery_type', label: 'Battery Type', placeholder: 'e.g., Rechargeable, AA Batteries' },
                { key: 'range', label: 'Control Range', placeholder: 'e.g., 30 meters, 50 meters' },
                { key: 'speed', label: 'Max Speed', placeholder: 'e.g., 15 km/h' },
              ]
            }
          },
          { 
            name: 'Educational Toys', 
            slug: 'educational-toys', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., LEGO, Skillmatics' },
                { key: 'age_range', label: 'Age Range', placeholder: 'e.g., 3-5 years' },
                { key: 'learning_skill', label: 'Learning Skills', placeholder: 'e.g., STEM, Motor Skills, Creativity' },
                { key: 'material', label: 'Material', placeholder: 'e.g., Wood, Plastic, Cardboard' },
                { key: 'pieces', label: 'Number of Pieces', placeholder: 'e.g., 50 pieces' },
                { key: 'safety_certified', label: 'Safety Certified', placeholder: 'e.g., CE, BIS' },
              ]
            }
          },
        ]
      }
    }
  });

  // 9. AUTOMOTIVE & TOOLS
  const automotive = await prisma.category.create({
    data: {
      name: 'Automotive & Tools',
      slug: 'automotive-tools',
      description: 'Car and bike accessories, tools, and hardware',
      isActive: true,
      categorySpecification: {
        create: [
          { key: 'brand', label: 'Brand', placeholder: 'e.g., Bosch, 3M' },
          { key: 'compatible_vehicles', label: 'Compatible Vehicles', placeholder: 'e.g., All Cars' },
        ]
      },
      children: {
        create: [
          { 
            name: 'Car Accessories', 
            slug: 'car-accessories', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., 3M, Bosch, Amaron' },
                { key: 'accessory_type', label: 'Accessory Type', placeholder: 'e.g., Seat Cover, Dashboard Camera, Air Freshener' },
                { key: 'compatible_vehicles', label: 'Compatible Vehicles', placeholder: 'e.g., Universal, Specific Models' },
                { key: 'material', label: 'Material', placeholder: 'e.g., Leather, Fabric, Plastic' },
                { key: 'color', label: 'Color', placeholder: 'e.g., Black, Beige, Grey' },
                { key: 'installation', label: 'Installation', placeholder: 'e.g., DIY, Professional Required' },
                { key: 'warranty', label: 'Warranty', placeholder: 'e.g., 1 Year' },
              ]
            }
          },
          { 
            name: 'Bike Accessories', 
            slug: 'bike-accessories', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Vega, Studds, Grip' },
                { key: 'accessory_type', label: 'Accessory Type', placeholder: 'e.g., Helmet, Gloves, Phone Holder' },
                { key: 'size', label: 'Size', placeholder: 'e.g., M, L, XL, Universal' },
                { key: 'material', label: 'Material', placeholder: 'e.g., ABS Plastic, Leather, Rubber' },
                { key: 'color', label: 'Color', placeholder: 'e.g., Black, Red, Blue' },
                { key: 'safety_certification', label: 'Safety Certification', placeholder: 'e.g., ISI, DOT, ECE' },
              ]
            }
          },
          { 
            name: 'Tools & Hardware', 
            slug: 'tools-hardware', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Stanley, Bosch, DeWalt' },
                { key: 'tool_type', label: 'Tool Type', placeholder: 'e.g., Drill, Wrench, Screwdriver Set' },
                { key: 'power_source', label: 'Power Source', placeholder: 'e.g., Electric, Manual, Battery' },
                { key: 'voltage', label: 'Voltage', placeholder: 'e.g., 220V, 12V' },
                { key: 'material', label: 'Material', placeholder: 'e.g., Steel, Chrome Vanadium' },
                { key: 'pieces', label: 'Number of Pieces', placeholder: 'e.g., 5-piece set, 100-piece set' },
                { key: 'warranty', label: 'Warranty', placeholder: 'e.g., 6 Months, 2 Years' },
              ]
            }
          },
          { 
            name: 'Automotive Care', 
            slug: 'automotive-care', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., 3M, Wavex, Waxpol' },
                { key: 'product_type', label: 'Product Type', placeholder: 'e.g., Car Wash, Polish, Wax, Cleaner' },
                { key: 'volume', label: 'Volume', placeholder: 'e.g., 500ml, 1L' },
                { key: 'application', label: 'Application', placeholder: 'e.g., Exterior, Interior, Both' },
                { key: 'fragrance', label: 'Fragrance', placeholder: 'e.g., Lemon, Lavender, Unscented' },
              ]
            }
          },
        ]
      }
    }
  });

  // 10. SPORTS & OUTDOORS
  const sports = await prisma.category.create({
    data: {
      name: 'Sports & Outdoors',
      slug: 'sports-outdoors',
      description: 'Sports equipment, outdoor gear, and fitness accessories',
      isActive: true,
      categorySpecification: {
        create: [
          { key: 'brand', label: 'Brand', placeholder: 'e.g., Nike, Adidas, Puma' },
          { key: 'sport_type', label: 'Sport Type', placeholder: 'e.g., Cricket, Football' },
          { key: 'size', label: 'Size', placeholder: 'e.g., 5, Medium' },
        ]
      },
      children: {
        create: [
          { 
            name: 'Gym Equipment', 
            slug: 'gym-equipment', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Nivia, Strauss, Kore' },
                { key: 'equipment_type', label: 'Equipment Type', placeholder: 'e.g., Treadmill, Dumbbell, Bench' },
                { key: 'weight', label: 'Weight/Capacity', placeholder: 'e.g., 5kg, 10kg, 150kg max' },
                { key: 'material', label: 'Material', placeholder: 'e.g., Steel, Iron, Rubber' },
                { key: 'adjustable', label: 'Adjustable', placeholder: 'Yes/No' },
                { key: 'max_user_weight', label: 'Max User Weight', placeholder: 'e.g., 120kg' },
                { key: 'warranty', label: 'Warranty', placeholder: 'e.g., 1 Year' },
              ]
            }
          },
          { 
            name: 'Cricket, Football, Badminton Gear', 
            slug: 'cricket-football-badminton-gear', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., MRF, Yonex, Nike, Adidas' },
                { key: 'sport', label: 'Sport', placeholder: 'e.g., Cricket, Football, Badminton' },
                { key: 'product_type', label: 'Product Type', placeholder: 'e.g., Bat, Ball, Racket, Shoes' },
                { key: 'size', label: 'Size', placeholder: 'e.g., Full Size, Size 5, G4' },
                { key: 'material', label: 'Material', placeholder: 'e.g., English Willow, Leather, Graphite' },
                { key: 'level', label: 'Skill Level', placeholder: 'e.g., Beginner, Intermediate, Professional' },
                { key: 'age_group', label: 'Age Group', placeholder: 'e.g., Adults, Youth' },
                { key: 'color', label: 'Color', placeholder: 'e.g., Red, White, Black' },
              ]
            }
          },
          { 
            name: 'Camping & Hiking Gear', 
            slug: 'camping-hiking-gear', 
            isActive: true,
            categorySpecification: {
              create: [
                { key: 'brand', label: 'Brand', placeholder: 'e.g., Quechua, Wildcraft, Coleman' },
                { key: 'gear_type', label: 'Gear Type', placeholder: 'e.g., Tent, Backpack, Sleeping Bag' },
                { key: 'capacity', label: 'Capacity', placeholder: 'e.g., 2 Person, 4 Person, 50L' },
                { key: 'material', label: 'Material', placeholder: 'e.g., Polyester, Nylon, Canvas' },
                { key: 'waterproof', label: 'Waterproof', placeholder: 'Yes/No' },
                { key: 'weight', label: 'Weight', placeholder: 'e.g., 2kg, 5kg' },
                { key: 'season', label: 'Season', placeholder: 'e.g., Summer, Winter, All Season' },
              ]
            }
          },
        ]
      }
    }
  });

  console.log('✅ Categories seeded successfully!');

  return {
    electronics,
    fashion,
    homeKitchen,
    grocery,
    beauty,
    health,
    books,
    toys,
    automotive,
    sports
  };
}

// Main seed function
async function main() {
  try {
    await seedCategories();
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

// Execute the seed
main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

export { seedCategories };