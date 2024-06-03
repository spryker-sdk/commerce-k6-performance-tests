import { SharedCheckoutScenario } from '../../../../cross-product/storefront/scenarios/checkout/shared-checkout-scenario.js';
import { loadDefaultOptions } from '../../../../../lib/utils.js';
import { SummaryHelper } from '../../../../../helpers/summary-helper.js';

const environment = 'B2B';
const testId = 'S4';

const checkoutScenario = new SharedCheckoutScenario(environment);
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
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/cart/add/657712}`] = ['avg<499'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/cart}`] = ['avg<697'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout}`] = ['avg<411'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/address}`] = ['avg<621'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/shipment}`] = ['avg<454'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/payment}`] = ['avg<499'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/summary}`] = ['avg<413'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/place-order}`] = ['avg<616'];
options.thresholds[`http_req_duration{url:${storefrontBaseUrl}/en/checkout/success}`] = ['avg<1033'];

export function executeCheckoutScenario() {
    checkoutScenario.execute();
}

export function handleSummary(data) {
    return SummaryHelper.handleSummary(data, environment, testId);
}
