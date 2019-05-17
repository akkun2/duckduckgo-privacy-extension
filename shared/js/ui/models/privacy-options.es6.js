const Parent = window.DDG.base.Model

function PrivacyOptions (attrs) {
    // set some default values for the toggle switches in the template
    attrs.trackerBlockingEnabled = true
    attrs.httpsEverywhereEnabled = true
    attrs.embeddedTweetsEnabled = false

    Parent.call(this, attrs)
}

PrivacyOptions.prototype = window.$.extend({},
    Parent.prototype,
    {

        modelName: 'privacyOptions',

        toggle: function (k) {
            if (this.hasOwnProperty(k)) {
                this[k] = !this[k]
                const onOrOff = this[k] ? 'on' : 'off'
                console.log(`PrivacyOptions model toggle ${k} is now ${this[k]}`)
                this.fetch({updateSetting: {name: k, value: this[k]}})
                this.fetch({firePixel: ['epst', k, onOrOff]})
            }
        },

        getSettings: function () {
            let self = this
            return new Promise((resolve, reject) => {
                self.fetch({getSetting: 'all'}).then((settings) => {
                    self.trackerBlockingEnabled = settings['trackerBlockingEnabled']
                    self.httpsEverywhereEnabled = settings['httpsEverywhereEnabled']
                    self.embeddedTweetsEnabled = settings['embeddedTweetsEnabled']

                    if (settings['activeExperiment'] && (settings['activeExperiment'].name === 'optin_experiment')) {
                        self.trackerBlockingOptIn = true
                    }
                    resolve()
                })
            })
        }
    }
)

module.exports = PrivacyOptions
