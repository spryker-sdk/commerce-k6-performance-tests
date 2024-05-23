import {debug} from "../../lib/utils.js";

export default class ConfigHandler {
    constructor(http, urlHelper, bapiHelper, storeWhitelist = []) {
        this.storeWhitelist = storeWhitelist;
        this.http = http;
        this.urlHelper = urlHelper;
        this.storesConfig = []
        this.bapiHelper = bapiHelper;
        this.storeLocales = []
        this.storeCurrencies = []
    }

    getRequestParams() {
        const requestParams = this.bapiHelper.getParamsWithAuthorization();
        requestParams.thresholds = {}
        requestParams.timeout = '180s'
        delete(requestParams.headers['Content-Type'])
        requestParams.headers['accept'] = 'application/json'
        debug('Authorisation params:', requestParams)

        return requestParams
    }

    getInfoForTable(tableAlias) {
        try  {
            let info = this.http.sendGetRequest(this.http.url`${this.urlHelper.getBackendApiBaseUrl()}/dynamic-entity/${tableAlias}`, this.getRequestParams(), false);
            return JSON.parse(info.body)
        } catch (e) {
            return []
        }
    }

    get() {
        if (!this.storesConfig.length) {
            //  [{"id_store":1,"fk_currency":93,"fk_locale":66,"name":"DE"},{"id_store":2,"fk_currency":93,"fk_locale":66,"name":"AT"}]
            let stores = this.getInfoForTable('stores')
            // [{"id_locale_store":2,"fk_locale":46,"fk_store":1},{"id_locale_store":4,"fk_locale":46,"fk_store":2},{"id_locale_store":1,"fk_locale":66,"fk_store":1},{"id_locale_store":3,"fk_locale":66,"fk_store":2}]
            this.storeLocales = this.getInfoForTable('locale-stores')
            // [{"id_currency_store":2,"fk_currency":61,"fk_store":1},{"id_currency_store":4,"fk_currency":61,"fk_store":2},{"id_currency_store":1,"fk_currency":93,"fk_store":1},{"id_currency_store":3,"fk_currency":93,"fk_store":2}]
            this.storeCurrencies = this.getInfoForTable('currency-stores')

            stores.map((store) => {
                store.locales = this.storeLocales.filter((locale) => locale.fk_store === store.id_store).map((locale) => locale.fk_locale)
                store.currencies = this.storeCurrencies.filter((currency) => currency.fk_store === store.id_store).map((currency) => currency.fk_currency)
                this.storesConfig.push(store)
            })

            if (this.storeWhitelist.length) {
                this.storesConfig = this.storesConfig.filter((store) => this.storeWhitelist.filter((storeCode) => storeCode.toLowerCase() === store.name.toLowerCase()).length)
                this.storeLocales = this.storeLocales.filter((locale) => this.storesConfig.filter((store) => locale.fk_store === store.id_store).length)
                this.storeCurrencies = this.storeCurrencies.filter((currency) => this.storesConfig.filter((store) => currency.fk_store === store.id_store).length)
            }
            console.log('this.storesConfig =======>', this.storesConfig)
        }

        return this.storesConfig
    }

    getUniqueLocaleIds() {
        this.get()

        return [...new Set(this.storeLocales.map((el) => el.fk_locale))]
    }

    getUniqueCurrencyIds() {
        this.get()

        return [...new Set(this.storeCurrencies.map((el) => el.fk_currency))]
    }
}