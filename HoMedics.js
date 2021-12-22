Evergage.init({
    cookieDomain: "homedics.com",
    //"sandboxhomedics.mybigcommerce.com",
   // dataset: "staging",
     //if you run into issues with location not being tracked, remove this, its not needed
}).then(() => {

    const sitemapConfig = { // Sitemap configuration object
        global: {

            listeners: [
                Evergage.listener("submit", ".form.newsletter-form", () => {
                    const email = Evergage.cashDom("#nl_email").val();
                    if (validateEmail(email)) {
                        Evergage.sendEvent({
                            action: "Email Newsletter Sign Up - Footer",
                            user: {
                                anonId: getAnonId(),
                                attributes: {
                                    emailAddress: email
                                }
                            }
                        })
                    }
                })
                
            ]
        }, // Object used to contain Global site object configuration

        pageTypeDefault: {
            name: "default",
        },

        //start of Page Types

        pageTypes: [

            {
                name: "homepage",
                action: "Homepage",
                isMatch: () => "https://www.homedics.com/" == window.location.href, //"https://sandboxhomedics.mybigcommerce.com/" == window.location.href,//
                contentZones: [

                    {
                        name: "homepage_product_recommendations",
                        selector: "#s-440e6c8a-59f6-41c9-8c43-5f0320a29a1d"
                    }
                ],

                listeners: [

                ]

            },
            {
                name: "product_detail",
                action: "Product Detail",

                isMatch: () => prodIsMatch.then(() => true, () => false),
                    /*{
                        return Evergage.DisplayUtils.pageElementLoaded(".productView", "html").then(() => true, () => false);
                        
                    },*/

                catalog: {
                    Product: {
                        description: Evergage.resolvers.fromMeta("og:description"),
                        imageUrl: Evergage.resolvers.fromMeta("og:image"),
                        _id: () => {

                            return Evergage.DisplayUtils.pageElementLoaded(".productView-details, .productView-product, .productView-label-small.productView-sku", "html").then((ele) => {
                                return Evergage.cashDom('span[itemprop="sku"]').text().trim();

                            });

                        },
                        
                        name: Evergage.resolvers.fromMeta("og:title"),
                        url: Evergage.resolvers.fromMeta("og:url"),
                        price: Evergage.resolvers.fromMeta("product:price:amount", (price) => {
                            return parseFloat(price);
                        }),
                        rating: parseFloat(Evergage.cashDom('.bv_avgRating_component_container.notranslate').text().trim()),
                        categories: () => { 
                                return Evergage.util.resolveWhenTrue.bind(() => {
                                let pageType = dataLayer.filter(s => s["pageType"] == "product");
                                if(pageType.length > 0){

                                    const foo = () => {
                                        return gtmObj.ecommerce.detail.products[0].category.split(",")
                                    }
                                return foo()
                                }
                                })
                               
                                },
                        
                        
                        dimensions: {

                            PriceRange: () => priceRange(),
                            Availability: Evergage.resolvers.fromSelector(".productView-label-small.productView-inventory", (ele) => {
                            if (/Out/.test(ele)) {
                                return ['false']
                            } else {
                                return ['true']
                            }
                        }),
                

                        }
                    },


                },

                listeners: [
                    Evergage.listener("click", ".button.form-action-addToCart", () => {
                        let cart = window.dataLayer.filter(s => s["pageType"] == "product");
                        cart = cart[cart.length - 1];
                        const prodID = cart["ecommerce"]["detail"]["products"][0]["id"];
                        const prodQuantity = parseInt(Evergage.cashDom(".form-input.form-input--incrementTotal")[1].value);
                        let prodPrice = Evergage.cashDom(".price.price--withoutTax")[0].innerText.replace("$", "");
                        Evergage.sendEvent({
                            action: Evergage.ItemAction.AddToCart,
                            cart: {
                                singleLine: {
                                    Product: {
                                        _id: prodID,
                                        quantity: prodQuantity,
                                        price: prodPrice
                                    }
                                }
                            }
                        });
                    })
                ],

                contentZones: [{
                        name: "pdp_prod_rec1",
                        selector: ".productCarousel.slick-initialized.slick-slider"
                    },
                    {
                        name: "pdp_prod_rec2",
                        selector: ".hawk-recommendation-list.itemList.slick-initialized.slick-slider"
                    }

                ]

            },



            {
                name: "register_page",
                action: "Register Page",

                isMatch: () => /create_account/.test(window.location.href),
                listeners: [

                    Evergage.listener("submit", ".form", () => {
                        const firstname = Evergage.cashDom('#FormField_4_input').val()
                        const lastname = Evergage.cashDom('#FormField_5_input').val()
                        const address1 = Evergage.cashDom('#FormField_8_input').val()
                        const address2 = Evergage.cashDom('#FormField_9_input').val()
                        const city = Evergage.cashDom('#FormField_10_input').val()
                        const state = Evergage.cashDom('#FormField_12_select').val()
                        const zipcode = Evergage.cashDom('#FormField_13_input').val()
                        const country = Evergage.cashDom('#FormField_11_select').val()
                        const email = Evergage.cashDom('#FormField_1_input').val()
                        const phoneNumber = Evergage.cashDom('#FormField_7_input').val()
                        Evergage.sendEvent({
                            action: "Created Account - User Info Capture",
                            user: {
                                anonId: getAnonId(),
                                attributes: {
                                    firstname: firstname,
                                    lastname: lastname,
                                    address: address1 + " " + address2,
                                    emailAddress: email,
                                    city: city,
                                    state: state,
                                    zipcode: zipcode,
                                    country: country,
                                    phoneNumber: phoneNumber
                                }
                            }
                        });
                    }),


                ]

            },

            {
                name: "login_page",
                action: "Login Page",

                isMatch: () => "https://www.homedics.com/login.php" == window.location.href,

                listeners: [
                    Evergage.listener("submit", ".login-form.form", () => {
                        let email = Evergage.cashDom("#login_email").val();
                        if (validateEmail(email)) {
                            Evergage.sendEvent({
                                name: "Log-in",
                                action: "Email Capture - Log-in Page",
                                user: {
                                    anonId: getAnonId(),
                                    attributes: {
                                        emailAddress: email
                                    }
                                }
                            })
                        }
                    })
                ]

            },

            {
                name: "Shopping Cart",
                action: "Shopping Cart",
                isMatch: () => /\/cart/.test(window.location.href),
                itemAction: Evergage.ItemAction.ViewCart,
                catalog: {
                    Product: {
                        lineItems: {
                            _id: () => {
                                return Evergage.util.resolveWhenTrue.bind(() => {
                                    let cartArr = window.dataLayer.filter(s => s["ecommerce"])
                                    if (cartArr.length > 0) {
                                        return getCartDetails("sku")
                                    } else {
                                        return false
                                    }
                                })
                            },
                            price: () => {
                                return Evergage.util.resolveWhenTrue.bind(() => {
                                    let cartArr = window.dataLayer.filter(s => s["ecommerce"])
                                    if (cartArr.length > 0) {
                                        return getCartDetails("subTotal")
                                    } else {
                                        return false
                                    }
                                })
                            },
                            quantity: () => {
                                return Evergage.util.resolveWhenTrue.bind(() => {
                                    let cartArr = window.dataLayer.filter(s => s["ecommerce"])
                                    if (cartArr.length > 0) {
                                        return getCartDetails("quantity")
                                    } else {
                                        return false
                                    }
                                })
                            }
                        }
                    }
                }

            },

            /*{
                name: "Category Page",
                action: "Category Page",

                isMatch: () => { 
                    for (let i = 0; i < navBarCategories.length; i++) {
                        if (window.location.href.includes(navBarCategories[i].toLowerCase())) {
                            return true 
                        }
                    }
                    return false
                }


            },*/



            {
                name: "Order Confirmation",
                //action: "Order Confirmaton",
                isMatch: () => {
                    if (/\/order-confirmation/.test(window.location.href)) {
                        return true;
                    } else {
                        return false;
                    }
                },
                
                
            },



            {
                name: "checkout_page",
                action: "Checkout Page",

                isMatch: () => /\/checkout/.test(window.location.href),

                listeners: [
                    //returning customer 
                    Evergage.listener("submit", "#checkout-customer-returning", () => {
                        const email = Evergage.cashDom('#email').val();
                        const firstname = Evergage.cashDom("#firstName").val() || "";
                        const lastname = Evergage.cashDom("#lastName").val() || "";
                        if (email) {
                            Evergage.sendEvent({
                                action: "Checkout - Email Capture",
                                user: {
                                    anonId: getAnonId(),
                                    attributes: {
                                        emailAddress: email,
                                        firstName: firstname,
                                        lastName: lastname
                                    }
                                }
                            });
                        }
                    }),
                    

                    Evergage.listener("submit", ".checkout-form", () => {
    
                        const email = Evergage.cashDom('#email').val();
                        Evergage.sendEvent({
                            action: "Checkout - Email Capture ", 
                            user: {
                                anonId: getAnonId(),
                                attributes: {
                                    emailAddress: email,
                                }
                            }
                        });
                    }),


                ],

            },

        ] // Array used to contain the page type object configurations
    }


    // Abandoned Cart Function example code

    const getOrderDetails = (targetAttribute) => {
        try {
            let details = dataLayer.filter(s => s["event"] == "purchase")[0];
            if (targetAttribute == "orderID") {
                return details["ecommerce"]["purchase"]["actionField"]["id"].toString();
            } else {
                details = details["ecommerce"]["purchase"]["items"];
                let arr = [];
                for (let i = 0; i < details.length; i++) {
                    arr.push(details[i][targetAttribute])
                }
                return arr;
            }
        } catch (error) {
            console.log("ERRORED ORDER CONF", details, error);
        }
    }

    const getCartDetails = (targetAttribute) => {
        let cartArr = dataLayer.filter(s => s["ecommerce"])[0]["ecommerce"]["purchase"]["items"];
        let sol = []
        for (var i in cartArr) {
            sol.push(cartArr[i][targetAttribute])
        }
        return sol 
    }

    const getCategories = () => {
        
        let categories = Evergage.cashDom(".navPages-action.has-subMenu");
        let categoryArray = [];
        for (let i = 0; i < categories.length; i++) {
            categoryArray.push(categories[i].innerText.replace(/\n/g,"").trim())
        }
        return categoryArray
        
    }
    
    const checkForOrder = () => {
        let timerVar = setInterval(() => {
            if (window.dataLayer.filter(s => s["event"] == "purchase").length > 0) {
                clearInterval(timerVar);
                Evergage.sendEvent({
                    itemAction: "Purchase",
                    order: {
                        Product: {
                            orderId: getOrderDetails("orderID"),
                            lineItems: buildLineItems()                            
                        }
                    }
                });
                Evergage.sendEvent({
                    action: "Order Confirm | Email Capture",
                    user: {
                        anonId: getAnonId(),
                        attributes: {
                            emailAddress: getEmailAddress()
                        }
                    },
                });
                
            }
        }, 400)
    }

    const getEmailAddress = () => {
        let varArr = window.dataLayer.filter(s => s["event"] == "purchase")[0]
        varArr = varArr["ecommerce"]["sessionData"]["customer"]["email"];
        return varArr
    }

    const priceRange = () => {
        let price = Evergage.cashDom(".price.price--withoutTax")[0].innerText.replace("$", "");
        const ceiling = String(Math.ceil(price / 100) * 100);
        const floor = String(Math.floor(price / 100) * 100 + 1);
        return ["$" + floor + "-" + "$" + ceiling];
    }

    const abandonedCart = () => {
        if (/\/order-confirmation/.test(window.location.href)) {}
        else {
            Evergage.DisplayUtils.pageExit(2000).then(function(event) {
                //alert(cartDetails.items > 0 )
                var cart_items = parseInt(Evergage.cashDom(".countPill.cart-quantity")[0].innerText)
                if (cart_items > 0) {
                    return Evergage.sendEvent({
                        action: "Abandoned Cart"
                    })
                } else {
                    return Evergage.sendEvent({
                        action: "Abandoned Browse"
                    })
                }
            })
        }
    }

    const validateEmail = (email) => {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    const buildLineItems = () => {
        let layer = window.dataLayer.filter(s => s["event"] == "purchase")[0];
        let lineItems = [];
        layer = layer["ecommerce"]["purchase"]["items"];
        for (var i in layer) {
            item = {_id: layer[i]["sku"], price: parseFloat(layer[i]["subTotal"]), quantity: parseInt(layer[i]["quantity"])};
            lineItems.push(item);
        }
        return lineItems;
    }
    //Function for getting the product category from the datalayer
    const getProductCategory = () => {
        let string_category = dataLayer.filter(s => s["pageType"] == "product")
        string_category = string_category[0].ecommerce.detail.products[0].category.split(",")
        return string_category
    }

    const getAnonId = () => {
        return Evergage.getCurrentPage().user.anonId;
    }

    const prodIsMatch = new Promise((resolve, reject) => {
        let name; 
        let tryNum = 0;
        name = Evergage.cashDom(".productView").length;
        if (name.length > 0) {
            resolve(true)
        } else {
        	tryNum++;
            setInterval(() => {
                if (Evergage.cashDom(".productView").length > 0) {
                    resolve(true)
                } else {
                	tryNum ++;
                	if (tryNum > 5) {
                		reject(false)
                	}
                }
            })
        }
    })


    const navBarCategories = getCategories();
    checkForOrder();
    abandonedCart();
    



    Evergage.initSitemap(sitemapConfig); // Initializes the Sitemap
});
