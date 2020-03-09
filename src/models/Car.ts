import { Vehicle } from "./common/Vehicle";
import { VehicleType } from "../enums";

export class Car extends Vehicle {
  constructor({ number, ownerType }: { number: string; ownerType: number }) {
    super(VehicleType.Car, number, ownerType);
  }
}
