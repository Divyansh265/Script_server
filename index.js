const express = require('express');
const app = express();
const cors = require('cors');
app.use(cors());
const mongoose = require('mongoose');

app.use(express.json());
const axios = require('axios');


const DB = "mongodb+srv://spuspam111:Sp123456@cluster0.0taaaup.mongodb.net/scripttag?retryWrites=true&w=majority";
mongoose.connect(DB)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch(error => {
    console.error("Error connecting to MongoDB:", error);
  });


const Shop = mongoose.model('Shop', new mongoose.Schema({
  shop: { type: String, required: true, unique: true },
  accessToken: { type: String, required: true },
  isEnabled: { type: String, default: false },
  collection_isEnabled: { type: String, default: "false" },
  article_isEnabled: { type: String, default: "false" },
  organization_isEnabled: { type: String, default: "false" },
  breadcrumb_isEnabled: { type: String, default: "false" },
  video_isEnabled: { type: String, default: "false" },
  searchbox_isEnabled: { type: String, default: "false" },
  recipe_isEnabled: { type: String, default: "false" },
}));


app.get('/serve-script/:shop', async (req, res) => {
  // Extract the shop parameter from the query string
  const shopName = req.params.shop;

  if (!shopName) {
    return res.status(400).send('Shop name is required');
  }

  // Find shop details in MongoDB
  const shopData = await Shop.findOne({ shop: shopName });

  if (!shopData) {
    return res.status(404).send('Shop not found');
  }

  // Generate dynamic JavaScript
  const scriptContent = `
    document.addEventListener("DOMContentLoaded", async () => {
      const urlParts = window.location.pathname.split("/");
      const handle = urlParts[urlParts.length - 1];
      
      if (handle) {
        const response = await fetch("https://${shopData.shop}/admin/api/2024-04/products.json?handle=" + handle, {
          method: "GET",
          headers: {
            "X-Shopify-Access-Token": "${shopData.accessToken}",
            "Content-Type": "application/json",
          },
        });
        
        const data = await response.json();
        
        if (data.products && data.products.length > 0) {
          alert("Product title: " + data.products[0].title);
        } else {
          alert("Product not found.");
        }
      }
    });
  `;

  // Set Content-Type to JavaScript
  res.setHeader('Content-Type', 'application/javascript');
  res.send(scriptContent);
});








