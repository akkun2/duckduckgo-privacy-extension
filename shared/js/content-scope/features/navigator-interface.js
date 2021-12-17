import { defineProperty } from '../utils'

export function init () {
    try {
        if (navigator.ddg) return
        defineProperty(Navigator.prototype, 'ddg', {
            value: {
                isExtension () {
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
