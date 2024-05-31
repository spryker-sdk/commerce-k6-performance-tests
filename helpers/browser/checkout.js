import faker from 'k6/x/faker';
import {Profiler} from "../profiler.js";

export default class Checkout {
    constructor(browser, basicAuth, metrics, targetLocale = 'en', cartSize = 1, timeout = 1000) {
        this.targetLocale = targetLocale;
        this.browser = browser
        this.timeout = timeout
        this.metrics = metrics
        this.cartSize = cartSize
        this.cartItemsAmount = 0
        this.skippedProduct = 0
        this.browser.setExtraHTTPHeaders(basicAuth.getAuthHeader())
        this.customerData = {}
        this.profiler = new Profiler()
    }

    async placeGuestOrder(paymentCode, productUris = []) {
        this.initCustomerData()

        // try {
        for (const productUri of productUris) {
            if (this.cartItemsAmount < this.cartSize) {
                try {
                    await this.addProduct(productUri)
                } catch (e) {
                    console.error(`Was not able to add product: ${productUri} to the shopping cart. ${e}`)
                }
            }
        }

        await this.visitCart()
        await this.visitCheckoutAsGuest()
        // await this.fillShippingInfo()
        // await this.fillShipping()
        // await this.fillPayment(paymentCode)
        // await this.createOrder()
        console.log(`Target Cart Size: ${this.cartSize}, Actual amount: ${this.cartItemsAmount}, Skipped because not available: ${this.skippedProduct}`)
        return this.browser.getCurrentUrl()
        // } catch (e) {
        //   console.error(`Was not able to to create order: ${e}`)
        // }
    }

    initCustomerData() {
        this.customerData = {
            firstName: faker.person.firstName(),
            lastName: faker.person.lastName(),
            email: faker.person.email(),
            address1: faker.address.streetName(),
            address2: faker.number.intRange(1, 100),
            zip: faker.zen.zip(),
            city: faker.address.city(),
            phone: faker.person.phone(),
        }
    }

    async addProduct(productUri) {
        this.browser.addStep(`Visit product: ${productUri}`)
        await this.browser.visitPage(productUri, 'product_page_loading_time')
        this.browser.screen()
        if (this.browser.isEnabled('[data-qa="add-to-cart-button"]')) {
            this.browser.addStep('Add product to cart')
            await this.browser.click('[data-qa="add-to-cart-button"]', {waitForNavigation: true}, this.timeout)
            this.cartItemsAmount++
        } else {
            this.browser.addStep('Product is not available')
            this.skippedProduct++
        }
    }

    async visitCart() {
        this.browser.addStep('Visit shopping cart')
        await this.browser.visitPage(`/${this.targetLocale}/cart`, 'cart_page_loading_time')
    }

    async visitCheckoutAsGuest() {
        this.browser.addStep('Visit checkout')
        await this.browser.visitPage(`/${this.targetLocale}/checkout/customer`, 'checkout_page_loading_time')
        await this.browser.waitUntilLoad()

        // this.browser.addStep('Select guest checkout')
        // await this.browser.click('[data-qa="component toggler-radio checkoutProceedAs guest"]', { waitForTimeout: true, force: true }, this.timeout)
        // await this.browser.waitUntilLoad()

        let result = await this.browser.fillForm(
            [
                {
                    'type': 'step',
                    'value': `Select guest checkout`
                },
                {
                    'type': 'screen',
                    'value': `Select guest checkout`
                },
                {
                    'type': 'click',
                    'locator': '[id="guest"]',
                    'value': ''
                },
                {
                    'type': 'step',
                    'value': `Fill customer data`
                },
                {
                    'type': 'screen',
                    'value': `Fill customer data form filled`
                },
                {
                    'type': 'fill',
                    'locator': '[name="guestForm[customer][first_name]"]',
                    'value': this.customerData.firstName,
                },
                {
                    'type': 'fill',
                    'locator': '[name="guestForm[customer][last_name]"]',
                    'value': this.customerData.lastName,
                },
                {
                    'type': 'fill',
                    'locator': '[name="guestForm[customer][email]"]',
                    'value': this.customerData.email,
                },
                {
                    'type': 'click',
                    'locator': '[data-qa="component checkbox guestForm[customer][accept_terms] guestForm_customer_accept_terms"]',
                    'value': ''
                },
                {
                    'type': 'screen',
                    'value': `Fill customer data form filled`
                },
                {
                    'type': 'wait',
                    'value': 120000
                },
                {
                    'type': 'step',
                    'value': `Accept terms`
                },
                {
                    'type': 'click',
                    'locator': '[data-qa="component checkbox guestForm[customer][accept_terms] guestForm_customer_accept_terms"]',
                    'value': ''
                },
                {
                    'type': 'wait',
                    'value': 120000
                },
            ]
        )
        console.log(`Form fill result: ${Number(result)}`)
    }

