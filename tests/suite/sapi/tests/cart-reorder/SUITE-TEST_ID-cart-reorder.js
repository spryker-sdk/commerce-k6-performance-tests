import { loadDefaultOptions } from '../../../../../lib/utils.js';
import {
    SharedCartReorderScenario
} from '../../../../cross-product/sapi/scenarios/cart-reorder/shared-cart-reorder-scenario.js';
import { SharedCheckoutScenario } from '../../../../cross-product/sapi/scenarios/checkout/shared-checkout-scenario.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

const iterations = 10;
const environment = 'SUITE';
const sharedCheckoutScenario = new SharedCheckoutScenario(environment);
const sharedCartReorderScenario = new SharedCartReorderScenario(environment);

export const options = loadDefaultOptions();
options.scenarios = {
    TEST_ID_Cart_Reorder: {
        exec: 'execute',
        executor: 'shared-iterations',
        tags: {
            testId: 'TEST_ID',
            testGroup: 'Cart Reorder',
        },
        iterations: iterations
    },
};
options.thresholds[`http_req_duration{url:${sharedCartReorderScenario.getStorefrontApiBaseUrl()}/cart-reorder}`] = ['avg<409'];

export function setup() {
    return sharedCheckoutScenario.dynamicFixturesHelper.haveCustomersWithQuotes(iterations);
}

export function execute(data) {
    const customerIndex = __ITER % data.length;
    const { customerEmail, quoteIds } = data[customerIndex];

    // Place an order
    const checkoutResponseJson = sharedCheckoutScenario.haveOrder(customerEmail, quoteIds[0], false);

    // Reorder
    sharedCartReorderScenario.execute(customerEmail, checkoutResponseJson.data.relationships.orders.data[0].id);
}
