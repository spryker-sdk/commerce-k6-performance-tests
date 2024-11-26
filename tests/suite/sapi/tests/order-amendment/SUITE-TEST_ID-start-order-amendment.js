import { loadDefaultOptions } from '../../../../../lib/utils.js';
import { SharedCheckoutScenario } from '../../../../cross-product/sapi/scenarios/checkout/shared-checkout-scenario.js';
import {
    SharedOrderAmendmentScenario
} from '../../../../cross-product/sapi/scenarios/order-amendment/shared-order-amendment-scenario.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

const iterations = 10;
const environment = 'SUITE';
const sharedCheckoutScenario = new SharedCheckoutScenario(environment);
const sharedOrderAmendmentScenario = new SharedOrderAmendmentScenario(environment);

export const options = loadDefaultOptions();
options.scenarios = {
    TEST_ID_Start_Order_Amendment: {
        exec: 'execute',
        executor: 'shared-iterations',
        tags: {
            testId: 'TEST_ID',
            testGroup: 'Order Amendment',
        },
        iterations: iterations
    },
};
options.thresholds[`http_req_duration{url:${sharedOrderAmendmentScenario.getStorefrontApiBaseUrl()}/cart-reorder}`] = ['avg<500'];

export function setup() {
    return sharedCheckoutScenario.dynamicFixturesHelper.haveCustomersWithQuotes(iterations);
}

export function execute(data) {
    const customerIndex = __ITER % data.length;
    const { customerEmail, quoteIds } = data[customerIndex];

    // Place an order
    const checkoutResponseJson = sharedCheckoutScenario.haveOrder(customerEmail, quoteIds[0], false);

    // Edit an order
    sharedOrderAmendmentScenario.execute(customerEmail, checkoutResponseJson.data.relationships.orders.data[0].id);
}
