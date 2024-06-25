import { Exclude, Expose, Type } from "class-transformer";
import { Base } from "./base.entity";
import { Test } from "./test.entity";

@Exclude()
export class TestTake extends Base {
  @Expose()
  candidate_name: string;

  @Expose()
  candidate_email: string;

  @Expose()
  started_at?: Date;

  @Expose()
  finished_at?: Date;

  @Expose()
  result?: string;

  @Expose()
  @Type(() => Test)
  test?: Test;
}
