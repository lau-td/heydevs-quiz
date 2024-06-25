import { Exclude, Expose } from "class-transformer";
import { Base } from "./base.entity";

@Exclude()
export class Test extends Base {
  @Expose()
  title: string;

  @Expose()
  description: string;

  @Expose()
  duration: number;

  @Expose()
  content_url: string;

  @Expose()
  content_file: string;
}
