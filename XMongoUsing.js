const _ = require('object-collection')._;

/**
 * XMongoUsing handles relationship and data manipulation
 */
class XMongoUsing {
    using = [];

    /**
     * @type {typeof XMongoModel|null}
     */
    model = null;

    constructor(model, using) {
        if (!model) throw Error('A model must be attached to use data!');
        if (!using) throw Error('Using data must be an array or a function containing a query');

        this.using = using;
        this.model = model;

        return this;
    }

    /**
     * Organize relationship
     * @param {string} relationship
     * @param options
     */
    load(relationship, options = {cast: false}) {
        let config = this.model.relationships || {};
        let cast = typeof options === "boolean" ? options : options.cast || false;

        if (config && config.hasOwnProperty(relationship)) {
            config = config[relationship];

            for (const index in this.using) {
                const item = this.using[index];
                let relationshipInItem = item[relationship];

                if (relationshipInItem) {
                    if (Array.isArray(relationshipInItem) && config.type === 'hasOne') {
                        relationshipInItem = relationshipInItem[0];

                        if (cast) relationshipInItem = config.model.use(relationshipInItem);
                    }

                    this.using[index][relationship] = relationshipInItem;
                }
            }
        } else {
            throw Error(`Relationship "${relationship}" does not exists in model`)
        }

        return this;
    }

    loadSelf() {
        this.using = this.model.fromArray(this.using);
        return this;
    }

    /**
     * Return manipulated data
     * @return {[]}
     */
    data() {
        return this.using;
    }


}

module.exports = XMongoUsing;