    async fillShippingInfo() {
        this.browser.addStep('Visit shipping address page')
        await this.browser.click('[data-qa="guest-form-submit-button"]', {waitForNavigation: true}, this.timeout, 'shipping_address_loading_time')
        await this.browser.waitUntilLoad()


        await this.browser.fillForm(
            [
                {
                    'type': 'step',
                    'value': `Fill shipping address form`
                },
                {
                    'type': 'screen',
                    'value': `Fill shipping address form`
                },
                {
                    'type': 'fill',
                    'locator': '[name="addressesForm[shippingAddress][first_name]"]',
                    'value': this.customerData.firstName,
                },
                {
                    'type': 'fill',
                    'locator': '[name="addressesForm[shippingAddress][last_name]"]',
                    'value': this.customerData.lastName,
                },
                {
                    'type': 'fill',
                    'locator': '[name="addressesForm[shippingAddress][address1]"]',
                    'value': this.customerData.address1,
                },
                {
                    'type': 'fill',
                    'locator': '[name="addressesForm[shippingAddress][address2]"]',
                    'value': this.customerData.address2,
                },
                {
                    'type': 'fill',
                    'locator': '[name="addressesForm[shippingAddress][zip_code]"]',
                    'value': this.customerData.zip,
                },
                {
                    'type': 'fill',
                    'locator': '[name="addressesForm[shippingAddress][city]"]',
                    'value': this.customerData.city,
                },

                {
                    'type': 'fill',
                    'locator': '[name="addressesForm[shippingAddress][phone]"]',
                    'value': this.customerData.phone,
                },
                {
                    'type': 'screen',
                    'value': `Fill shipping address form filled`
                },
                {
                    'type': 'click',
                    'locator': '[data-qa="submit-address-form-button"]',
                    'value': ''
                },
                {
                    'type': 'wait',
                    'value': 120000
                },
            ]
        )
        await this.browser.waitUntilLoad()
    }

    async fillShipping() {
        this.browser.addStep('Visit shipment method page')
        await this.browser.waitUntilLoad()

        const amountOfSections = this.browser.getElementCount('[data-qa="multi-shipment-group"]')
        for (let i = 0; i < amountOfSections; i++) {
            let targetLocator = `[data-qa="component radio shipmentCollectionForm[shipmentGroups][${i}][shipment][shipmentSelection] shipmentCollectionForm_shipmentGroups_${i}_shipment_shipmentSelection_0"]`
            if (this.browser.ifElementExists(targetLocator)) {
                await this.browser.click(targetLocator, {waitForTimeout: true}, this.timeout)
            }
        }
    }

    async fillPayment(paymentCode) {
        this.browser.addStep('Visit payment selection page')
        await this.browser.waitUntilLoad()
        // await this.browser.focus('[data-qa="submit-button"]')
        this.browser.scrollBottom()
        await this.browser.click('[data-qa="submit-button"]', {
            waitForNavigation: true,
            force: true
        }, this.timeout, 'shipping_method_loading_time')
        await this.browser.waitUntilLoad()

        const targetElement = `[data-qa="component toggler-radio paymentForm[paymentSelection] paymentForm_paymentSelection_${paymentCode}"]`
        if (this.browser.getElementCount(targetElement) > 0) {
            await this.browser.click(targetElement, {waitForTimeout: true}, this.timeout)
            let dobKey = paymentCode === 'dummyMarketplacePaymentInvoice' ? 'dateOfBirth' : 'date_of_birth'
            this.browser.typeIf(`[name="paymentForm[${paymentCode}][${dobKey}]"]`, '24.10.1990', paymentCode === 'dummyMarketplacePaymentInvoice' || paymentCode === 'dummyPaymentInvoice')
        }
    }

    async createOrder() {
        await this.browser.click('[data-qa="submit-button"]', {
            waitForNavigation: true,
            force: true
        }, this.timeout, 'summary_page_loading_time')
        await this.browser.waitUntilLoad()
        this.browser.scrollBottom()

        this.browser.page.evaluate(() => {
            document.querySelector('[data-qa="accept-terms-and-conditions-input"]').click()
        });
        await this.browser.waitUntilLoad()
        this.browser.addStep('Visit summary page')
        await this.browser.click('[class="form__action button button--success js-summary__submit-button"]', {waitForTimeout: true}, this.timeout, 'success_page_loading_time')
        await this.browser.waitUntilLoad()
    }
}
