class DefaultDict<K, V> {
    private store: Map<K, V>;
    private defaultValue: () => V;

    constructor(defaultValue: () => V) {
        this.store = new Map();
        this.defaultValue = defaultValue;
    }

    get(key: K): V {
        if (!this.store.has(key)) {
            this.store.set(key, this.defaultValue());
        }
        return this.store.get(key)!;  // store.get(key) 값은 null이 아니므로 non-null assertion
    }

    set(key: K, value: V): void {
        this.store.set(key, value);
    }
}

export { DefaultDict };