import { defineProperty } from '../utils'

export function init () {
    try {
        if (navigator.duckduckgo) return
        defineProperty(Navigator.prototype, 'duckduckgo', {
            value: {
                isExtension () {
                    return true
                },
                isDuckDuckGo () {
                    return true
                }
            },
            enumerable: true,
            configurable: false,
            writable: false
        })
    } catch {
        // todo: Just ignore this exception if a conflict occurs?
    }
}
