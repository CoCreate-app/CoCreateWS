var express = require('express');
var path = require('path');
var router = express.Router();

const Stripe = require('../controllers/stripe');



// router.post('/getStripeAccountInfo', Api.getStripeAccountInfo);
// router.post('/createStripeCustomer', Api.createStripeCustomer);
// router.post('/createStripeCard', Api.createStripeCard);
// router.post('/createStripeCharge', Api.createStripeCharge);
// router.post('/chargeTest', Api.chargeTest);

router.post('/createCustomer', Stripe.createCustomer);
router.post('/updateCustomer', Stripe.updateCustomer);
router.post('/createToken', Stripe.createToken);
router.post('/createCard', Stripe.createCard);
router.post('/updateCard', Stripe.updateCard);
router.post('/createTransfer', Stripe.createTransfer);
router.post('/getBalance', Stripe.getBalance);






router.post('/createCharge', Stripe.createCharge);
router.post('/updateCharge', Stripe.updateCharge);















module.exports = router;