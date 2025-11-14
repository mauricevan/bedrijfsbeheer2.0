/**
 * API Routes Example - BTD Beveiliging
 * Voorbeeldstructuur voor toekomstige API implementatie
 */

// import express from 'express';
// import { getServices } from '../controllers/serviceController.js';
// import { getProducts } from '../controllers/productController.js';
// import { getPlatforms } from '../controllers/platformController.js';
// import { getBrands } from '../controllers/brandController.js';
// import { submitContact } from '../controllers/contactController.js';
// import { validateContactSubmission } from '../middleware/validate.js';

// const router = express.Router();

// // Services endpoints
// router.get('/services', getServices);

// // Products endpoints
// router.get('/products', getProducts);
// router.get('/products/featured', getFeaturedProducts);

// // Platforms endpoints
// router.get('/platforms', getPlatforms);

// // Brands endpoints
// router.get('/brands', getBrands);

// // Contact endpoints
// router.post('/contact', validateContactSubmission, submitContact);

// export default router;

/**
 * Voorbeeld responses:
 *
 * GET /api/services
 * Response: Array van Service objecten
 *
 * GET /api/products
 * Response: Array van Product objecten
 *
 * GET /api/products/featured
 * Response: Array van featured Product objecten
 *
 * GET /api/platforms
 * Response: Array van Platform objecten
 *
 * GET /api/brands
 * Response: Array van Brand objecten
 *
 * POST /api/contact
 * Body: { name, email, phone?, message }
 * Response: { success: true, message: "Bericht verzonden" }
 */
