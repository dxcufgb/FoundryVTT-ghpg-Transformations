let _dialogs = null
export const UiAccessor = {
    get dialogs()
    {
        return _dialogs
    },

    set dialogs(value)
    {
        _dialogs = value
    }
}