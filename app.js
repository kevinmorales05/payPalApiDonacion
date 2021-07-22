const express = require('express');
const paypal = require('paypal-rest-sdk');

paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'AUaLcL0v9fhe7eqZNTuWD_GOPIYe1wgfZEWfH8NJRUZaw8MlosCQPhU0ZsIfF2N-VgohcLNRgt2XdY5F',
  'client_secret': 'EGxtbS-6um8OWnOgDquuF7dltserVNio9-vuvaRvLdy6Idh-1NDDSoQf1WN4Y5bkaLGvNeOhL_Gt8RPQ'
});

const app = express();

var amt = null;

app.get('/pay/:amt', (req, res) => {
   
    amt = req.params.amt;

    const create_payment_json = {
      "intent": "sale",
      "payer": {
          "payment_method": "paypal"
      },
      "redirect_urls": {
          "return_url": "http://10.0.2.2:4444/success",
          "cancel_url": "http://10.0.2.2:4444/cancel"
      },
      "transactions": [{
          "item_list": {
              "items": [{
                  "name": "Red Hat",
                  "sku": "001",
                  "price": amt,
                  "currency": "USD",
                  "quantity": 1
              }]
          },
          "amount": {
              "currency": "USD",
              "total": amt
          },
          "description": "Hat for the best team ever"
      }]
  };
  
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
        throw error;
    } else {
        for(let i = 0;i < payment.links.length;i++){
          if(payment.links[i].rel === 'approval_url'){
            res.redirect(payment.links[i].href);
          }
        }
    }
  });
  
  });

  app.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    console.log("payerId",payerId,"paymentId",paymentId) 
    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
          "amount": {
              "currency": "USD",
              "total": amt
          }
      }]
    };
  
    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
          console.log("error",error.response);
          throw error;
      } else {
          res.sendFile(__dirname + "/success.html")
      }
  });
});

app.get('/cancel', (req, res) => res.send('Cancelled'));

const PORT = process.env.PORT || 4444 ;

app.listen(PORT, () => console.log(`Server Started on ${PORT}`));