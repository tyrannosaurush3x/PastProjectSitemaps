// JavaScript source code
Evergage.init({
    cookieDomain: "tartecosmetics.com"
}).then(() => {
    
    const buildLocale = () => {
        let locale = window.dataLayer[0]["pageLanguage"]
        return locale;
    }
    const sitemapConfig = {    // Sitemap configuration object
        global: {
            onActionEvent: (actionEvent) => {
                const email = getEmail()
                if (email) {
                    actionEvent.user = actionEvent.user || {};
                    actionEvent.user.attributes = actionEvent.user.attributes || {};
                    actionEvent.user.attributes.emailAddress = email;
                    actionEvent.user.attributes.sfmcContactKey = email;
                }
                return actionEvent;
            },
            locale: buildLocale(),
            listeners: [
                Evergage.listener("submit", ".email-alert-signup", () => {
                    const email = Evergage.cashDom('#dwfrm_emailsignup_email').val()
                    if (email) {
                        Evergage.sendEvent({ action: "Email Sign Up - Footer", user: {attributes: {sfmcContactKey: email, emailAddress:  email}}});
                    }
                }),
                Evergage.listener("submit", ".sms-alert-signup", () => {
                    const phonenum = Evergage.cashDom('#phone').val()
                    if (phonenum) {
                        Evergage.sendEvent({ action: "SMS Opt in - Footer", user: {attributes: {phoneNumber:  phonenum}}});
                    }
                }),
                Evergage.listener("submit", "#dwfrm_login", () => {
                    let email = Evergage.cashDom("#dwfrm_login_username").val();
                    Evergage.sendEvent({
                        action: "Log In",
                        user: {
                            anonId: getAnonId(),
                            attributes: {
                                sfmcContactKey: email,
                                emailAddress: email
                            }
                        }
                    })
                }),
            ]
        },            // Object used to contain Global site object configuration
        pageTypeDefault: {
            name: "default"
        },
        pageTypes: [
        {
            name: "Homepage",
            action: "Homepage",
            isMatch: () => /home/.test(window.location.href) || "https://tartecosmetics.com/" == window.location.href, 
            contentZones: [
                {name: "Home_Page_Hero_Banner", selector: "#home-slot-3"},
                {name: "home_page_product_recommendation", selector: "#home-slot-6"},
                {name: "Home_Page_Tiles", selector: ".holiday-new-arrivals-hp-tile-boxes"}
            ]

        },
        {
            name: "Product Detail Page",
            action: "Product Detail Page",
            isMatch: () => {
                if (window.location.href.includes("sftkCacheBuster")){
                    return false
                } else {
                    let arr = window.dataLayer.filter(s => s["pageType"] == "productDetail")
                    if (Evergage.cashDom(".product-info-top").length > 0 || arr.length > 0) {
                        return true
                    } else {
                        return false
                    }
                }
            },
            
            catalog: {
                Product: {
                    _id: () => {
                        try {
                            return getProductsFromDataLayer("id");
                        } catch (error) {
                            return location.href.match(/-\d+/)[0].replace("-","");
                        }
                        
                    },

                    name: () => {
                        try {
                            return getProductsFromDataLayer("name");
                        } catch (error) {}
                    },

                    url: Evergage.resolvers.fromHref((ele) => {
                        return ele.split("?")[0]
                    }),

                    imageUrl: () => {
                        let ele = Evergage.cashDom(".primary-image")
                        if (ele.length > 0) {
                            return ele[0].src
                        } 
                    },
                    
                    Category: () => {
                        try {
                            return getProductsFromDataLayer("category");
                        } catch (error) {}
                    },

                    listPrice: () => {
                        try {
                            return getProductsFromDataLayer("listPriceLocal");
                        } catch (error) {}
                    },

                    price: () => {
                        try {
                            return getProductsFromDataLayer("priceLocal");
                        } catch (error) {}
                    },

                    virtualTryOn: () => {
                        return Boolean(Evergage.cashDom("#virtualTryOn").length)
                    },

                    vegan: () => {
                        try {
                            checkCalloutMessage("VEGAN");
                        } catch (error) {}
                    },

                    twoXPoints: () => {
                        try {
                            checkCalloutMessage("2X POINTS");
                        } catch (error) {}
                    }
                }
            },
        },
        {
            name: "Shopping Bag",
            action: "Shopping Bag",
            isMatch: () => /\/bag/.test(window.location.href),
            contentZones: [
                {name: "shopping_bag_prod_rec", selector: ".product-listing.product-recommendations.product-recommendations-1x4"}    
            ]

        },
        {
            name: "Checkout | Shipping",
            action: "Checkout | Shipping",
            isMatch: () => /checkout\/shipping/.test(window.location.href),
            listeners: [
                Evergage.listener("submit", "#dwfrm_singleshipping_shippingAddress", () => {
                    let email = Evergage.cashDom("#dwfrm_singleshipping_shippingAddress_email_emailAddress").val();
                    let firstname = Evergage.cashDom("#dwfrm_singleshipping_shippingAddress_addressFields_firstName").val();
                    let lastname = Evergage.cashDom("#dwfrm_singleshipping_shippingAddress_addressFields_lastName").val();
                    let address1 = Evergage.cashDom("#dwfrm_singleshipping_shippingAddress_addressFields_address1").val();
                    let address2 = Evergage.cashDom("#dwfrm_singleshipping_shippingAddress_addressFields_address2").val();
                    let address = address1+" "+address2;
                    let zipCode = Evergage.cashDom("#dwfrm_singleshipping_shippingAddress_addressFields_postal").val();
                    let city = Evergage.cashDom("#dwfrm_singleshipping_shippingAddress_addressFields_city").val();
                    let country = Evergage.cashDom("#dwfrm_singleshipping_shippingAddress_addressFields_country").val();
                    let state = Evergage.cashDom("#dwfrm_singleshipping_shippingAddress_addressFields_states_state").val();
                    let phone = Evergage.cashDom("#dwfrm_singleshipping_shippingAddress_addressFields_phone").val();
                    Evergage.sendEvent({
                        action: "Checkout | Shipping",
                        user: {
                            anonId: getAnonId(),
                            attributes: {
                                sfmcContactKey: email,
                                emailAddress: email, 
                                Phone: phone,
                                firstName: firstname, 
                                lastName: lastname,
                                city: city,
                                country: country
                            }
                        }
                    })
                    
                })
            ]
        },
        {
            name: "Login",
            action: "Login",
            isMatch: () => /\/login/.test(window.location.href),
        },
        {
            name: "Register",
            action: "Register",
            isMatch: () => /register/.test(window.location.href),
            listeners: [
                Evergage.listener("submit", "#RegistrationForm", () => {
                    let firstname = Evergage.cashDom("#dwfrm_profile_customer_firstname").val();
                    let lastname = Evergage.cashDom("#dwfrm_profile_customer_lastname").val();
                    let email = Evergage.cashDom("#dwfrm_profile_customer_emailconfirm").val();
                    let birthMonth = Evergage.cashDom("#dwfrm_profile_customer_birthmonth").val();
                    let birthDay = Evergage.cashDom("#dwfrm_profile_customer_customerbirthday").val();
                    let birthYear = Evergage.cashDom("#dwfrm_profile_customer_year").val();
                    let birth = birthMonth+"/"+birthDay+"/"+birthYear;
                    birth = new Date(birth);
                    Evergage.sendEvent({
                        action: "Account registered",
                        user: {
                            anonId: getAnonId(),
                            attributes: {
                                sfmcContactKey: email,
                                firstName: firstname, 
                                lastName: lastname, 
                                emailAddress: email,
                                birthday: birth
                            }
                        }
                    })
                })
            ]
        },
        {
            name: "Rewards",
            action: "Rewards",
            isMatch: () => /\/team-tarte/.test(window.location.href),
            contentZones: [
                {name: "rewards_hero_banner", selector: ".lp-loyaltyprogram__joinloyalty-header-topbanner.pos-rel"}    
            ]

        },
        {
            name: "Search",
            action: "Search",
            isMatch: () => /\/search/.test(window.location.href) 

        },
        {
            name: "Category",
            action: "Category",
            isMatch: () => /\/sale/.test(window.location.href) || /\/new-arrivals/.test(window.location.href) || /\/best-sellers/.test(window.location.href) || /\/makeup/.test(window.location.href) || /\/skincare/.test(window.location.href) || /\/sets/.test(window.location.href) || /\/awake1/.test(window.location.href) || /\/collections/.test(window.location.href) 

        },
        {
            name: "Services",
            action: "Landing Page",
            isMatch: () => /\/virtual-try-on/.test(window.location.href) || /\/free-virtual-beauty-consultations/.test(window.location.href) || /\/foundation-finder/.test(window.location.href) || /\/concealer-finder/.test(window.location.href) || /\/promotions-offers/.test(window.location.href) || /\/tartlette-edit/.test(window.location.href) || /\/gift-certificates/.test(window.location.href) || /\/about-tarte/.test(window.location.href) 

        },
        {
            name: "Order Confirmation",
            action: "Order Confirmation",
            isMatch: () => /order-confirmation/.test(window.location.href),
            order: {

                Product: {

                    orderId: () => {
                        return Evergage.DisplayUtils.pageElementLoaded(".confirmation-message", "html").then(() => {
                            let val = Evergage.cashDom(".confirmation-message")[0].innerText
                            return val.match(/\d+/)[0]
                        })
                        

                    },
                    currency: () => getOrderInfo("currency"),
                    
                    lineItems: {

                        _id: () => getOrderInfo("id"),

                        quantity: () => getOrderInfo("quantity"),

                        price: () => getOrderInfo("priceLocal")
                    }
                }
            }
        },
        
    ]         // Array used to contain the page type object configurations
}


    // Helper function to iterate through dataLayer to find product details 
    
    const checkAddToCart = () => { // Check for add to cart events 
        let lastSend;
        setInterval(() => {
            let cartArr = window.dataLayer.filter(s => s['event'] == "addToCart");
            if (cartArr.length > 0) {
                if (cartArr[0] != lastSend) {
                    let lineID = cartArr[0]["ecommerce"]["add"]["products"][0]["id"];
                    let lineQuantity = parseInt(cartArr[0]["ecommerce"]["add"]["products"][0]["quantity"]);
                    let linePrice = cartArr[0]["ecommerce"]["add"]["products"][0]["price"];
                    Evergage.sendEvent({
                        itemAction: Evergage.ItemAction.AddToCart,
                        cart: {
                            singleLine: {
                                Product: {
                                    _id: lineID,
                                    price: linePrice,
                                    quantity: lineQuantity
                                }
                            }
                        }
                    });
                }
                lastSend = cartArr[0];
            }
        }, 1500)
    }
    
    const getProductsFromDataLayer = (targetAttribute) => {
        let arr = window.dataLayer.filter(s => s["pageType"] == "productDetail")[0]
        return arr["ecommerce"]["detail"]["products"][0][targetAttribute]
    }

    const getEmail = ()=> {
        if (window.dataLayer) {
            let arr = window.dataLayer.filter(s => (Object.keys(s).find(x => x == "customerEmail")) == "customerEmail")
            if (arr.length > 0) {
                const email = arr[0]["customerEmail"]
                return email
            }
        }
    }

    // Helper to check callout messages 
    const checkCalloutMessage = (targetMessage) => {
        const arr = Evergage.cashDom(".callout-message")
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].innerText == targetMessage) {
                    return true
                }
            }
        return false
    };

    

    const getOrderInfo = (targetAttribute) => {
        let arr = window.dataLayer.filter(s => s["event"] == "orderConfirmation")
        arr = arr[arr.length - 1]
        if (targetAttribute == "currency") {
            return arr["ecommerce"]["currencyCode"];
        } else {
            arr = arr["ecommerce"]["purchase"]["products"];
            arr = arr.map((s) => {return s[targetAttribute]});
            return arr;
        }
         
    }

    const abandonedBrowseCart = () => {
        Evergage.DisplayUtils.pageExit(1000).then((event) => {
            let purchases = window.dataLayer.filter(s => s["event"] == "orderConfirmation")
            let cart;
            if (purchases.length == 0) {
                let addToCart = window.dataLayer.filter(s => s["event"] == "addToCart");
                try {
                    cart = parseInt(Evergage.cashDom(".minicart-quantity")[0].innerText);
                } catch (error) {
                    cart = 0;
                }
                
                if (addToCart.length > 0 || cart > 0) {
                    Evergage.sendEvent({
                        action: "Abandoned Cart"
                    })
                } else {
                    Evergage.sendEvent({
                        action: "Abandoned Browse"
                    })
                }
            }
        })
    }

    const getAnonId = () => {
        let currentPage = Evergage.getCurrentPage();
        return currentPage["user"]["anonId"]
    }
    checkAddToCart();
    abandonedBrowseCart();
    Evergage.initSitemap(sitemapConfig);    // Initializes the Sitemap
});
