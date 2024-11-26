import { AbstractScenario } from '../../../../abstract-scenario.js';
import { group } from 'k6';

export class SharedCheckoutScenario extends AbstractScenario {
    execute(numberOfItems) {
        let self = this;

        group('Checkout', function () {
            const requestParams = self.cartHelper.getParamsWithAuthorization();
            const cartId = self.cartHelper.haveCartWithProducts(numberOfItems, '100429');

            const checkoutResponse = self.http.sendPostRequest(
                self.http.url`${self.getStorefrontApiBaseUrl()}/checkout?include=orders`,
                JSON.stringify(self._getCheckoutData(cartId)),
                requestParams,
                false
            );

            self.assertionsHelper.assertResponseStatus(checkoutResponse, 201);
        });
    }

    haveOrder(customerEmail, cartId, isMpPaymentProvider = true) {
        const checkoutResponse = this.http.sendPostRequest(
            this.http.url`${this.getStorefrontApiBaseUrl()}/checkout?include=orders`,
            JSON.stringify(this._getCheckoutData(cartId, customerEmail, isMpPaymentProvider)),
            this.cartHelper.getParamsWithAuthorization(customerEmail),
            false
        );

        this.assertionsHelper.assertResponseStatus(checkoutResponse, 201);

        return JSON.parse(checkoutResponse.body);
    }

    _getCheckoutData(cartId, defaultCustomerEmail = this.customerHelper.getDefaultCustomerEmail(), isMpPaymentProvider = true) {
        const address = {
            salutation: 'Ms',
            email: defaultCustomerEmail,
            firstName: 'sonia',
            lastName: 'wagner',
            address1: 'West road',
            address2: '212',
            address3: '',
            zipCode: '61000',
            city: 'Berlin',
            iso2Code: 'DE',
            company: 'Spryker',
            phone: '+380669455897',
            isDefaultShipping: true,
            isDefaultBilling: true
        };

        return {
            data: {
                type: 'checkout',
                attributes: {
                    customer: {
                        salutation: 'Ms',
                        email: defaultCustomerEmail,
                        firstName: 'Sonia',
                        lastName: 'Wagner'
                    },
                    idCart: cartId,
                    billingAddress: address,
                    shippingAddress: address,
                    payments: [
                        {
                            paymentMethodName: 'Invoice',
                            paymentProviderName: this._getPaymentProviderName(isMpPaymentProvider)
                        }
                    ],
                    shipment: {
                        idShipmentMethod: 2
                    }
                }
            }
        }
    }

    _getPaymentProviderName(isMpPaymentProvider = true) {
        return isMpPaymentProvider ? 'DummyMarketplacePayment' : 'DummyPayment';
    }
}
