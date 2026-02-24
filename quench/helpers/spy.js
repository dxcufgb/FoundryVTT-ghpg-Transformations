function createSpy()
{
    const fn = (...args) =>
    {
        fn.called = true
        fn.callCount++
        fn.calls.push(args)
    }
    fn.called = false
    fn.callCount = 0
    fn.calls = []
    return fn
}