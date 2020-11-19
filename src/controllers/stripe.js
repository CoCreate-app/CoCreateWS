module.exports.createCustomer = (req, res, next) => {
  
  const stripe = require('stripe')('sk_test_lWZQujOjyjfDq991GZjKmfli');   //// use platform key
  
  let param = req.body.param;
  
  console.log(param);
  
  stripe.customers.create(param, (err, customer) => {
    
    console.log(err)
    
    if (!err && customer) {
      res.send({
        success: true,
        data: customer
      });
    } else if (err) {
      res.send('err');
    }
    
  });
  
}

module.exports.updateCustomer = (req, res, next) => {
  
  const stripe = require('stripe')('sk_test_lWZQujOjyjfDq991GZjKmfli');   //// use platform key
  
  let param = req.body.param;
  
  console.log(param);
  
  stripe.customers.update(param.customer, param.customerParam, (err, customer) => {
    
    console.log(err)
    
    if (!err && customer) {
      res.send({
        success: true,
        data: customer
      });
    } else if (err) {
      res.send('err');
    }
    
  });
  
}

module.exports.createToken = (req, res, next) => {
  const stripe = require('stripe')('sk_test_lWZQujOjyjfDq991GZjKmfli');    //// platform key
  
  console.log("body CreateToken ",req.body)
  let param = req.body.param;
  
  stripe.tokens.create(param, (err, token) => {
    
    console.log(err);
    
    if (!err && token) {
      res.send({
        success: true,
        data: token
      });
    } else if (err) {
      res.send('err');
    }
    
  });
}

module.exports.createCard = (req, res, next) => {
  const stripe = require('stripe')('sk_test_lWZQujOjyjfDq991GZjKmfli');   //// platform key
  
  let param = req.body.param;
  
  console.log(param);
  
  stripe.customers.createSource(param.customerId, {source: param.tokenId}, (err, card) => {
    
    console.log(err);
    console.log(card);
    
    if (!err && card) {
      res.send({
        success: true,
        data: card
      });
    } else if (err) {
      res.send('err');
    }
    
  });
}

module.exports.updateCard = (req, res, next) => {
  const stripe = require('stripe')('sk_test_lWZQujOjyjfDq991GZjKmfli');   //// use platform key
  
  let param = req.body.param;
  
  console.log(param);
  
  stripe.customers.updateSource(param.customerId, param.cardId, param.cardParam, (err, card) => {
    
    console.log(err);
    console.log(card);
    
    if (!err && card) {
      res.send({
        success: true,
        data: card
      });
    } else if (err) {
      res.send('err');
    }
    
  });
}




module.exports.createCharge = (req, res, next) => {
  const stripe = require('stripe')('sk_test_lWZQujOjyjfDq991GZjKmfli');                   //// use platform key
  
  let param = req.body.param;
  let chargeParam ;
  if (param.destination) {
    chargeParam = {
      ...param.charge,
      transfer_data: {
        destination: param.destination
      }
    };
  } else {
    chargeParam = param.charge
  }
  
  console.log(chargeParam);
  
  stripe.charges.create(chargeParam, {stripe_account: param.stripe_account}, (err, charge) => {
    console.log(charge);
    console.log(err);
    
    if (!err && charge) {
      res.send({
        success: true,
        data: charge
      });
    } else if (err) {
      res.send('err');
    }
  });
}

module.exports.createTransfer = (req, res, next) => {
  const stripe = require('stripe')('sk_test_lWZQujOjyjfDq991GZjKmfli');                   //// use platform key
  
  let param = req.body.param;
  
  console.log(param);
  
  stripe.transfers.create(param, (err, transfer) => {
    console.log(transfer);
    console.log(err);
    
    if (!err && transfer) {
      res.send({
        success: true,
        data: transfer
      });
    } else if (err) {
      res.send('err');
    }
  });
}

module.exports.updateCharge = (req, res, next) => {
  const stripe = require('stripe')('sk_test_lWZQujOjyjfDq991GZjKmfli');                   //// use platform key
  let param = req.body.param;
  
  console.log(param);
  
  stripe.charges.update(param.chargeId, param.chargeParam, (err, charge) => {
    console.log(charge);
    console.log(err);
    
    if (!err && charge) {
      res.send({
        success: true,
        data: charge
      });
    } else if (err) {
      res.send('err');
    }
  });
}

module.exports.getBalance = (req, res, next) => {
  const stripe = require('stripe')('sk_test_lWZQujOjyjfDq991GZjKmfli');                   //// use platform key
  
  
  
  stripe.balance.retrieve((err, balance) => {
    console.log(balance);
    console.log(err);
    
    if (!err && balance) {
      res.send({
        success: true,
        data: balance
      });
    } else if (err) {
      res.send('err');
    }
  });
}

