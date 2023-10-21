export abstract class BaseService<T> {
  public abstract create(data: any): Promise<T>
//   public abstract update(id: string, data: any): Promise<T>
//   public abstract delete(id: string): Promise<T>
//   public abstract findOne(id: string): Promise<T>
//   public abstract findAll(
//     query: any,
//     options?: {
//       limit?: number
//       skip?: number
//       sort?: any
//     },
//   ): Promise<T[]>
}
