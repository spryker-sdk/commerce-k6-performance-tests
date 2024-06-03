import { CheckoutScenario } from '../../scenarios/checkout/checkout-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';
import { SummaryHelper } from '../../../../../helpers/summary-helper.js';

const environment = 'B2B_MP';
const testId = 'S4';

const checkoutScenario = new CheckoutScenario(environment);
const storefrontBaseUrl = checkoutScenario.getStorefrontBaseUrl();

export const options = loadDefaultOptions();
options.scenarios = {
    S4_Checkout_70_items: {
        exec: 'executeCheckoutScenario',
        executor: 'shared-iterations',
        env: {
            numberOfItems: '70'
        },
        tags: {
            testId: testId,
            testGroup: 'Checkout',
        },
        iterations: 10,
    },
};
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/\${}}`] = ['avg<334'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/cart/add/657712}`] = ['avg<595'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/cart}`] = ['avg<721'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout}`] = ['avg<438'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/address}`] = ['avg<604'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/shipment}`] = ['avg<477'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/payment}`] = ['avg<504'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/summary}`] = ['avg<444'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/place-order}`] = ['avg<712'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/success}`] = ['avg<688'];

export function executeCheckoutScenario() {
    checkoutScenario.execute();
}

export function handleSummary(data) {
    return SummaryHelper.handleSummary(data, environment, testId);
}
