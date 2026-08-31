fetch('http://localhost:5000/api/products/cd46716b-97db-4f8f-b85a-16d84a00a0ec')
  .then(res => res.json())
  .then(json => {
    console.log("API Response bulkPricingEnabled:", json.data.bulkPricingEnabled);
    console.log("API Response bulkMinimumQuantity:", json.data.bulkMinimumQuantity);
    console.log("API Response bulkPrice:", json.data.bulkPrice);
  })
  .catch(err => console.error(err));
