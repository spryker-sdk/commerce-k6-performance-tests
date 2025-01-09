import { loadDefaultOptions } from '../../../../../lib/utils.js';
import { SharedCheckoutScenario } from '../../../../cross-product/sapi/scenarios/checkout/shared-checkout-scenario.js';
import { SharedOrderAmendmentScenario } from '../../../../cross-product/sapi/scenarios/order-amendment/shared-order-amendment-scenario.js';
export { handleSummary } from '../../../../../helpers/summary-helper.js';

const vus = 1;
const iterations = 10;

const environment = 'SUITE';
const thresholdTag = 'SAPI25_cancel_order_amendment_50';

const sharedCheckoutScenario = new SharedCheckoutScenario(environment);
const sharedOrderAmendmentScenario = new SharedOrderAmendmentScenario(environment);

export const options = loadDefaultOptions();
options.scenarios = {
  SAPI25_cancel_order_amendment_50: {
    exec: 'execute',
    executor: 'per-vu-iterations',
    tags: {
      testId: 'SAPI25',
      testGroup: 'Order Amendment',
    },
    vus: vus,
    iterations: iterations,
  },
};
options.thresholds[`http_req_duration{name:${thresholdTag}}`] = ['avg<300'];

export function setup() {
  if (isSequentialSetup()) {
    return sharedCheckoutScenario.dynamicFixturesHelper.haveCustomersWithQuotes(iterations, 1, 50);
  }

  if (isConcurrentSetup()) {
    return sharedCheckoutScenario.dynamicFixturesHelper.haveCustomersWithQuotes(vus, iterations, 50);
  }

  throw new Error('Invalid setup configuration');
}

export function teardown() {
  sharedCheckoutScenario.dynamicFixturesHelper.haveConsoleCommands(['console queue:worker:start --stop-when-empty']);
}

export function execute(data) {
  const { customerEmail, quoteIds } = getCustomerData(data);
  const quoteIndex = getQuoteIndex(quoteIds);

  // Place an order
  const checkoutResponseJson = sharedCheckoutScenario.haveOrder(customerEmail, quoteIds[quoteIndex], false);

  // Edit an order
  const cartReorderResponseJson = sharedOrderAmendmentScenario.haveOrderAmendment(
    customerEmail,
    checkoutResponseJson.data.attributes.orderReference
  );

  // Create empty default cart
  sharedOrderAmendmentScenario.cartHelper.create(customerEmail, 'default', true);

  // Delete reordered cart
  sharedOrderAmendmentScenario.cartHelper.deleteCart(customerEmail, cartReorderResponseJson.data.id, thresholdTag);
}

function getCustomerData(data) {
  let customerIndex;

  if (isSequentialSetup()) {
    customerIndex = __ITER % data.length;
  } else if (isConcurrentSetup()) {
    customerIndex = (__VU - 1) % data.length;
  }

  return data[customerIndex];
}

function getQuoteIndex(quoteIds) {
  return isSequentialSetup() ? 0 : __ITER % quoteIds.length;
}

function isConcurrentSetup() {
  return vus > 1 && iterations === 1;
}

function isSequentialSetup() {
  return vus === 1 && iterations > 1;
}
