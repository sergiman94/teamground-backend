export interface Service<T> {
    getTotal(): Promise<void>
    create(item: T): Promise<void>
    update(key: string, item: T): Promise<void>
    patch?(changes: any): Promise<void>
    save(item: T): Promise<any>
    get(item:T): Promise<T>
    //list(query?: any): Promise<T[]>
    list(query: any)
    delete(item): Promise<void>
}