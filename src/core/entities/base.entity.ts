import { Expose } from "class-transformer";

export class Base {
  @Expose()
  id?: number;
}
