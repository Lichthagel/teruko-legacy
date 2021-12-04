export async function waitForElement(selector: (container: Document) => Element | null | undefined, container = document, timeoutSecs = 7): Promise<Element> {
    const element = selector(container);
    if (element) {
        return Promise.resolve(element);
    }

    return new Promise((resolve, reject) => {
        const timeoutTime = Date.now() + timeoutSecs * 1000;

        const handler = () => {
            const element = selector(container);
            if (element) {
                resolve(element);
            } else if (Date.now() > timeoutTime) {
                reject(new Error("Timed out waiting for element"));
            } else {
                setTimeout(handler, 100);
            }
        };

        handler();
    });
}