app.get("/check-store", async (req, res) => {
  const { shop } = req.query;

  try {
    const store = await Shop.findOne({ shop });

    if (!store) {
      return res.status(404).json({ message: "Store not registered." });
    }

    res.json({ accessToken: store.accessToken });
  } catch (error) {
    console.error("Error retrieving store data:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});




app.get("/server-script.js", (req, res) => {
  res.set("Content-Type", "application/javascript");


  // var shop = 'demosaurav.myshopify.com';
  // res.send(`
  //      var shop = window.location.hostname;

  //     function displayProductInfo() {
  //       const shop = "${shop}"; // Injected from server into client script
  //       const pathParts = window.location.pathname.split("/");

  //       console.log("Script loaded for shop:", shop);

  //       async function fetchProductData() {
  //         try {
  //           const displayContainer = document.createElement("div");
  //           displayContainer.style = "position: fixed; top: 0; left: 0; width: 100%; background: #f0f8ff; color: #333; padding: 20px; box-shadow: 0px 4px 8px rgba(0, 0, 0, 0.1); z-index: 9999;";
  //           displayContainer.innerHTML = "<h3>Product Information</h3>";
  //           document.body.insertAdjacentElement("afterbegin", displayContainer);

  //           const tokenResponse = await fetch(\`https://server-page-xo9v.onrender.com/check-store?shop=\${shop}\`);
  //           const tokenData = await tokenResponse.json();

  //           if (!tokenData || !tokenData.accessToken) {
  //             alert("Store not registered or access token not found.");
  //             return;
  //           }

  //           const accessToken = tokenData.accessToken;

  //           const insertSchema = (products) => {
  //             products.forEach((product) => {
  //               const schema = {
  //                 "@context": "https://schema.org/",
  //                 "@type": "Product",
  //                 "name": product.title,
  //                 "image": product.images ? product.images.map((img) => img.src) : [],
  //                 "description": product.body_html || "",
  //                 "sku": product.sku || "",
  //                 "brand": { "@type": "Brand", "name": product.vendor || "" },
  //                 "offers": {
  //                   "@type": "Offer",
  //                   "priceCurrency": tokenData.currency || "USD",
  //                   "price": product.variants && product.variants[0] ? product.variants[0].price : "0",
  //                   "availability": product.available ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
  //                   "url": \`https://${shop}/products/\${product.handle}\`,
  //                   "seller": { "@type": "Organization", "name": shop }
  //                 }
  //               };

  //               const scriptTag = document.createElement("script");
  //               scriptTag.type = "application/ld+json";
  //               scriptTag.text = JSON.stringify(schema);
  //               document.head.appendChild(scriptTag);

  //               const productInfo = \`
  //                 <div style="margin-bottom: 10px;">
  //                   <strong>Product Title:</strong> \${product.title} <br>
  //                   <strong>Price:</strong> \${product.variants && product.variants[0] ? product.variants[0].price : "N/A"} \${tokenData.currency || "USD"} <br>
  //                 </div>
  //               \`;
  //               displayContainer.innerHTML += productInfo;
  //             });
  //           };

  //           if (pathParts[1] === "products" && pathParts[2]) {
  //             const handle = pathParts[2];
  //             const productResponse = await fetch(\`https://${shop}/admin/api/2024-04/products.json?handle=\${handle}\`, {
  //               method: "GET",
  //               headers: { "X-Shopify-Access-Token": accessToken, "Content-Type": "application/json" },
  //             });
  //             const productData = await productResponse.json();
  //             if (productData.products && productData.products.length > 0) {
  //               insertSchema(productData.products);
  //             } else {
  //               alert("Product not found.");
  //             }
  //           } else if (pathParts[1] === "products") {
  //             const productsResponse = await fetch(\`https://${shop}/admin/api/2024-04/products.json\`, {
  //               method: "GET",
  //               headers: { "X-Shopify-Access-Token": accessToken, "Content-Type": "application/json" },
  //             });
  //             const productsData = await productsResponse.json();
  //             if (productsData.products && productsData.products.length > 0) {
  //               insertSchema(productsData.products);
  //             } else {
  //               alert("No products found.");
  //             }
  //           }
  //         } catch (error) {
  //           console.error("Error fetching product data:", error);
  //         }
  //       }

  //       fetchProductData();
  //     }

  //     displayProductInfo();
  //   `);












  res.send(`
    const shop = window.location.hostname;
  
    async function insertProductSchema() {
      try {
        const tokenResponse = await fetch(\`https://script-server-c42x.onrender.com/check-store?shop=\${shop}\`);
        const tokenData = await tokenResponse.json();
  
        if (tokenData && tokenData.accessToken) {
          const accessToken = tokenData.accessToken;
          const pathParts = window.location.pathname.split("/");
  
          if (pathParts[1] === "products") {
            const handle = pathParts[2];
  
            let productData;
            if (handle) {
              const productResponse = await fetch(
                \`https://\${shop}/admin/api/2024-04/products.json?handle=\${handle}\`,
                {
                  method: "GET",
                  headers: {
                    "X-Shopify-Access-Token": accessToken,
                    "Content-Type": "application/json",
                  },
                }
              );
              productData = await productResponse.json();
              if (productData.products && productData.products.length > 0) {
                const product = productData.products[0];
                insertSchema(product);
              } else {
                console.warn("Product not found.");
              }
            } else {
              const allProductsResponse = await fetch(
                \`https://\${shop}/admin/api/2024-04/products.json\`,
                {
                  method: "GET",
                  headers: {
                    "X-Shopify-Access-Token": accessToken,
                    "Content-Type": "application/json",
                  },
                }
              );
              productData = await allProductsResponse.json();
              if (productData.products && productData.products.length > 0) {
                productData.products.forEach(insertSchema);
              } else {
                console.warn("No products found.");
              }
            }
          } else {
            console.warn("Not on products page.");
          }
        } else {
          console.warn("Access token not found for this shop.");
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    }
  
    function insertSchema(product) {
      const schemaData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.title,
        "shipping_fee": 100,
        "shipping_Address": "India",
        "my_insert_data":"check data",
        "image": product.images.map(image => image.src),
        "description": product.body_html.replace(/<[^>]*>/g, ""),
        "sku": product.variants[0].sku,
        "mpn": product.variants[0].sku,
        "brand": {
          "@type": "Brand",
          "name": product.vendor
        },
        "offers": {
          "@type": "Offer",
          "priceCurrency": product.variants[0].currency,
          "price": product.variants[0].price,
          "itemCondition": "https://schema.org/NewCondition",
          "availability": product.variants[0].inventory_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "url": window.location.href,
          "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
          "seller": {
            "@type": "Organization",
            "name": shop
          }
        }
      };
  
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(schemaData);
      document.head.appendChild(script);
      console.log("JSON-LD schema inserted for product:", product.title);
    }
  
    insertProductSchema();
  `);







  // append all data in schema in head tag

  // res.send(`
  //    const shop = window.location.hostname;

  //   async function insertProductSchema() {


  //     try {
  //       // Fetch access token from server
  //       const tokenResponse = await fetch(\`https://server-page-xo9v.onrender.com/check-store?shop=\${shop}\`);
  //       const tokenData = await tokenResponse.json();

  //       if (tokenData && tokenData.accessToken) {
  //         const accessToken = tokenData.accessToken;
  //         const pathParts = window.location.pathname.split("/");

  //         // Check if on products page or single product page
  //         if (pathParts[1] === "products") {
  //           const handle = pathParts[2];

  //           let productData;
  //           if (handle) {
  //             // Fetch specific product by handle
  //             const productResponse = await fetch(
  //               \`https://\${shop}/admin/api/2024-04/products.json?handle=\${handle}\`,
  //               {
  //                 method: "GET",
  //                 headers: {
  //                   "X-Shopify-Access-Token": accessToken,
  //                   "Content-Type": "application/json",
  //                 },
  //               }
  //             );
  //             productData = await productResponse.json();
  //             if (productData.products && productData.products.length > 0) {
  //               const product = productData.products[0];
  //               insertSchema(product);
  //             } else {
  //               console.warn("Product not found.");
  //             }
  //           } else {
  //             // Fetch all products for the /products page
  //             const allProductsResponse = await fetch(
  //               \`https://\${shop}/admin/api/2024-04/products.json\`,
  //               {
  //                 method: "GET",
  //                 headers: {
  //                   "X-Shopify-Access-Token": accessToken,
  //                   "Content-Type": "application/json",
  //                 },
  //               }
  //             );
  //             productData = await allProductsResponse.json();
  //             if (productData.products && productData.products.length > 0) {
  //               productData.products.forEach(insertSchema);
  //             } else {
  //               console.warn("No products found.");
  //             }
  //           }
  //         } else {
  //           console.warn("Not on products page.");
  //         }
  //       } else {
  //         console.warn("Access token not found for this shop.");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching product data:", error);
  //     }
  //   }

  //   function insertSchema(product) {
  //     // Build the JSON-LD schema for the product
  //     const schemaData = {
  //       "@context": "https://schema.org/",
  //       "@type": "Product",
  //       "name": product.title,
  //       "image": product.images.map(image => image.src),
  //       "description": product.body_html.replace(/<[^>]*>/g, ""),
  //       "sku": product.variants[0].sku,
  //       "mpn": product.variants[0].sku,
  //       "brand": {
  //         "@type": "Brand",
  //         "name": product.vendor
  //       },
  //       "offers": {
  //         "@type": "Offer",
  //         "priceCurrency": product.variants[0].currency,
  //         "price": product.variants[0].price,
  //         "itemCondition": "https://schema.org/NewCondition",
  //         "availability": product.variants[0].inventory_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
  //         "url": window.location.href,
  //         "priceValidUntil": new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
  //         "seller": {
  //           "@type": "Organization",
  //           "name": shop
  //         }
  //       }
  //     };

  //     // Create a <script> tag and insert JSON-LD structured data
  //     const script = document.createElement("script");
  //     script.type = "application/ld+json";
  //     script.text = JSON.stringify(schemaData);
  //     document.head.appendChild(script);
  //     console.log("JSON-LD schema inserted for product:", product.title);
  //   }

  //   insertProductSchema();
  // `);




  // alert all product title if we are in /products page, and if we are in single product page then alert product title and price

  // res.send(`
  //   async function hello() {
  //     const shop = window.location.hostname;
  //     alert("Shop: " + shop);

  //     try {
  //       // Fetch access token from server
  //       const tokenResponse = await fetch(\`https://server-page-xo9v.onrender.com/check-store?shop=\${shop}\`);
  //       const tokenData = await tokenResponse.json();

  //       if (tokenData && tokenData.accessToken) {
  //         const accessToken = tokenData.accessToken;
  //         alert("Access Token: " + accessToken);

  //         const pathParts = window.location.pathname.split("/");

  //         // Check if on products page or a single product page
  //         if (pathParts[1] === "products") {
  //           const handle = pathParts[2];

  //           if (handle) {
  //             // If a specific product handle is in the URL, fetch that product's data
  //             alert("Product Handle: " + handle);

  //             const productResponse = await fetch(
  //               \`https://\${shop}/admin/api/2024-04/products.json?handle=\${handle}\`,
  //               {
  //                 method: "GET",
  //                 headers: {
  //                   "X-Shopify-Access-Token": accessToken,
  //                   "Content-Type": "application/json",
  //                 },
  //               }
  //             );

  //             const productData = await productResponse.json();

  //             if (productData.products && productData.products.length > 0) {
  //               const product = productData.products[0];
  //               alert("Product Title: " + product.title + "\\nPrice: $" + product.variants[0].price);
  //             } else {
  //               alert("Product not found.");
  //             }
  //           } else {
  //             // No handle: Fetch all products
  //             const allProductsResponse = await fetch(
  //               \`https://\${shop}/admin/api/2024-04/products.json\`,
  //               {
  //                 method: "GET",
  //                 headers: {
  //                   "X-Shopify-Access-Token": accessToken,
  //                   "Content-Type": "application/json",
  //                 },
  //               }
  //             );

  //             const allProductsData = await allProductsResponse.json();

  //             if (allProductsData.products && allProductsData.products.length > 0) {
  //               const productTitles = allProductsData.products.map(product => product.title);
  //               alert("All Products:\\n" + productTitles.join("\\n"));
  //             } else {
  //               alert("No products found.");
  //             }
  //           }
  //         } else {
  //           alert("Not on products page.");
  //         }
  //       } else {
  //         alert("Access token not found for this shop.");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching product data:", error);
  //       alert("Failed to fetch product data.");
  //     }
  //   }

  //   hello();
  // `);


  // display single product title 

  // res.send(`
  //   async function hello(){
  //        const shop = window.location.hostname;

  //       alert('helloooooooooo');

  //       try {

  //         const tokenResponse = await fetch(\`https://server-page-xo9v.onrender.com/check-store?shop=\${shop}\`);
  //         const tokenData = await tokenResponse.json();


  //       if (tokenData && tokenData.accessToken) {
  //         const accessToken = tokenData.accessToken;
  //         alert("Access Token: " + accessToken);

  //         // Check if on a product page
  //         const pathParts = window.location.pathname.split("/");
  //         if (pathParts[1] === "products" && pathParts[2]) {
  //           const handle = pathParts[2];
  //           alert("Product Handle: " + handle);

  //           // Fetch product details using the handle
  //           const productResponse = await fetch(
  //             \`https://\${shop}/admin/api/2024-04/products.json?handle=\${handle}\`,
  //             {
  //               method: "GET",
  //               headers: {
  //                 "X-Shopify-Access-Token": accessToken,
  //                 "Content-Type": "application/json",
  //               },
  //             }
  //           );

  //           const productData = await productResponse.json();

  //           if (productData.products && productData.products.length > 0) {
  //             alert("Product Title: " + productData.products[0].title);
  //           } else {
  //             alert("Product not found.");
  //           }
  //         } else {
  //           alert("No product found.");
  //         }
  //       } else {
  //         alert("Access token not found for this shop.");
  //       }
  //     } catch (error) {
  //       console.error("Error fetching product data:", error);
  //       alert("Failed to fetch product data.");
  //     }
  //   }
  //      hello();
  //   `);








  // display token


  // res.send(`
  //   async function hello(){
  //        const shop = window.location.hostname;

  //       alert('helloooooooooo');

  //       try {

  //         const tokenResponse = await fetch(\`https://server-page-xo9v.onrender.com/check-store?shop=\${shop}\`);
  //         const tokenData = await tokenResponse.json();

  //         if (tokenData && tokenData.accessToken) {
  //           alert("Access Token: " + tokenData.accessToken);
  //         } else {
  //           alert("Access token not found for this shop.");
  //         }
  //       } catch (error) {
  //         console.error("Error fetching token:", error);
  //         alert("Failed to fetch access token.");
  //       }
  //   }
  //      hello();
  //   `);
});




//   res.send(`
//   document.addEventListener("DOMContentLoaded", async () => {
//     const shop = window.location.hostname;

//     try {
//       const tokenResponse = await fetch(\`https://server-page-xo9v.onrender.com/check-store?shop=\${shop}\`);
//       const tokenData = await tokenResponse.json();
//       alert(tokenData);

//       if (!tokenData || !tokenData.accessToken) {
//         console.warn("Store not registered or access token not found.");
//         return;
//       }

//       const accessToken = tokenData.accessToken;
//       console.log(accessToken);
//       const pathParts = window.location.pathname.split("/");

//       if (pathParts[1] === "products" && pathParts[2]) {
//         const handle = pathParts[2];

//         const productResponse = await fetch(
//           \`https://\${shop}/admin/api/2024-04/products.json?handle=\${handle}\`,
//           {
//             method: "GET",
//             headers: {
//               "X-Shopify-Access-Token": accessToken,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         const productData = await productResponse.json();

//         if (productData.products && productData.products.length > 0) {
//         console.log('hello');
//           alert(\`Product Title: \${productData.products[0].title}\`);
//         } else {
//          console.log('Product not found.');
//           alert("Product not found.");
//         }
//       } else {
//         console.log('no Product found');
//         alert("No product found.");
//       }
//     } catch (error) {
//       console.error("Error fetching product data:", error);
//     }
//   });
// `);
// });



// app.get('server-script', async (req, res) => {
//   `
// document.addEventListener("DOMContentLoaded", async () => {
//   const shop = window.location.hostname; // Store name from URL

//   try {
//     const tokenResponse = await fetch(`https://server-page-xo9v.onrender.com/serve-script.js
// /check-store?shop=${shop}`);
// const tokenData = await tokenResponse.json();

// if (!tokenData || !tokenData.accessToken) {
//   console.warn("Store not registered or access token not found.");
//   return;
// }

// const accessToken = tokenData.accessToken;

// const pathParts = window.location.pathname.split("/");
// if (pathParts[1] === "products" && pathParts[2]) {
//   const handle = pathParts[2];

//   const productResponse = await fetch(
//     `https://${shop}/admin/api/2024-04/products.json?handle=${handle}`,
//     {
//       method: "GET",
//       headers: {
//         "X-Shopify-Access-Token": accessToken,
//         "Content-Type": "application/json",
//       },
//     }
//   );
//   const productData = await productResponse.json();

//   if (productData.products && productData.products.length > 0) {
//     alert(`Product Title: ${productData.products[0].title}`);
//   } else {
//     alert("Product not found.");
//   }
// } else {
//   alert("No product found.");
// }
//   } catch (error) {
//   console.error("Error fetching product data:", error);
// }
// });

// })








app.get('/', (req, res) => {
  //   res.send(`document.addEventListener("DOMContentLoaded", function () {
  //   if (window.location.pathname.startsWith('/products/')) {
  //     console.log("This is a product page.");
  //     alert("Product Page);
  //   }
  // });`);

  //   res.send(`
  //   function checkProductsPage() {
  //     const currentPath = window.location.pathname;

  //     if (currentPath.includes('/products')) {
  //       console.log("You're on the products page!");

  //       alert("Welcome to the Products Page!");
  //     }
  //   }

  //   checkProductsPage();
  //   `)
  // });


  //   res.send(`
  //   document.addEventListener("DOMContentLoaded", async () => {
  //     const urlParts = window.location.pathname.split("/");
  //     const handle = urlParts[urlParts.length - 1];

  //     const query = \`
  //       query getProductByHandle($handle: String!) {
  //         productByHandle(handle: $handle) {
  //           title
  //         }
  //       }
  //     \`;

  //     const response = await fetch("/api/graphql", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //         "X-Shopify-Storefront-Access-Token": "shpua_f467a9bdebce1123d2cef6ab05d54d39"
  //       },
  //       body: JSON.stringify({ query, variables: { handle } }),
  //     });

  //     const data = await response.json();
  //     const productTitle = data.data.productByHandle ? data.data.productByHandle.title : "Product not found";

  //     alert(productTitle);
  //   });
  // `);
  // });



  res.send(`alert('hello')`)
});



app.get('/static/product-title-script.js', (req, res) => {
  res.send(`
    document.addEventListener("DOMContentLoaded", async () => {
      const urlParts = window.location.pathname.split("/");
      if (urlParts[1] === "products") {
        const handle = urlParts[urlParts.length - 1];
        
        try {
          const response = await fetch('/admin/api/products/' + handle);
          const product = await response.json();
          alert(product.title || "Product not found");
        } catch (error) {
          console.error("Error fetching product title:", error);
          alert("Error fetching product title");
        }
      }
    });
  `);
});





//   res.send(`

//     function displayProducts() {
//     alert("Hello");
//    if (window.location.pathname.includes('/products/')) {

//     const urlPath = window.location.pathname;
//     const productTitle = urlPath.split('/products/')[1].split('?')[0];

//     console.log("Product Title:", productTitle);
//     alert("Product Title: " + productTitle);
//   } else {
//     console.error('Not on a product page.');
//   }

// displayProducts();


//   `)
// });








// app.get("/remove-script.js", (req, res) => {
//   res.set("Content-Type", "application/javascript");

//   res.send(`
//     const shop = window.location.hostname;

//     async function removeProductSchema() {
//       try {
//         const tokenResponse = await fetch(\`https://server-page-xo9v.onrender.com/check-store?shop=\${shop}\`);
//         const tokenData = await tokenResponse.json();

//         if (tokenData && tokenData.accessToken) {
//           const accessToken = tokenData.accessToken;
//           const pathParts = window.location.pathname.split("/");

//           if (pathParts[1] === "products") {
//             const handle = pathParts[2];

//             if (handle) {
//               // Remove schema for a single product if on a specific product page
//               const singleProductSchema = document.querySelector(\`script[data-product-handle="\${handle}"]\`);
//               if (singleProductSchema) {
//                 document.head.removeChild(singleProductSchema);
//                 console.log(\`JSON-LD schema removed for product handle: \${handle}\`);
//               } else {
//                 console.warn(\`Schema not found for product handle: \${handle}\`);
//               }
//             } else {
//               // Remove all product schemas if on the /products listing page
//               const allProductSchemas = document.querySelectorAll('script[data-product-handle]');
//               allProductSchemas.forEach(script => document.head.removeChild(script));
//               console.log("All JSON-LD schemas removed for products.");
//             }
//           } else {
//             console.warn("Not on products page.");
//           }
//         } else {
//           console.warn("Access token not found for this shop.");
//         }
//       } catch (error) {
//         console.error("Error fetching product data:", error);
//       }
//     }

//     // Function call to initiate schema removal
//     removeProductSchema();
//   `);


// });







app.get('/remove-server-script', (req, res) => {
  res.set("Content-Type", "application/javascript");

  // JavaScript to remove the script tag
  res.send(`
    async function removeServerScript() {
      const scriptUrl = "https://server-page-xo9v.onrender.com/server-script.js";
      
      // Find the script tag
      const scriptTag = document.querySelector('script[src="' + scriptUrl + '"]');
      if (scriptTag) {
        scriptTag.parentNode.removeChild(scriptTag);
        console.log("Server script removed successfully.");
      } else {
        console.warn("Server script not found.");
      }
    }
  
    removeServerScript();
  `);

});






// insert scripttag for remove product from head


app.get('/removetag/:shopname', async (req, res) => {

  // const shop = 'demosaurav.myshopify.com';
  // const shop = window.location.hostname;
  const shop = req.params.shopname;
  // const store = await Shop.findOne({ shop });
  // const accessToken = store.accessToken;

  // if (!store) {
  //   return res.status(404).json({ message: "Store not registered." });
  // }

  const scriptUrl = "https://server-page-xo9v.onrender.com/product-script.js";
  // const scriptUrl = "https://server-page-xo9v.onrender.com/remove-schema-script.js";

  try {
    // Fetch shop data
    // const store = await Shop.findOne({ shop });
    const shopData = await Shop.findOne({ shop });
    console.log(shopData);

    if (!shopData || !shopData.accessToken) {
      return res.status(404).json({ message: `No access token found for store ${shop}` });
    }

    const accessToken = shopData.accessToken;

    // Step 1: Check for existing script tags
    const existingResponse = await axios.get(`https://${shop}/admin/api/2024-10/script_tags.json`, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    const existingData = existingResponse.data;

    // Step 2: Normalize the script URL
    const normalizedScriptUrl = new URL(scriptUrl).href;

    // Step 3: Find the script tag ID to remove
    const scriptTag = existingData.script_tags.find(tag => new URL(tag.src).href === normalizedScriptUrl);

    if (scriptTag) {
      // Step 4: Remove the script tag
      await axios.delete(`https://${shop}/admin/api/2024-10/script_tags/${scriptTag.id}.json`, {
        headers: {
          "X-Shopify-Access-Token": accessToken,
          "Content-Type": "application/json",
        },
      });

      console.log(`Script tag removed for store ${shop}`);
      return res.status(200).json({ message: `Script tag removed for store ${shop}` });
    } else {
      console.log(`No matching script tag found for store ${shop}`);
      return res.status(404).json({ message: `No matching script tag found for store ${shop}` });
    }
  } catch (error) {
    console.error(`Error removing script tag for store ${shop}:`, error.message);
    return res.status(500).json({ message: `Error removing script tag for store ${shop}`, error: error.message });
  }
});







// app.get("/all-script.js", (req, res) => {
//   res.set("Content-Type", "application/javascript");
//   res.send(`
//     const shop = window.location.hostname;

//     async function insertSchemaBasedOnPage() {
//       try {
//         const tokenResponse = await fetch(\`https://server-page-xo9v.onrender.com/check-store?shop=\${shop}\`);
//         const tokenData = await tokenResponse.json();

//         if (tokenData && tokenData.accessToken) {
//           const accessToken = tokenData.accessToken;
//           const pathParts = window.location.pathname.split("/");

//           if (pathParts[1] === "products") {
//             // Handle Product Schema
//             await insertProductSchema(accessToken, shop, pathParts);
//           } else if (pathParts[1] === "collections") {
//             // Handle Collection Schema
//             await insertCollectionSchema(accessToken, shop, pathParts);
//           } else if (pathParts[1] === "blogs" && pathParts[3] === "articles") {
//             // Handle Article Schema
//             await insertArticleSchema(accessToken, shop, pathParts);
//           } else if (pathParts[1] === "blogs") {
//             // Handle Blog Schema
//             await insertBlogSchema(accessToken, shop, pathParts);
//           } else {
//             console.warn("Not on a products, collections, blogs, or articles page.");
//           }
//         } else {
//           console.warn("Access token not found for this shop.");
//         }
//       } catch (error) {
//         console.error("Error fetching schema data:", error);
//       }
//     }

//     // Product Schema Insertion
//     async function insertProductSchema(accessToken, shop, pathParts) {
//       const handle = pathParts[2];
//       try {
//         let productData;
//         if (handle) {
//           const productResponse = await fetch(
//             \`https://\${shop}/admin/api/2024-04/products.json?handle=\${handle}\`,
//             {
//               method: "GET",
//               headers: {
//                 "X-Shopify-Access-Token": accessToken,
//                 "Content-Type": "application/json",
//               },
//             }
//           );
//           productData = await productResponse.json();
//           if (productData.products && productData.products.length > 0) {
//             const product = productData.products[0];
//             insertProductSchemaData(product, shop);
//           } else {
//             console.warn("Product not found.");
//           }
//         }
//       } catch (error) {
//         console.error("Error fetching product data:", error);
//       }
//     }

//     // Collection Schema Insertion
//     async function insertCollectionSchema(accessToken, shop, pathParts) {
//       const handle = pathParts[2];
//       try {
//         let collectionData;
//         const collectionResponse = await fetch(
//           \`https://\${shop}/admin/api/2024-04/collections.json?handle=\${handle}\`,
//           {
//             method: "GET",
//             headers: {
//               "X-Shopify-Access-Token": accessToken,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         collectionData = await collectionResponse.json();
//         if (collectionData.collections && collectionData.collections.length > 0) {
//           const collection = collectionData.collections[0];
//           insertCollectionSchemaData(collection, shop);
//         } else {
//           console.warn("Collection not found.");
//         }
//       } catch (error) {
//         console.error("Error fetching collection data:", error);
//       }
//     }

//     // Article Schema Insertion
//     async function insertArticleSchema(accessToken, shop, pathParts) {
//       const blogHandle = pathParts[2];
//       const articleHandle = pathParts[4];
//       try {
//         let articleData;
//         const articleResponse = await fetch(
//           \`https://\${shop}/admin/api/2024-04/blogs/\${blogHandle}/articles.json?handle=\${articleHandle}\`,
//           {
//             method: "GET",
//             headers: {
//               "X-Shopify-Access-Token": accessToken,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         articleData = await articleResponse.json();
//         if (articleData.articles && articleData.articles.length > 0) {
//           const article = articleData.articles[0];
//           insertArticleSchemaData(article, shop);
//         } else {
//           console.warn("Article not found.");
//         }
//       } catch (error) {
//         console.error("Error fetching article data:", error);
//       }
//     }

//     // Blog Schema Insertion
//     async function insertBlogSchema(accessToken, shop, pathParts) {
//       const handle = pathParts[2];
//       try {
//         let blogData;
//         const blogResponse = await fetch(
//           \`https://\${shop}/admin/api/2024-04/blogs.json?handle=\${handle}\`,
//           {
//             method: "GET",
//             headers: {
//               "X-Shopify-Access-Token": accessToken,
//               "Content-Type": "application/json",
//             },
//           }
//         );
//         blogData = await blogResponse.json();
//         if (blogData.blogs && blogData.blogs.length > 0) {
//           const blog = blogData.blogs[0];
//           insertBlogSchemaData(blog, shop);
//         } else {
//           console.warn("Blog not found.");
//         }
//       } catch (error) {
//         console.error("Error fetching blog data:", error);
//       }
//     }

//     // Insert Product Schema Data
//     function insertProductSchemaData(product, shop) {
//       const schemaData = {
//         "@context": "https://schema.org/",
//         "@type": "Product",
//         "name": product.title,
//         "image": product.images.map(image => image.src),
//         "description": product.body_html.replace(/<[^>]*>/g, ""),
//         "sku": product.variants[0].sku,
//         "brand": { "@type": "Brand", "name": product.vendor },
//         "offers": {
//           "@type": "Offer",
//           "price": product.variants[0].price,
//           "priceCurrency": product.variants[0].currency,
//           "availability": product.variants[0].inventory_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
//           "url": window.location.href,
//           "seller": { "@type": "Organization", "name": shop }
//         }
//       };
//       insertSchemaToDOM(schemaData);
//     }

//     // Insert Collection Schema Data
//     function insertCollectionSchemaData(collection, shop) {
//       const schemaData = {
//         "@context": "https://schema.org/",
//         "@type": "Collection",
//         "name": collection.title,
//         "description": collection.body_html.replace(/<[^>]*>/g, ""),
//         "url": window.location.href,
//         "seller": { "@type": "Organization", "name": shop }
//       };
//       insertSchemaToDOM(schemaData);
//     }

//     // Insert Article Schema Data
//     function insertArticleSchemaData(article, shop) {
//       const schemaData = {
//         "@context": "https://schema.org/",
//         "@type": "Article",
//         "headline": article.title,
//         "author": article.author,
//         "datePublished": article.published_at,
//         "url": window.location.href
//       };
//       insertSchemaToDOM(schemaData);
//     }

//     // Insert Blog Schema Data
//     function insertBlogSchemaData(blog, shop) {
//       const schemaData = {
//         "@context": "https://schema.org/",
//         "@type": "Blog",
//         "name": blog.title,
//         "description": blog.body_html.replace(/<[^>]*>/g, ""),
//         "url": window.location.href
//       };
//       insertSchemaToDOM(schemaData);
//     }

//     // Function to insert schema into the DOM
//     function insertSchemaToDOM(schemaData) {
//       const script = document.createElement("script");
//       script.type = "application/ld+json";
//       script.text = JSON.stringify(schemaData);
//       document.head.appendChild(script);
//       console.log("JSON-LD schema inserted:", schemaData);
//     }

//     insertSchemaBasedOnPage();
//   `);
// });




app.get("/product-script.js", (req, res) => {
  res.set("Content-Type", "application/javascript");
  res.send(`
    const shop = window.location.hostname;

    async function insertProductSchema() {
      try {
        const tokenResponse = await fetch(\`https://server-page-xo9v.onrender.com/check-store?shop=\${shop}\`);
        const tokenData = await tokenResponse.json();

        if (tokenData && tokenData.accessToken) {
          const accessToken = tokenData.accessToken;
          const pathParts = window.location.pathname.split("/");

          // Check if on the product page
          if (pathParts[1] === "products") {
            const handle = pathParts[2];
            if (handle) {
              await fetchProductAndInsertSchema(accessToken, shop, handle);
            } else {
              console.warn("Product handle not found in the URL.");
            }
          } else {
            console.warn("Not on a product page.");
          }
        } else {
          console.warn("Access token not found for this shop.");
        }
      } catch (error) {
        console.error("Error fetching schema data:", error);
      }
    }

    async function fetchProductAndInsertSchema(accessToken, shop, handle) {
      try {
        const productResponse = await fetch(
          \`https://\${shop}/admin/api/2024-04/products.json?handle=\${handle}\`,
          {
            method: "GET",
            headers: {
              "X-Shopify-Access-Token": accessToken,
              "Content-Type": "application/json",
            }
          }
        );
        
        const productData = await productResponse.json();
        
        if (productData.products && productData.products.length > 0) {
          const product = productData.products[0];
          insertProductSchemaData(product, shop);
        } else {
          console.warn("Product not found.");
        }
      } catch (error) {
        console.error("Error fetching product data:", error);
      }
    }

    function insertProductSchemaData(product, shop) {
      const schemaData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.title,
        "shipping_fee":100,
        "Shipping_Country":"India",
        "image": product.images.map(image => image.src),
        "description": product.body_html.replace(/<[^>]*>/g, ""),
        "sku": product.variants[0].sku,
        "brand": { "@type": "Brand", "name": product.vendor },
        "offers": {
          "@type": "Offer",
          "price": product.variants[0].price,
          "priceCurrency": product.variants[0].currency,
          "availability": product.variants[0].inventory_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "url": window.location.href,
          "seller": { "@type": "Organization", "name": shop }
        }
      };
      insertSchemaToDOM(schemaData);
    }

    function insertSchemaToDOM(schemaData) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(schemaData);
      document.head.appendChild(script);
      console.log("JSON-LD product schema inserted:", schemaData);
    }

    insertProductSchema();
  `);
});




// app.get('/remove-product-schema/:shopname', async (req, res) => {
//   const shop = req.params.shopname;
//   const scriptUrl = "https://server-page-xo9v.onrender.com/product-script.js"; // Assuming this is the URL where the schema is injected.

//   try {
//     // Fetch shop data (replace this with your actual way of getting accessToken)
//     const shopData = await Shop.findOne({ shop });
//     if (!shopData || !shopData.accessToken) {
//       return res.status(404).json({ message: `No access token found for store ${shop}` });
//     }

//     const accessToken = shopData.accessToken;

//     // Step 1: Fetch script tags for the shop
//     const existingResponse = await axios.get(`https://${shop}/admin/api/2024-10/script_tags.json`, {
//       headers: {
//         "X-Shopify-Access-Token": accessToken,
//         "Content-Type": "application/json",
//       },
//     });

//     const existingData = existingResponse.data;

//     // Step 2: Normalize the script URL to find the correct tag
//     const normalizedScriptUrl = new URL(scriptUrl).href;

//     // Step 3: Find the script tag that has the product schema
//     const scriptTag = existingData.script_tags.find(tag => new URL(tag.src).href === normalizedScriptUrl);

//     if (scriptTag) {
//       // Step 4: Fetch the current script content (assuming the script content is dynamically injected or fetched by the store)
//       const scriptContentResponse = await axios.get(scriptUrl);
//       let scriptContent = scriptContentResponse.data;

//       // Step 5: Remove the product schema (modify the content of the script)
//       const schemaStart = scriptContent.indexOf('"@type": "Product"');
//       if (schemaStart !== -1) {
//         // Identify the product schema block and remove it
//         const schemaEnd = scriptContent.indexOf('}', schemaStart) + 1;
//         const productSchema = scriptContent.slice(schemaStart, schemaEnd);
//         scriptContent = scriptContent.replace(productSchema, '');

//         // (Optional) If needed, upload or inject the updated scriptContent back to the store
//         console.log("Product schema removed:", productSchema);
//         return res.status(200).json({ message: `Product schema removed for store ${shop}` });
//       } else {
//         return res.status(404).json({ message: `No product schema found for store ${shop}` });
//       }
//     } else {
//       return res.status(404).json({ message: `No matching script tag found for store ${shop}` });
//     }
//   } catch (error) {
//     console.error(`Error removing product schema for store ${shop}:`, error.message);
//     return res.status(500).json({ message: `Error removing product schema for store ${shop}`, error: error.message });
//   }
// });




// app.get('/remove-product-schema/:shopname', async (req, res) => {
//   const shop = req.params.shopname;
//   const scriptUrl = "https://server-page-xo9v.onrender.com/product-script.js"; // URL where schema was injected

//   try {
//     // Fetch shop data (replace this with your actual method to get accessToken)
//     const shopData = await Shop.findOne({ shop });
//     if (!shopData || !shopData.accessToken) {
//       return res.status(404).json({ message: `No access token found for store ${shop}` });
//     }

//     const accessToken = shopData.accessToken;

//     // Step 1: Fetch script tags for the shop
//     const scriptTagsResponse = await axios.get(`https://${shop}/admin/api/2024-10/script_tags.json`, {
//       headers: {
//         "X-Shopify-Access-Token": accessToken,
//         "Content-Type": "application/json",
//       },
//     });

//     const scriptTags = scriptTagsResponse.data.script_tags;

//     // Step 2: Normalize the script URL to match the one you inserted
//     const normalizedScriptUrl = new URL(scriptUrl).href;

//     // Step 3: Find the script tag that matches your script URL
//     const matchingScriptTag = scriptTags.find(tag => new URL(tag.src).href === normalizedScriptUrl);

//     if (matchingScriptTag) {
//       // Step 4: Fetch the content of the script from the URL
//       const scriptContentResponse = await axios.get(scriptUrl);
//       let scriptContent = scriptContentResponse.data;

//       // Step 5: Find and remove the product schema in the script
//       const schemaStart = scriptContent.indexOf('"@type": "Product"');
//       if (schemaStart !== -1) {
//         // Identify the schema block and remove it
//         const schemaEnd = scriptContent.indexOf('}', schemaStart) + 1;
//         const productSchema = scriptContent.slice(schemaStart, schemaEnd);
//         scriptContent = scriptContent.replace(productSchema, '');

//         // Step 6: (Optional) Re-inject the updated script back to the store
//         console.log("Product schema removed:", productSchema);
//         return res.status(200).json({ message: `Product schema removed for store ${shop}` });
//       } else {
//         return res.status(404).json({ message: `No product schema found in the script for store ${shop}` });
//       }
//     } else {
//       return res.status(404).json({ message: `No matching script tag found for store ${shop}` });
//     }
//   } catch (error) {
//     console.error(`Error removing product schema for store ${shop}:`, error.message);
//     return res.status(500).json({ message: `Error removing product schema for store ${shop}`, error: error.message });
//   }
// });





// app.get('/remove-schema-script.js', async (req, res) => {
//   res.set("Content-Type", "application/javascript");

//   res.send(`

// // Find all JSON-LD script tags
// const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');

// // Loop through each script tag and remove those with "@type": "Product"
// jsonLdScripts.forEach((script, index) => {
//   try {
//     // Parse the script content
//     const scriptContent = JSON.parse(script.textContent);

//     // Check if the script contains a Product schema
//     if (scriptContent['@type'] === 'Product') {
//       console.log("Removing Product Schema :", scriptContent);
//       script.remove(); 
//     } else {

//     console.log("Keeping Schema :", scriptContent);
//     }
//   } catch (error) {
//     console.error("Error parsing schema at index ", error);
//   }
// });

// `)
// });

















// app.get('/remove-product-schema/:shopname', async (req, res) => {
//   const shop = req.params.shopname;
//   const removalScriptUrl = "https://server-page-xo9v.onrender.com/remove-schema-script.js"; // This script contains the logic to remove the schema.

//   try {
//     const shopData = await Shop.findOne({ shop });
//     if (!shopData || !shopData.accessToken) {
//       return res.status(404).json({ message: `No access token found for store ${shop}` });
//     }

//     const accessToken = shopData.accessToken;

//     // Step 1: Check if the removal script is already added
//     const scriptTagsResponse = await axios.get(`https://${shop}/admin/api/2024-10/script_tags.json`, {
//       headers: {
//         "X-Shopify-Access-Token": accessToken,
//         "Content-Type": "application/json",
//       },
//     });

//     const scriptTags = scriptTagsResponse.data.script_tags;

//     // Step 2: Check if the removal script is already present
//     const matchingScriptTag = scriptTags.find(tag => tag.src === removalScriptUrl);
//     if (matchingScriptTag) {
//       return res.status(200).json({ message: "Schema removal script is already injected." });
//     }

//     // Step 3: If not, inject the script tag that removes the product schema
//     await axios.post(`https://${shop}/admin/api/2024-10/script_tags.json`, {
//       script_tag: {
//         event: "onload",
//         src: removalScriptUrl
//       }
//     }, {
//       headers: {
//         "X-Shopify-Access-Token": accessToken,
//         "Content-Type": "application/json",
//       }
//     });

//     return res.status(200).json({ message: `Schema removal script injected successfully for store ${shop}` });
//   } catch (error) {
//     console.error(`Error injecting schema removal script for store ${shop}:`, error.message);
//     return res.status(500).json({ message: `Error injecting schema removal script for store ${shop}`, error: error.message });
//   }
// });











// app.get("/newproduct-script.js", (req, res) => {
//   res.set("Content-Type", "application/javascript");
//   res.send(`
//     const shop = window.location.hostname;

//     async function insertProductSchema() {
//       try {
//         const tokenResponse = await fetch(\`https://server-page-xo9v.onrender.com/check-store?shop=\${shop}\`);
//         const tokenData = await tokenResponse.json();

//         if (tokenData && tokenData.accessToken) {
//           const accessToken = tokenData.accessToken;
//           const pathParts = window.location.pathname.split("/");

//           // Fetch the isEnabled state
//           const stateResponse = await fetch(\`https://server-page-xo9v.onrender.com/check-schema-state/\${shop}\`);
//           const stateData = await stateResponse.json();

//           // Only proceed if schema is enabled
//           if (stateData.isEnabled) {
//             // Check if on a product page
//             if (pathParts[1] === "products") {
//               const handle = pathParts[2];
//               if (handle) {
//                 await fetchProductAndInsertSchema(accessToken, shop, handle);
//               } else {
//                 console.warn("Product handle not found in the URL.");
//               }
//             } else {
//               console.warn("Not on a product page.");
//             }
//           } else {
//             console.log("Product schema is disabled.");
//           }
//         } else {
//           console.warn("Access token not found for this shop.");
//         }
//       } catch (error) {
//         console.error("Error fetching schema data:", error);
//       }
//     }

//     async function fetchProductAndInsertSchema(accessToken, shop, handle) {
//       try {
//         const productResponse = await fetch(
//           \`https://\${shop}/admin/api/2024-04/products.json?handle=\${handle}\`,
//           {
//             method: "GET",
//             headers: {
//               "X-Shopify-Access-Token": accessToken,
//               "Content-Type": "application/json",
//             }
//           }
//         );

//         const productData = await productResponse.json();

//         if (productData.products && productData.products.length > 0) {
//           const product = productData.products[0];
//           insertProductSchemaData(product, shop);
//         } else {
//           console.warn("Product not found.");
//         }
//       } catch (error) {
//         console.error("Error fetching product data:", error);
//       }
//     }

//     function insertProductSchemaData(product, shop) {
//       const schemaData = {
//         "@context": "https://schema.org/",
//         "@type": "Product",
//         "name": product.title,
//         "shipping_fee": 100,
//         "Shipping_Country": "India",
//         "image": product.images.map(image => image.src),
//         "description": product.body_html.replace(/<[^>]*>/g, ""),
//         "sku": product.variants[0].sku,
//         "brand": { "@type": "Brand", "name": product.vendor },
//         "offers": {
//           "@type": "Offer",
//           "price": product.variants[0].price,
//           "priceCurrency": product.variants[0].currency,
//           "availability": product.variants[0].inventory_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
//           "url": window.location.href,
//           "seller": { "@type": "Organization", "name": shop }
//         }
//       };
//       insertSchemaToDOM(schemaData);
//     }

//     function insertSchemaToDOM(schemaData) {
//       const script = document.createElement("script");
//       script.type = "application/ld+json";
//       script.text = JSON.stringify(schemaData);
//       document.head.appendChild(script);
//       console.log("JSON-LD product schema inserted:", schemaData);
//     }

//     insertProductSchema();
//   `);
// });







// insert but unable to remove


// app.get("/newproduct-script.js", (req, res) => {
//   res.set("Content-Type", "application/javascript");
//   res.send(`
//     const shop = window.location.hostname;

//     async function insertProductSchema() {
//       try {
//         const tokenResponse = await fetch('https://server-page-xo9v.onrender.com/check-store?shop=' + shop);
//         const tokenData = await tokenResponse.json();

//         if (tokenData && tokenData.accessToken) {
//           const accessToken = tokenData.accessToken;
//           const pathParts = window.location.pathname.split("/");

//           // Fetch the isEnabled state
//           const stateResponse = await fetch('https://server-page-xo9v.onrender.com/check-schema-state/' + shop);
//           const stateData = await stateResponse.json();

//           // Check if on a product page
//           if (pathParts[1] === "products") {
//             const handle = pathParts[2];
//             if (handle) {
//               if (stateData.isEnabled) {
//                 // If schema is enabled, insert schema
//                 await fetchProductAndInsertSchema(accessToken, shop, handle);
//               } else {
//                 // If schema is disabled, remove schema
//                 removeProductSchema();
//                 console.log("Product schema is disabled.");
//               }
//             } else {
//               console.warn("Product handle not found in the URL.");
//             }
//           } else {
//             console.warn("Not on a product page.");
//           }
//         } else {
//           console.warn("Access token not found for this shop.");
//         }
//       } catch (error) {
//         console.error("Error fetching schema data:", error);
//       }
//     }

//     async function fetchProductAndInsertSchema(accessToken, shop, handle) {
//       try {
//         const productResponse = await fetch(
//           'https://' + shop + '/admin/api/2024-04/products.json?handle=' + handle,
//           {
//             method: "GET",
//             headers: {
//               "X-Shopify-Access-Token": accessToken,
//               "Content-Type": "application/json",
//             }
//           }
//         );

//         const productData = await productResponse.json();

//         if (productData.products && productData.products.length > 0) {
//           const product = productData.products[0];
//           insertProductSchemaData(product, shop);
//         } else {
//           console.warn("Product not found.");
//         }
//       } catch (error) {
//         console.error("Error fetching product data:", error);
//       }
//     }

//     function insertProductSchemaData(product, shop) {
//       const schemaData = {
//         "@context": "https://schema.org/",
//         "@type": "Product",
//         "name": product.title,
//         "shipping_fee": 100,
//         "Shipping_Country": "India",
//         "image": product.images.map(image => image.src),
//         "description": product.body_html.replace(/<[^>]*>/g, ""),
//         "sku": product.variants[0].sku,
//         "brand": { "@type": "Brand", "name": product.vendor },
//         "offers": {
//           "@type": "Offer",
//           "price": product.variants[0].price,
//           "priceCurrency": product.variants[0].currency,
//           "availability": product.variants[0].inventory_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
//           "url": window.location.href,
//           "seller": { "@type": "Organization", "name": shop }
//         }
//       };
//       insertSchemaToDOM(schemaData);
//     }

//     function insertSchemaToDOM(schemaData) {
//       const script = document.createElement("script");
//       script.type = "application/ld+json";
//       script.text = JSON.stringify(schemaData);
//       document.head.appendChild(script);
//       console.log("JSON-LD product schema inserted:", schemaData);
//     }

//     // Function to remove the existing product schema
//     function removeProductSchema() {
//       const existingSchema = document.querySelector('script[type="application/ld+json"]');
//       if (existingSchema) {
//         existingSchema.remove(); // Remove the schema script tag if it exists
//         console.log("Product schema removed.");
//       }
//     }

//     // Call the function to manage the schema
//     insertProductSchema();
//   `);
// });




// app.get("/newproduct-script.js", (req, res) => {
//   res.set("Content-Type", "application/javascript");
//   res.send(`
//     const shop = window.location.hostname;

//     async function insertProductSchema() {
//       try {
//         const tokenResponse = await fetch('https://server-page-xo9v.onrender.com/check-store?shop=' + shop);
//         const tokenData = await tokenResponse.json();

//         if (tokenData && tokenData.accessToken) {
//           const accessToken = tokenData.accessToken;
//           const pathParts = window.location.pathname.split("/");

//           // Fetch the isEnabled state
//           const stateResponse = await fetch('https://server-page-xo9v.onrender.com/check-schema-state/' + shop);
//           const stateData = await stateResponse.json();

//           // Check if on a product page
//           if (pathParts[1] === "products") {
//             const handle = pathParts[2];
//             if (handle) {
//               if (stateData.isEnabled == 'true') {
//                 // If schema is enabled, insert schema
//                 await fetchProductAndInsertSchema(accessToken, shop, handle);
//               } else {
//                 // If schema is disabled, remove schema
//                 removeProductSchema();
//                 console.log("Product schema is disabled.");
//               }
//             } else {
//               console.warn("Product handle not found in the URL.");
//             }
//           } else {
//             console.warn("Not on a product page.");
//           }
//         } else {
//           console.warn("Access token not found for this shop.");
//         }
//       } catch (error) {
//         console.error("Error fetching schema data:", error);
//       }
//     }

//     async function fetchProductAndInsertSchema(accessToken, shop, handle) {
//       try {
//         const productResponse = await fetch(
//           'https://' + shop + '/admin/api/2024-04/products.json?handle=' + handle,
//           {
//             method: "GET",
//             headers: {
//               "X-Shopify-Access-Token": accessToken,
//               "Content-Type": "application/json",
//             }
//           }
//         );

//         const productData = await productResponse.json();

//         if (productData.products && productData.products.length > 0) {
//           const product = productData.products[0];
//           insertProductSchemaData(product, shop);
//         } else {
//           console.warn("Product not found.");
//         }
//       } catch (error) {
//         console.error("Error fetching product data:", error);
//       }
//     }

//     function insertProductSchemaData(product, shop) {
//       const schemaData = {
//         "@context": "https://schema.org/",
//         "@type": "Product",
//         "name": product.title,
//         "shipping_fee": 800,
//         "Shipping_Country": "India",
//         "image": product.images.map(image => image.src),
//         "description": product.body_html.replace(/<[^>]*>/g, ""),
//         "sku": product.variants[0].sku,
//         "brand": { "@type": "Brand", "name": product.vendor },
//         "offers": {
//           "@type": "Offer",
//           "price": product.variants[0].price,
//           "priceCurrency": product.variants[0].currency,
//           "availability": product.variants[0].inventory_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
//           "url": window.location.href,
//           "seller": { "@type": "Organization", "name": shop }
//         }
//       };
//       insertSchemaToDOM(schemaData);
//     }

//     function insertSchemaToDOM(schemaData) {
//       const script = document.createElement("script");
//       script.type = "application/ld+json";
//       script.text = JSON.stringify(schemaData);
//       document.head.appendChild(script);
//       console.log("JSON-LD product schema inserted:", schemaData);
//     }

//     // Function to remove all relevant product schema
//     function removeProductSchema() {
//       const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
//       jsonLdScripts.forEach((script) => {
//         try {
//           const schemaData = JSON.parse(script.textContent);
//           if (schemaData['@type'] === "Product") {
//             script.remove(); // Remove only the product-related schema
//             console.log("Product schema removed.");
//           }
//         } catch (error) {
//           console.error("Error parsing JSON-LD schema for removal:", error);
//         }
//       });
//     }

//     // Call the function to manage the schema
//     insertProductSchema();
//   `);
// });




app.get("/newproduct-script.js", (req, res) => {
  res.set("Content-Type", "application/javascript");
  res.send(`
 alert('Hii, this is product script');
  `);
});




// Endpoint to check the schema state
app.get("/check-schema-state/:shopname", async (req, res) => {
  try {
    const shopName = req.params.shopname;
    const shop = await Shop.findOne({ shop: shopName });

    if (shop) {
      return res.status(200).json({ isEnabled: shop.isEnabled });
    } else {
      // If shop does not exist, create it with default state
      const newShop = new Shop({ shop: shopName });
      await newShop.save();
      return res.status(200).json({ isEnabled: newShop.isEnabled });
    }
  } catch (error) {
    console.error("Error fetching schema state:", error);
    res.status(500).json({ message: "Error fetching schema state" });
  }
});


app.post("/update-state/:shopname/:isEnable", async (req, res) => {
  try {
    const shopName = req.params.shopname;
    const value = req.params.isEnable;

    const updatedShop = await Shop.findOneAndUpdate(
      { shop: shopName }, // Find document by shopName
      { $set: { isEnabled: value } }, // Use $set to update only specific fields
      { new: true, upsert: false } // Return the updated document
    );
    res.status(200).send({ success: true, data: updatedShop })
  } catch (error) {
    res.status(500).json({ message: "Error fetching schema state" });

  }
})



// // Endpoint to check the schema state
// app.get("/check-state/:shopname/:schema", async (req, res) => {
//   try {
//     const shopName = req.params.shopname;
//     const schemaKey = req.params.schema;
//     const shop = await Shop.findOne({ shop: shopName });

//     if (shop) {
//       const schemaData = shop[schemaKey];

//       if (schemaData !== undefined) {
//         return res.status(200).json({ [schemaKey]: schemaData });
//       } else {
//         return res.status(404).json({ message: `${schemaKey} not found for this shop` });
//       }
//     } else {
//       // If shop does not exist, you can return an error or create the shop with default values
//       const newShop = new Shop({ shop: shopName });
//       await newShop.save();
//       return res.status(404).json({ message: "Shop not found, created new shop with default values." });
//     }
//   } catch (error) {
//     console.error("Error fetching schema state:", error);
//     res.status(500).json({ message: "Error fetching schema state" });
//   }
// });


// Endpoint to check the schema state
app.get("/check-state/:shopname", async (req, res) => {
  try {
    const shopName = req.params.shopname;
    const shop = await Shop.findOne({ shop: shopName });

    if (shop) {

      return res.status(200).json({ shop });

    } else {
      // If shop does not exist, you can return an error or create the shop with default values
      const newShop = new Shop({ shop: shopName });
      await newShop.save();
      return res.status(404).json({ message: "Shop not found, created new shop with default values." });
    }
  } catch (error) {
    console.error("Error fetching schema state:", error);
    res.status(500).json({ message: "Error fetching schema state" });
  }
});



// Endpoint to update the schema state
app.post("/update-state/:shopname/:schema/:value", async (req, res) => {
  try {
    const shopName = req.params.shopname;
    const schemaKey = req.params.schema; // Get the schema key from params
    const value = req.params.value; // Get the value to be updated from params

    // Build the dynamic update object
    const update = { $set: { [schemaKey]: value } }; // Use [schemaKey] to dynamically update the specific field

    // Find the shop and update the schema field
    const updatedShop = await Shop.findOneAndUpdate(
      { shop: shopName }, // Find document by shopName
      update,             // Dynamic field update
      { new: true, upsert: false } // Return the updated document, don't create if not found
    );

    if (updatedShop) {
      return res.status(200).json({ success: true, data: updatedShop });
    } else {
      return res.status(404).json({ message: "Shop not found" });
    }
  } catch (error) {
    console.error("Error updating schema state:", error);
    res.status(500).json({ message: "Error updating schema state" });
  }
});




// app.get("/newschema-script.js", (req, res) => {
//   res.set("Content-Type", "application/javascript");
//   res.send(`
//     const shop = window.location.hostname;

//     async function insertSchemaBasedOnPage() {
//       try {
//         const tokenResponse = await fetch('https://server-page-xo9v.onrender.com/check-store?shop=' + shop);
//         const tokenData = await tokenResponse.json();

//         if (tokenData && tokenData.accessToken) {
//           const accessToken = tokenData.accessToken;
//           const pathParts = window.location.pathname.split("/");

//           // Fetch the isEnabled state for all schemas
//           const stateResponse = await fetch('https://server-page-xo9v.onrender.com/check-state/' + shop);
//           const stateData = await stateResponse.json();

//           // Identify the current page and inject the corresponding schema
//           if (pathParts[1] === "products" && pathParts[2]) {
//             const handle = pathParts[2];
//             if (stateData.isEnabled == 'true') {
//               await fetchProductAndInsertSchema(accessToken, shop, handle);
//             } else {
//               removeProductSchema();
//               console.log("Product schema is disabled.");
//             }
//           } else if (pathParts[1] === "collections" && pathParts[2]) {
//             const collectionHandle = pathParts[2];
//             if (stateData.collection_isEnabled == 'true') {
//               await fetchCollectionAndInsertSchema(accessToken, shop, collectionHandle);
//             } else {
//               removeCollectionSchema();
//               console.log("Collection schema is disabled.");
//             }
//           } else if (pathParts[1] == "pages") {
//             // Check for Breadcrumb, Article, etc.
//             if (stateData.breadcrumb_isEnabled == 'true') {
//               insertBreadcrumbSchema();
//             }
//             if (stateData.article_isEnabled == 'true') {
//               insertArticleSchema();
//             }
//           } else if (pathParts[1] == "video") {
//             if (stateData.video_isEnabled == 'true') {
//               insertVideoSchema();
//             }
//           }

//           // General schemas for all pages
//           if (stateData.organization_isEnabled === 'true') {
//             insertOrganizationSchema();
//           }
//           if (stateData.searchbox_isEnabled === 'true') {
//             insertSearchBoxSchema();
//           }
//           if (stateData.recipe_isEnabled === 'true') {
//             insertRecipeSchema();
//           }

//         } else {
//           console.warn("Access token not found for this shop.");
//         }
//       } catch (error) {
//         console.error("Error fetching schema data:", error);
//       }
//     }

//     // Product Schema
//     async function fetchProductAndInsertSchema(accessToken, shop, handle) {
//       try {
//         const productResponse = await fetch('https://' + shop + '/admin/api/2024-04/products.json?handle=' + handle, {
//           method: "GET",
//           headers: {
//             "X-Shopify-Access-Token": accessToken,
//             "Content-Type": "application/json",
//           }
//         });
//         const productData = await productResponse.json();

//         if (productData.products && productData.products.length > 0) {
//           const product = productData.products[0];
//           insertProductSchemaData(product, shop);
//         } else {
//           console.warn("Product not found.");
//         }
//       } catch (error) {
//         console.error("Error fetching product data:", error);
//       }
//     }

//     // Collection Schema
//     async function fetchCollectionAndInsertSchema(accessToken, shop, handle) {
//       try {
//         const collectionResponse = await fetch('https://' + shop + '/admin/api/2024-04/collections.json?handle=' + handle, {
//           method: "GET",
//           headers: {
//             "X-Shopify-Access-Token": accessToken,
//             "Content-Type": "application/json",
//           }
//         });
//         const collectionData = await collectionResponse.json();

//         if (collectionData.collections && collectionData.collections.length > 0) {
//           const collection = collectionData.collections[0];
//           insertCollectionSchemaData(collection, shop);
//         } else {
//           console.warn("Collection not found.");
//         }
//       } catch (error) {
//         console.error("Error fetching collection data:", error);
//       }
//     }

//     // Insert various schemas

//     function insertProductSchemaData(product, shop) {
//       const schemaData = {
//         "@context": "https://schema.org/",
//         "@type": "Product",
//         "name": product.title,
//         "image": product.images.map(image => image.src),
//         "description": product.body_html.replace(/<[^>]*>/g, ""),
//         "sku": product.variants[0].sku,
//         "brand": { "@type": "Brand", "name": product.vendor },
//         "offers": {
//           "@type": "Offer",
//           "price": product.variants[0].price,
//           "priceCurrency": product.variants[0].currency,
//           "availability": product.variants[0].inventory_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
//           "url": window.location.href,
//           "seller": { "@type": "Organization", "name": shop }
//         }
//       };
//       insertSchemaToDOM(schemaData);
//     }

//     function insertCollectionSchemaData(collection, shop) {
//       const schemaData = {
//         "@context": "https://schema.org/",
//         "@type": "Collection",
//         "name": collection.title,
//         "description": collection.body_html.replace(/<[^>]*>/g, ""),
//         "url": window.location.href
//       };
//       insertSchemaToDOM(schemaData);
//     }

//     function insertOrganizationSchema() {
//       const schemaData = {
//         "@context": "https://schema.org/",
//         "@type": "Organization",
//         "name": shop,
//         "url": window.location.href
//       };
//       insertSchemaToDOM(schemaData);
//     }

//     function insertBreadcrumbSchema() {
//       const schemaData = {
//         "@context": "https://schema.org/",
//         "@type": "BreadcrumbList",
//         "itemListElement": [
//           {
//             "@type": "ListItem",
//             "position": 1,
//             "name": "Home",
//             "item": window.location.origin
//           },
//           {
//             "@type": "ListItem",
//             "position": 2,
//             "name": "Page",
//             "item": window.location.href
//           }
//         ]
//       };
//       insertSchemaToDOM(schemaData);
//     }

//     function insertVideoSchema() {
//       const schemaData = {
//         "@context": "https://schema.org/",
//         "@type": "VideoObject",
//         "name": "Sample Video",
//         "description": "This is a sample video description",
//         "thumbnailUrl": "https://example.com/video-thumbnail.jpg",
//         "uploadDate": "2024-01-01",
//         "contentUrl": window.location.href
//       };
//       insertSchemaToDOM(schemaData);
//     }

//     function insertArticleSchema() {
//       const schemaData = {
//         "@context": "https://schema.org/",
//         "@type": "Article",
//         "headline": "Sample Article",
//         "author": "Author Name",
//         "datePublished": "2024-01-01",
//         "url": window.location.href
//       };
//       insertSchemaToDOM(schemaData);
//     }

//     function insertSearchBoxSchema() {
//       const schemaData = {
//         "@context": "https://schema.org/",
//         "@type": "WebSite",
//         "url": window.location.href,
//         "potentialAction": {
//           "@type": "SearchAction",
//           "target": window.location.origin + "/search?q={search_term_string}",
//           "query-input": "required name=search_term_string"
//         }
//       };
//       insertSchemaToDOM(schemaData);
//     }

//     function insertSiteNameSchema() {
//       const schemaData = {
//         "@context": "https://schema.org/",
//         "@type": "WebSite",
//         "name": shop,
//         "url": window.location.href
//       };
//       insertSchemaToDOM(schemaData);
//     }

//     function insertRecipeSchema() {
//       const schemaData = {
//         "@context": "https://schema.org/",
//         "@type": "Recipe",
//         "name": "Sample Recipe",
//         "recipeIngredient": ["Ingredient 1", "Ingredient 2"],
//         "recipeInstructions": ["Step 1", "Step 2"],
//         "url": window.location.href
//       };
//       insertSchemaToDOM(schemaData);
//     }

//     // Helper to insert schema data to DOM
//     function insertSchemaToDOM(schemaData) {
//       const script = document.createElement("script");
//       script.type = "application/ld+json";
//       script.text = JSON.stringify(schemaData);
//       document.head.appendChild(script);
//       console.log("JSON-LD schema inserted:", schemaData);
//     }

//     // Function to remove all relevant product schema
//     function removeProductSchema() {
//       removeSchemaByType("Product");
//     }

//     function removeCollectionSchema() {
//       removeSchemaByType("Collection");
//     }

//     function removeSchemaByType(schemaType) {
//       const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
//       jsonLdScripts.forEach((script) => {
//         try {
//           const schemaData = JSON.parse(script.textContent);
//           if (schemaData['@type'] === schemaType) {
//             script.remove(); // Remove only the schema related to the given type
//             console.log(schemaType + " schema removed.");
//           }
//         } catch (error) {
//           console.error("Error parsing JSON-LD schema:", error);
//         }
//       });
//     }

//     // Initialize schema insertion
//     insertSchemaBasedOnPage();
//   `);
// });





app.get("/newschema-script.js", (req, res) => {
  res.set("Content-Type", "application/javascript");
  res.send(`
    const shop = window.location.hostname;

    async function insertSchemaBasedOnPage() {
      try {
        const tokenResponse = await fetch('https://server-page-xo9v.onrender.com/check-store?shop=' + shop);
        const tokenData = await tokenResponse.json();

        if (tokenData && tokenData.accessToken) {
          const accessToken = tokenData.accessToken;
          const pathParts = window.location.pathname.split("/");

          // Fetch the isEnabled state for all schemas
          const stateResponse = await fetch('https://server-page-xo9v.onrender.com/check-state/' + shop);
          const stateDatas = await stateResponse.json();
          const stateData = stateDatas.shop;

          // Identify the current page and inject the corresponding schema
          if (pathParts[1] === "products" && pathParts[2]) {
            const handle = pathParts[2];
            if (stateData.isEnabled == 'true') {
            await insertProductSchemaData(shop, handle);
              // await fetchProductAndInsertSchema(accessToken, shop, handle);
            } else {
              removeProductSchema();
              console.log("Product schema is disabled.");
            }
          } else if (pathParts[1] === "collections" && pathParts[2]) {
            const collectionHandle = pathParts[2];
            if (stateData.collection_isEnabled == 'true') {
            insertCollectionSchemaData(collectionHandle, shop);
              // await fetchCollectionAndInsertSchema(accessToken, shop, collectionHandle);
            } else {
              removeCollectionSchema();
              console.log("Collection schema is disabled.");
            }
          } else if (pathParts[1] == "pages") {
            // Check for Breadcrumb, Article, etc.
            if (stateData.breadcrumb_isEnabled == 'true') {
              insertBreadcrumbSchema();
            } else {
              removeBreadcrumbSchema();
            }
            if (stateData.article_isEnabled == 'true') {
              insertArticleSchema();
            } else {
              removeArticleSchema();
            }
          } else if (pathParts[1] == "video") {
            if (stateData.video_isEnabled == 'true') {
              insertVideoSchema();
            } else {
              removeVideoSchema();
            }
          }

          // General schemas for all pages
          if (stateData.organization_isEnabled === 'true') {
            insertOrganizationSchema();
          } else {
            removeOrganizationSchema();
          }
          if (stateData.searchbox_isEnabled === 'true') {
            insertSearchBoxSchema();
          } else {
            removeSearchBoxSchema();
          }
          if (stateData.recipe_isEnabled === 'true') {
            insertRecipeSchema();
          } else {
            removeRecipeSchema();
          }

        } else {
          console.warn("Access token not found for this shop.");
        }
      } catch (error) {
        console.error("Error fetching schema data:", error);
      }
    }

    // Functions to insert various schemas

    function insertProductSchemaData(product, shop) {
      const schemaData = {
        "@context": "https://schema.org/",
        "@type": "Product",
        "name": product.title,
        "shipping_fee": 900,
        "Shipping_Country": "Bharat",
        // "image": product.images.map(image => image.src),       
        "description": product.body_html,
        // "sku": product.variants[0].sku,
        "brand": { "@type": "Brand", "name": product.vendor },
        "offers": {
          "@type": "Offer",
          // "price": product.variants[0].price,
          // "priceCurrency": product.variants[0].currency,
          // "availability": product.variants[0].inventory_quantity > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
          "url": window.location.href,
          "seller": { "@type": "Organization", "name": shop }
        }
      };
      insertSchemaToDOM(schemaData);
    }

    function insertCollectionSchemaData(collection, shop) {
      const schemaData = {
        "@context": "https://schema.org/",
        "@type": "Collection",
        "name": collection.title,
        "description": collection.body_html,
        "url": window.location.href
      };
      insertSchemaToDOM(schemaData);
    }

    function insertOrganizationSchema() {
      const schemaData = {
        "@context": "https://schema.org/",
        "@type": "Organization",
        "name": shop,
        "url": window.location.href
      };
      insertSchemaToDOM(schemaData);
    }

    function insertBreadcrumbSchema() {
      const schemaData = {
        "@context": "https://schema.org/",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": window.location.origin
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Page",
            "item": window.location.href
          }
        ]
      };
      insertSchemaToDOM(schemaData);
    }

    function insertVideoSchema() {
      const schemaData = {
        "@context": "https://schema.org/",
        "@type": "VideoObject",
        "name": "Sample Video",
        "description": "This is a sample video description",
        "thumbnailUrl": "https://example.com/video-thumbnail.jpg",
        "uploadDate": "2024-01-01",
        "contentUrl": window.location.href
      };
      insertSchemaToDOM(schemaData);
    }

    function insertArticleSchema() {
      const schemaData = {
        "@context": "https://schema.org/",
        "@type": "Article",
        "headline": "Sample Article",
        "author": "Author Name",
        "datePublished": "2024-01-01",
        "url": window.location.href
      };
      insertSchemaToDOM(schemaData);
    }

    function insertSearchBoxSchema() {
      const schemaData = {
        "@context": "https://schema.org/",
        "@type": "WebSite",
        "url": window.location.href,
        "potentialAction": {
          "@type": "SearchAction",
          "target": window.location.origin + "/search?q={search_term_string}",
          "query-input": "required name=search_term_string"
        }
      };
      insertSchemaToDOM(schemaData);
    }

    function insertRecipeSchema() {
      const schemaData = {
        "@context": "https://schema.org/",
        "@type": "Recipe",
        "name": "Sample Recipe",
        "recipeIngredient": ["Ingredient 1", "Ingredient 2"],
        "recipeInstructions": ["Step 1", "Step 2"],
        "url": window.location.href
      };
      insertSchemaToDOM(schemaData);
    }

    // Functions to remove schemas by type
    function removeProductSchema() {
      removeSchemaByType("Product");
    }

    function removeCollectionSchema() {
      removeSchemaByType("Collection");
    }

    function removeOrganizationSchema() {
      removeSchemaByType("Organization");
    }

    function removeBreadcrumbSchema() {
      removeSchemaByType("BreadcrumbList");
    }

    function removeVideoSchema() {
      removeSchemaByType("VideoObject");
    }

    function removeArticleSchema() {
      removeSchemaByType("Article");
    }

    function removeSearchBoxSchema() {
      removeSchemaByType("WebSite");
    }

    function removeRecipeSchema() {
      removeSchemaByType("Recipe");
    }

    function removeSchemaByType(schemaType) {
      const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
      jsonLdScripts.forEach((script) => {
        try {
          const schemaData = JSON.parse(script.textContent);
          if (schemaData['@type'] === schemaType) {
            script.remove(); // Remove only the schema related to the given type
            console.log(schemaType + " schema removed.");
          }
        } catch (error) {
          console.error("Error parsing JSON-LD schema:", error);
        }
      });
    }

    // Helper to insert schema data to DOM
    function insertSchemaToDOM(schemaData) {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.text = JSON.stringify(schemaData);
      document.head.appendChild(script);
      console.log("JSON-LD schema inserted:", schemaData);
    }

    // Initialize schema insertion/removal
    insertSchemaBasedOnPage();



`);
});





//   // for meta tags- meta-title, meta-description:


//   async function fetchAccessToken() {
//     const shopname = window.location.hostname;

//   const response = await fetch('https://server-page-xo9v.onrender.com/check-store?shop=${shopname}');
//   console.log(response);
//   const data = await response.json();
//   return data.accessToken;
// }

// async function fetchProductData(productHandle, accessToken) {
//     const shopname = window.location.hostname;

//   const response = await fetch('https://${shopname}/admin/api/2023-10/products.json?handle=${productHandle}', {
//     headers: {
//     'X-Shopify-Access-Token': accessToken,
//     'Content-Type': 'application/json'
//   }
//   });
// const data = await response.json();
// return data.products.length > 0 ? data.products[0] : null;
// }

// async function updateMetaTags() {

//   const pathParts = window.location.pathname.split("/");
//   const productHandle = pathParts[2]; // Get product handle from URL

//   try {
//       console.log("Updating meta tags..."); 

//     const accessToken = await fetchAccessToken();
//     const product = await fetchProductData(productHandle, accessToken);

//     if (product) {
//       // Update meta description
//       let metaDescription = document.querySelector('meta[name="owndescription"]');
//       if (!metaDescription) {
//         metaDescription = document.createElement('meta');
//         metaDescription.name = 'description';
//         document.head.appendChild(metaDescription);
//       }
//       metaDescription.content = product.body_html; // Set product description

//       // Update meta title
//       let metaTitle = document.querySelector('meta[name="owntitle"]');
//       if (!metaTitle) {
//         metaTitle = document.createElement('meta');
//         metaTitle.name = 'title';
//         document.head.appendChild(metaTitle);
//       }
//       metaTitle.content = product.title; // Set product title

//       console.log("Meta tags updated:", { title: product.title, description: product.body_html });
//     } else {
//       console.warn("Product not found.");
//     }
//   } catch (error) {
//     console.error("Error updating meta tags:", error);
//   }
// }

// // Initial call to update meta tags when the script runs
// updateMetaTags();

// // Update meta tags on route change (for SPA or similar setups)
// window.addEventListener('popstate', () => {
//   updateMetaTags();
// });




// app.get("/api/audit/:shop", async (req, res) => {
//   const shopName = req.params.shop;

//   // Fetch the shop and access token from the database
//   const shop = await Shop.findOne({ shop: shopName });
//   if (!shop) {
//     return res.status(404).send("Shop not found");
//   }
//   const access_token = shop.accessToken;

//   // Define the pages to be audited
//   const arrayOfPages = ["products", "custom_collections", "blogs", "pages"];

//   try {
//     // Map through the array of page types and fetch data for each
//     const promises = arrayOfPages.map((url) => getData(shopName, access_token, url));
//     const result = await Promise.all(promises);

//     // Send the result back to the client
//     res.send(result);
//   } catch (error) {
//     console.error("Error fetching pages data:", error);
//     res.status(500).send("Failed to fetch data");
//   }
// });

// async function getData(shopifyStore, accessToken, urlEndpoint) {
//   try {
//     // Construct the correct Shopify API URL
//     const apiUrl = `https://${shopifyStore}/admin/api/2024-10/${urlEndpoint}.json`;

//     const pagesResponse = await axios.get(apiUrl, {
//       headers: {
//         "X-Shopify-Access-Token": accessToken,
//         "Content-Type": "application/json",
//       },
//     });

//     // Check if the response data is an array (in case of paginated responses)
//     if (!pagesResponse.data[urlEndpoint]) {
//       console.error(`No data found for ${urlEndpoint}`);
//       return [];
//     }

//     // Return the structured data
//     return pagesResponse.data[urlEndpoint].map((item) => {
//       if (urlEndpoint === "custom_collections") {
//         return {
//           id: item.id,
//           handle: item.handle,
//           title: item.title,
//           pageUrl: `https://${shopifyStore}/collections/${item.handle}`,
//           count: pagesResponse.data[urlEndpoint].length,
//         };
//       } else {
//         return {
//           id: item.id,
//           handle: item.handle,
//           title: item.title,
//           pageUrl: `https://${shopifyStore}/${urlEndpoint}/${item.handle}`,
//           count: pagesResponse.data[urlEndpoint].length,
//         };
//       }
//     });
//   } catch (error) {
//     console.error(`Error fetching data for ${urlEndpoint}:`, error.message);
//     return [];
//   }
// }



app.get("/api/audit/:shop", async (req, res) => {
  const shopName = req.params.shop;

  // Fetch the shop and access token from the database
  const shop = await Shop.findOne({ shop: shopName });
  if (!shop) {
    return res.status(404).send("Shop not found");
  }
  const access_token = shop.accessToken;

  // Define the pages to be audited
  const arrayOfPages = ["products", "custom_collections", "blogs", "pages"];

  try {
    // Map through the array of page types and fetch data for each
    const promises = arrayOfPages.map((url) => getData(shopName, access_token, url));
    const result = await Promise.all(promises);

    // Structure the result into a labeled object
    const structuredResult = {
      products: result[0],           // Data for 'products'
      collections: result[1],        // Data for 'custom_collections'
      blogs: result[2],              // Data for 'blogs'
      pages: result[3],              // Data for 'pages'
    };

    // Send the structured result back to the client
    res.send(structuredResult);
  } catch (error) {
    console.error("Error fetching pages data:", error);
    res.status(500).send("Failed to fetch data");
  }
});

async function getData(shopifyStore, accessToken, urlEndpoint) {
  try {
    // Construct the correct Shopify API URL
    const apiUrl = `https://${shopifyStore}/admin/api/2024-10/${urlEndpoint}.json`;

    const pagesResponse = await axios.get(apiUrl, {
      headers: {
        "X-Shopify-Access-Token": accessToken,
        "Content-Type": "application/json",
      },
    });

    // Check if the response data is an array (in case of paginated responses)
    if (!pagesResponse.data[urlEndpoint]) {
      console.error(`No data found for ${urlEndpoint}`);
      return [];
    }

    // Return the structured data
    return pagesResponse.data[urlEndpoint].map((item) => {
      if (urlEndpoint === "custom_collections") {
        return {
          id: item.id,
          handle: item.handle,
          title: item.title,
          pageUrl: `https://${shopifyStore}/collections/${item.handle}`,
          count: pagesResponse.data[urlEndpoint].length,
        };
      } else {
        return {
          id: item.id,
          handle: item.handle,
          title: item.title,
          pageUrl: `https://${shopifyStore}/${urlEndpoint}/${item.handle}`,
          count: pagesResponse.data[urlEndpoint].length,
        };
      }
    });
  } catch (error) {
    console.error(`Error fetching data for ${urlEndpoint}:`, error.message);
    return [];
  }
}











// save metatag:

app.get('/api/product', async (req, res) => {
  // const { id } = req.params;
  try {
    const response = await axios.get(
      // `https://${shopifyStore}/admin/api/2023-10/products/${id}.json`,
      `https://demosaurav.myshopify.com/admin/api/2023-10/products/9674508894486.json`,
      {
        headers: {
          'X-Shopify-Access-Token': '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',
          'Content-Type': 'application/json',
        },
      }
    );
    const product = response.data.product;
    res.json({
      metaTitle: product.title,
      metaDescription: product.body_html.replace(/<[^>]+>/g, ''), // Remove HTML tags
    });
  } catch (error) {
    console.error('Error fetching product data:', error);
    res.status(500).json({ error: 'Failed to fetch product data' });
  }
});



const gettoken = async (shopnm) => {
  const shopname = shopnm;

  try {
    const store = await Shop.findOne({ shop: shopname });

    if (!store) {
      return { error: true, message: "Store not registered." };
    }

    return { accessToken: store.accessToken };
  } catch (error) {
    console.error("Error retrieving store data:", error);
    return { error: true, message: "Internal Server Error" };
  }
};






app.get('/shopify/product/:shopname', async (req, res) => {
  const SHOP_NAME = req.params.shopname;
  const { handle } = req.query;

  try {
    const token = await gettoken(SHOP_NAME);
    const accessToken = token.accessToken;
    // console.log(SHOP_NAME, ' : ', accessToken);

    const url = `https://${SHOP_NAME}/admin/api/2023-10/products.json?handle=${handle}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (response.ok) {
      res.json(data);
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Error fetching product:', error);
    res.status(500).send('Internal Server Error');
  }
});





// Endpoint to update product details
app.put('/shopify/product/update/:shopname', async (req, res) => {
  const SHOP_NAME = req.params.shopname;
  const { productId, title, body_html } = req.body;

  try {
    const tokens = await gettoken(SHOP_NAME);
    const accessToken = tokens.accessToken;

    const url = `https://${SHOP_NAME}/admin/api/2023-10/products/${productId}.json`;
    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'X-Shopify-Access-Token': accessToken,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        product: {
          id: productId,
          title,
          body_html,
        },
      }),
    });

    const data = await response.json();

    if (response.ok) {
      res.json(data);
    } else {
      res.status(response.status).json(data);
    }
  } catch (error) {
    console.error('Error updating product:', error);
    res.status(500).send('Internal Server Error');
  }
});










// app.post('/api/seo/optimize/:shopname', async (req, res) => {
//   const { productId, metaTitle, metaDescription } = req.body; // Removed `keyword` since it's not used
//   const shopName = req.params.shopname;

//   try {
//     const token = await gettoken(shopName);
//     const accessToken = token.accessToken;
//     console.log(accessToken);
//     const metafields = [
//       {
//         metafield: {
//           namespace: 'seo',
//           key: 'tapita_clone_meta_title',
//           value: metaTitle,
//           type: 'single_line_text_field',
//         },
//       },
//       {
//         metafield: {
//           namespace: 'seo',
//           key: 'tapita_clone_meta_description',
//           value: metaDescription,
//           type: 'single_line_text_field',
//         },
//       },
//     ];

//     console.log(metafields);

//     // Create metafields
//     const responses = await Promise.all(
//       metafields.map((metafield) =>
//         axios.post(`https://${shopName}/admin/api/2024-10/products/${productId}/metafields.json`, metafield, {
//           headers: {
//             'Content-Type': 'application/json',
//             'X-Shopify-Access-Token': accessToken,
//           },
//         })
//       )
//     );

//     res.status(200).json({ message: 'Metafields updated successfully', responses });
//   } catch (error) {
//     console.error('Error updating metafields:', error); // Log the full error for debugging

//     // Prepare a clean error response
//     let errorDetails;

//     // Check if the error has a response object
//     if (error.response) {
//       // Extract relevant error message
//       errorDetails = {
//         status: error.response.status,
//         data: error.response.data, // You can narrow this down if needed
//         statusText: error.response.statusText,
//       };
//     } else {
//       // Fallback to the general error message
//       errorDetails = {
//         message: error.message,
//         stack: error.stack, // Only include this in your logs, not the response
//       };
//     }

//     // Send a sanitized error response
//     res.status(500).json({
//       error: 'Failed to update metafields',
//       details: errorDetails
//     });
//   }
// });


















const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
